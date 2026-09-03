/**
 * Unified Central Farm Context
 * Smart India Hackathon 2026 - Problem Statement 26131
 *
 * Single Source of Truth for the Active Farmer, Active Farm, Active Crop,
 * Weather, Early Warning Risk, and Observation History.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { LocationService } from '@/services/LocationService';
import { WeatherService } from '@/services/WeatherService';
import { RiskAssessmentService, type RiskAssessmentResult } from '@/services/RiskAssessmentService';
import { ObservationService, type CropObservationEntity } from '@/services/ObservationService';
import { AuthService, type UserProfile } from '@/services/AuthService';
import type { GeoLocation, WeatherDataBundle } from '@/services/types';
import type { ActiveFarmData } from '@/components/ActiveFarmBar';

export interface FarmContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  activeFarm: ActiveFarmData | null;
  setActiveFarm: (farm: ActiveFarmData) => void;
  activeLocation: GeoLocation;
  weather: WeatherDataBundle | null;
  risk: RiskAssessmentResult | null;
  latestObservation: CropObservationEntity | null;
  isLoading: boolean;
  refreshContext: () => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_FARM: ActiveFarmData = {
  id: 'default_farm',
  farm_name: 'Primary Cotton Field',
  state: 'Maharashtra',
  district: 'Yavatmal',
  taluka: 'Yavatmal',
  village: 'Bori',
  latitude: 20.3888,
  longitude: 78.1204,
  area_acres: 2.5,
  soil_type: 'Black Cotton Soil',
  irrigation_type: 'Drip Irrigation',
  crop: {
    name: 'Cotton',
    variety: 'Bt Cotton',
    sowing_date: '2026-06-15',
    stage: 'Flowering Stage',
  },
};

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  // 1. Current Authenticated User State
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('crophealth_active_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  // 2. Active Farm State
  const [activeFarm, setActiveFarmState] = useState<ActiveFarmData>(() => {
    try {
      const stored = localStorage.getItem('crophealth_active_farm');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_FARM;
  });

  const [activeLocation, setActiveLocation] = useState<GeoLocation>(() => {
    return LocationService.getSavedLocation();
  });

  const [weather, setWeather] = useState<WeatherDataBundle | null>(null);
  const [risk, setRisk] = useState<RiskAssessmentResult | null>(null);
  const [latestObservation, setLatestObservation] = useState<CropObservationEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Current User with Supabase Auth Listener
  useEffect(() => {
    AuthService.getCurrentUser().then((user) => {
      if (user) {
        setCurrentUserState(user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await AuthService.getCurrentUser();
        setCurrentUserState(profile);
      } else {
        const local = localStorage.getItem('crophealth_active_user');
        if (!local) setCurrentUserState(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const setCurrentUser = useCallback((user: UserProfile | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('crophealth_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('crophealth_active_user');
    }
  }, []);

  const logout = useCallback(async () => {
    await AuthService.signOut();
    setCurrentUserState(null);
    localStorage.removeItem('crophealth_active_user');
  }, []);

  const setActiveFarm = useCallback((farm: ActiveFarmData) => {
    setActiveFarmState(farm);
    try {
      localStorage.setItem('crophealth_active_farm', JSON.stringify(farm));
    } catch {}

    const loc: GeoLocation = {
      latitude: farm.latitude,
      longitude: farm.longitude,
      state: farm.state,
      district: farm.district,
      taluka: farm.taluka,
      village: farm.village,
      isGPSDetected: false,
      accuracyMeters: 1000,
      source: 'Active Farm Coordinates',
    };
    LocationService.saveLocation(loc);
    setActiveLocation(loc);
  }, []);

  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live real weather for active farm coordinates
      const loc: GeoLocation = {
        latitude: activeFarm?.latitude || 20.3888,
        longitude: activeFarm?.longitude || 78.1204,
        state: activeFarm?.state || 'Maharashtra',
        district: activeFarm?.district || 'Yavatmal',
        taluka: activeFarm?.taluka || 'Yavatmal',
        village: activeFarm?.village || 'Bori',
        isGPSDetected: false,
        accuracyMeters: 1000,
        source: 'Active Farm Coordinates',
      };

      const weatherBundle = await WeatherService.fetchRealWeather(loc);
      setWeather(weatherBundle);

      // 2. Compute Explainable Pest Risk for active crop
      const computedRisk = await RiskAssessmentService.evaluateCropRisk({
        farmId: activeFarm?.id || 'default_farm',
        cropName: activeFarm?.crop?.name || 'Cotton',
        cropStage: activeFarm?.crop?.stage || 'Flowering Stage',
        weather: weatherBundle,
        district: activeFarm?.district || 'Yavatmal',
        state: activeFarm?.state || 'Maharashtra',
      });
      setRisk(computedRisk);

      // 3. Fetch latest field observation
      try {
        const farmerId = currentUser?.id || 'farmer_guest';
        const history = await ObservationService.getFarmerObservations(farmerId);
        if (history && history.length > 0) {
          setLatestObservation(history[0]);
        }
      } catch (obsErr) {
        console.warn('History fetch warning:', obsErr);
      }
    } catch (err) {
      console.warn('FarmContext refresh warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFarm, currentUser]);

  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  return (
    <FarmContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeFarm,
        setActiveFarm,
        activeLocation,
        weather,
        risk,
        latestObservation,
        isLoading,
        refreshContext,
        logout,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarmContext() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarmContext must be used within a FarmProvider');
  }
  return context;
}
