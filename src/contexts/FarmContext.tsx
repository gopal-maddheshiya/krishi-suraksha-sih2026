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
import type { GeoLocation, WeatherDataBundle } from '@/services/types';
import type { ActiveFarmData } from '@/components/ActiveFarmBar';

export interface FarmContextType {
  activeFarm: ActiveFarmData | null;
  setActiveFarm: (farm: ActiveFarmData) => void;
  activeLocation: GeoLocation;
  weather: WeatherDataBundle | null;
  risk: RiskAssessmentResult | null;
  latestObservation: CropObservationEntity | null;
  isLoading: boolean;
  refreshContext: () => Promise<void>;
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
      const loc = {
        latitude: activeFarm?.latitude || 20.3888,
        longitude: activeFarm?.longitude || 78.1204,
        state: activeFarm?.state || 'Maharashtra',
        district: activeFarm?.district || 'Yavatmal',
        source: 'gps' as const,
      };
      
      const weatherData = await WeatherService.fetchRealWeather(loc).catch(() => null);
      setWeather(weatherData);

      // 2. Calculate dynamic risk using real weather and crop stage
      if (weatherData && activeFarm) {
        const riskData = await RiskAssessmentService.evaluateCropRisk({
          farmId: activeFarm.id,
          cropName: activeFarm.crop?.name || 'Cotton',
          cropStage: activeFarm.crop?.stage || 'Flowering Stage',
          weather: weatherData,
          district: activeFarm.district,
          state: activeFarm.state,
        }).catch(() => null);
        setRisk(riskData);
      }

      // 3. Fetch latest real observation for active user
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const observations = await ObservationService.getFarmerObservations(authData.user.id).catch(() => []);
        if (observations && observations.length > 0) {
          setLatestObservation(observations[0]);
        } else {
          setLatestObservation(null);
        }
      }
    } catch (e) {
      console.warn('FarmProvider refresh error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeFarm]);

  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  return (
    <FarmContext.Provider
      value={{
        activeFarm,
        setActiveFarm,
        activeLocation,
        weather,
        risk,
        latestObservation,
        isLoading,
        refreshContext,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarmContext(): FarmContextType {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarmContext must be used within a FarmProvider');
  }
  return context;
}
