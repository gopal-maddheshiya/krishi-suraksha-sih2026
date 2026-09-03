/**
 * Crop Observation & Expert Review Service Layer
 * Handles farmer field submissions, Supabase Storage uploads, automated diagnoses,
 * and certified KVK scientist validations with immutable audit trails.
 */

import { supabase } from '@/lib/supabase';
import { DiseaseService } from './DiseaseService';

export interface CropObservationEntity {
  id: string;
  farm_id?: string;
  farm_crop_id?: string;
  reported_by: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'submitted' | 'processing' | 'diagnosed' | 'pending_expert' | 'verified' | 'closed';
  assigned_expert_id?: string;
  assigned_at?: string;
  observed_at: string;
  created_at: string;
  updated_at: string;
  images?: ObservationImageEntity[];
  diagnoses?: DiagnosisEntity[];
  expert_reviews?: ExpertReviewEntity[];
  farm?: {
    farm_name: string;
    state: string;
    district: string;
    taluka?: string;
    area_acres: number;
  };
  farm_crop?: {
    current_stage: string;
    variety?: string;
    crop?: {
      name: string;
      scientific_name?: string;
    };
  };
}

export interface ObservationImageEntity {
  id: string;
  observation_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface DiagnosisEntity {
  id: string;
  observation_id: string;
  disease_id?: string;
  pest_id?: string;
  confidence: number;
  model_name: string;
  model_version: string;
  diagnosis_status: 'suspected' | 'pending_review' | 'expert_verified' | 'rejected' | 'unknown';
  created_at: string;
  updated_at: string;
  disease?: {
    name: string;
    scientific_name?: string;
    severity: string;
  };
  pest?: {
    name: string;
    scientific_name?: string;
    severity: string;
  };
}

export interface ExpertReviewEntity {
  id: string;
  observation_id: string;
  diagnosis_id?: string;
  expert_id: string;
  decision: 'confirmed' | 'rejected' | 'needs_more_information';
  expert_diagnosis?: string;
  diagnosis_category?: 'disease' | 'pest' | 'nutrient_deficiency' | 'healthy' | 'unable_to_determine';
  affected_plant_part?: 'leaf' | 'stem' | 'fruit_boll' | 'flower' | 'root' | 'whole_plant';
  severity?: 'low' | 'moderate' | 'severe';
  requested_information?: string;
  comments?: string;
  recommended_action?: string;
  review_started_at?: string;
  review_completed_at?: string;
  reviewed_at: string;
  created_at: string;
  expert?: {
    full_name: string;
    role: string;
  };
}

export class ObservationService {
  /**
   * Upload observation image file to Supabase Storage bucket 'crop-observations'
   */
  public static async uploadObservationImage(
    observationId: string,
    file: File
  ): Promise<ObservationImageEntity | null> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const storagePath = `${observationId}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('crop-observations')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: record, error: recordError } = await supabase
        .from('observation_images')
        .insert({
          observation_id: observationId,
          storage_path: storagePath,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (recordError) throw recordError;
      return record;
    } catch (e) {
      console.error('ObservationService.uploadObservationImage error:', e);
      throw e;
    }
  }

  /**
   * Submit a new field observation with preliminary screening diagnosis
   */
  public static async submitFieldObservation(payload: {
    reported_by: string;
    farm_id?: string;
    farm_crop_id?: string;
    crop_name: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    imageFile?: File;
  }): Promise<CropObservationEntity | null> {
    try {
      // 1. Create crop_observation record
      const { data: observation, error: obsError } = await supabase
        .from('crop_observations')
        .insert({
          reported_by: payload.reported_by,
          farm_id: payload.farm_id || null,
          farm_crop_id: payload.farm_crop_id || null,
          description: payload.description || null,
          latitude: payload.latitude || null,
          longitude: payload.longitude || null,
          priority: 'normal',
          status: 'submitted',
          observed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (obsError) throw obsError;

      // 2. Upload image if provided
      if (payload.imageFile && observation) {
        await this.uploadObservationImage(observation.id, payload.imageFile);
      }

      // 3. Execute preliminary screening & log initial diagnosis
      const screening = DiseaseService.evaluatePreliminaryDiagnosis(payload.crop_name, payload.description);

      if (screening.isIdentified && observation) {
        await supabase.from('diagnoses').insert({
          observation_id: observation.id,
          confidence: screening.confidenceScore,
          model_name: 'AgriVision-HeuristicEngine',
          model_version: 'v1.0.0',
          diagnosis_status: 'suspected',
        });
      }

      return observation;
    } catch (e) {
      console.error('ObservationService.submitFieldObservation error:', e);
      throw e;
    }
  }

  /**
   * Get observation history for a farmer
   */
  public static async getFarmerObservations(farmerId?: string): Promise<CropObservationEntity[]> {
    try {
      let query = supabase
        .from('crop_observations')
        .select(`
          *,
          images:observation_images(*),
          diagnoses:diagnoses(*),
          expert_reviews:expert_reviews(*, expert:profiles(full_name, role))
        `)
        .order('observed_at', { ascending: false });

      if (farmerId && farmerId !== 'farmer_guest' && farmerId !== 'farmer_active' && farmerId.includes('-')) {
        query = query.eq('reported_by', farmerId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        const localCache = localStorage.getItem('crophealth_observations_cache');
        if (localCache) {
          try {
            return JSON.parse(localCache);
          } catch {}
        }
        return [];
      }
      return data;
    } catch (e) {
      console.warn('ObservationService.getFarmerObservations exception:', e);
      const localCache = localStorage.getItem('crophealth_observations_cache');
      if (localCache) {
        try {
          return JSON.parse(localCache);
        } catch {}
      }
      return [];
    }
  }

  /**
   * Fetch observations queue for KVK Agricultural Scientist portal
   */
  public static async getExpertReviewQueue(statusFilter?: string): Promise<CropObservationEntity[]> {
    try {
      let query = supabase
        .from('crop_observations')
        .select(`
          *,
          images:observation_images(*),
          diagnoses:diagnoses(*),
          expert_reviews:expert_reviews(*, expert:profiles(full_name, role)),
          farm:farms(farm_name, state, district, taluka, area_acres),
          farm_crop:farm_crops(current_stage, variety, crop:crops(name, scientific_name))
        `)
        .order('observed_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        const cached = localStorage.getItem('crophealth_observations_cache');
        if (cached) {
          try {
            const parsed: CropObservationEntity[] = JSON.parse(cached);
            if (statusFilter && statusFilter !== 'all') {
              return parsed.filter((p) => p.status === statusFilter);
            }
            return parsed;
          } catch {}
        }
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn('getExpertReviewQueue exception:', e);
      const cached = localStorage.getItem('crophealth_observations_cache');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
      return [];
    }
  }

  /**
   * Claim an observation for review (Assignment)
   */
  public static async claimObservation(observationId: string, expertId: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('crop_observations')
        .update({
          assigned_expert_id: expertId,
          assigned_at: now,
          status: 'processing',
        })
        .eq('id', observationId);

      if (error) throw error;

      // Log audit trail
      await supabase.from('expert_audit_logs').insert({
        observation_id: observationId,
        expert_id: expertId,
        action: 'review_claimed',
        decision: 'in_review',
        details: { claimed_at: now },
      });

      return true;
    } catch (e) {
      console.error('claimObservation error:', e);
      return false;
    }
  }

  /**
   * Submit certified KVK expert structured review
   */
  public static async submitExpertReview(review: {
    observation_id: string;
    diagnosis_id?: string;
    expert_id: string;
    decision: 'confirmed' | 'rejected' | 'needs_more_information';
    expert_diagnosis?: string;
    diagnosis_category?: 'disease' | 'pest' | 'nutrient_deficiency' | 'healthy' | 'unable_to_determine';
    affected_plant_part?: 'leaf' | 'stem' | 'fruit_boll' | 'flower' | 'root' | 'whole_plant';
    severity?: 'low' | 'moderate' | 'severe';
    requested_information?: string;
    comments?: string;
    recommended_action?: string;
  }): Promise<ExpertReviewEntity | null> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('expert_reviews')
        .insert({
          ...review,
          reviewed_at: now,
          review_completed_at: now,
        })
        .select('*, expert:profiles(full_name, role)')
        .single();

      if (error) throw error;

      // Determine updated status
      const nextStatus =
        review.decision === 'confirmed'
          ? 'verified'
          : review.decision === 'needs_more_information'
          ? 'pending_expert'
          : 'diagnosed';

      await supabase
        .from('crop_observations')
        .update({ status: nextStatus })
        .eq('id', review.observation_id);

      // Audit Log
      await supabase.from('expert_audit_logs').insert({
        observation_id: review.observation_id,
        expert_id: review.expert_id,
        action: review.decision === 'confirmed' ? 'review_confirmed' : review.decision === 'rejected' ? 'review_rejected' : 'more_info_requested',
        decision: review.decision,
        details: {
          expert_diagnosis: review.expert_diagnosis,
          severity: review.severity,
          comments: review.comments,
        },
      });

      return data;
    } catch (e) {
      console.error('ObservationService.submitExpertReview error:', e);
      throw e;
    }
  }
}
