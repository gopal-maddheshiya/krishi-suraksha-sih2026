/**
 * Farm Management Service Layer
 * Encapsulates all operations for farmer profiles, farms, and farm crop cycles.
 */

import { supabase } from '@/lib/supabase';

export interface FarmEntity {
  id: string;
  farmer_id: string;
  farm_name: string;
  state: string;
  district: string;
  taluka?: string;
  village?: string;
  latitude: number;
  longitude: number;
  area_acres: number;
  soil_type?: string;
  irrigation_type?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmCropEntity {
  id: string;
  farm_id: string;
  crop_id: string;
  variety?: string;
  sowing_date: string;
  expected_harvest_date?: string;
  current_stage: string;
  area_acres: number;
  status: 'active' | 'harvested' | 'failed' | 'planned';
  created_at: string;
  updated_at: string;
  crop?: {
    name: string;
    scientific_name?: string;
    category: string;
  };
}

export class FarmService {
  /**
   * Fetch all farms owned by a specific farmer
   */
  public static async getFarmerFarms(farmerId: string): Promise<FarmEntity[]> {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch farms error:', error.message);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn('FarmService.getFarmerFarms exception:', e);
      return [];
    }
  }

  /**
   * Register a new farm
   */
  public static async createFarm(farm: Omit<FarmEntity, 'id' | 'created_at' | 'updated_at'>): Promise<FarmEntity | null> {
    try {
      // Validate inputs
      if (farm.area_acres <= 0) throw new Error('Farm area must be greater than 0 acres');
      if (farm.latitude < -90 || farm.latitude > 90) throw new Error('Invalid latitude');
      if (farm.longitude < -180 || farm.longitude > 180) throw new Error('Invalid longitude');

      const { data, error } = await supabase
        .from('farms')
        .insert(farm)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('FarmService.createFarm error:', e);
      throw e;
    }
  }

  /**
   * Fetch crop cycles for a specific farm
   */
  public static async getFarmCrops(farmId: string): Promise<FarmCropEntity[]> {
    try {
      const { data, error } = await supabase
        .from('farm_crops')
        .select('*, crop:crops(name, scientific_name, category)')
        .eq('farm_id', farmId)
        .order('sowing_date', { ascending: false });

      if (error) {
        console.warn('Supabase fetch farm_crops error:', error.message);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn('FarmService.getFarmCrops exception:', e);
      return [];
    }
  }

  /**
   * Register a new seasonal crop cycle on a farm
   */
  public static async addCropToFarm(cropData: Omit<FarmCropEntity, 'id' | 'created_at' | 'updated_at' | 'crop'>): Promise<FarmCropEntity | null> {
    try {
      if (cropData.area_acres <= 0) throw new Error('Crop area must be greater than 0 acres');

      const { data, error } = await supabase
        .from('farm_crops')
        .insert(cropData)
        .select('*, crop:crops(name, scientific_name, category)')
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('FarmService.addCropToFarm error:', e);
      throw e;
    }
  }
}
