import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createSafeClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createClient('https://placeholder.supabase.co', 'placeholder');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSafeClient();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');

// ============================================================================
// Core Database Entity Types (Phase 1.5)
// ============================================================================

export type UserRole = 'farmer' | 'expert' | 'officer' | 'admin';

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  language: string;
  created_at: string;
  updated_at: string;
};

export type Farm = {
  id: string;
  farmer_id: string;
  farm_name: string;
  state: string;
  district: string;
  taluka: string | null;
  village: string | null;
  latitude: number | null;
  longitude: number | null;
  area_acres: number;
  soil_type: string | null;
  irrigation_type: string | null;
  created_at: string;
  updated_at: string;
};

export type Crop = {
  id: string;
  name: string;
  scientific_name: string | null;
  category: 'Cereals' | 'Cash Crops' | 'Pulses' | 'Oilseeds' | 'Vegetables' | 'Horticulture' | 'Other';
  created_at: string;
  updated_at: string;
};

export type FarmCrop = {
  id: string;
  farm_id: string;
  crop_id: string;
  variety: string | null;
  sowing_date: string;
  expected_harvest_date: string | null;
  current_stage: string;
  area_acres: number;
  status: 'active' | 'harvested' | 'failed' | 'planned';
  created_at: string;
  updated_at: string;
};

export type Disease = {
  id: string;
  name: string;
  scientific_name: string | null;
  description: string | null;
  symptoms: string | null;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
};

export type Pest = {
  id: string;
  name: string;
  scientific_name: string | null;
  description: string | null;
  symptoms: string | null;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
};

export type ObservationStatus = 'submitted' | 'processing' | 'diagnosed' | 'pending_expert' | 'verified' | 'closed';

export type CropObservation = {
  id: string;
  farm_id: string | null;
  farm_crop_id: string | null;
  reported_by: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ObservationStatus;
  observed_at: string;
  created_at: string;
  updated_at: string;
};

export type ObservationImage = {
  id: string;
  observation_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

export type DiagnosisStatus = 'suspected' | 'pending_review' | 'expert_verified' | 'rejected' | 'unknown';

export type Diagnosis = {
  id: string;
  observation_id: string;
  disease_id: string | null;
  pest_id: string | null;
  confidence: number;
  model_name: string;
  model_version: string;
  diagnosis_status: DiagnosisStatus;
  created_at: string;
  updated_at: string;
};

export type ExpertDecision = 'confirmed' | 'rejected' | 'needs_more_information';

export type ExpertReview = {
  id: string;
  observation_id: string;
  diagnosis_id: string | null;
  expert_id: string;
  decision: ExpertDecision;
  comments: string | null;
  recommended_action: string | null;
  reviewed_at: string;
  created_at: string;
};

// Legacy types for compatibility with existing components
export type CropReport = {
  id: string;
  reporter_name: string;
  crop_type: string;
  crop_stage: string | null;
  variety: string | null;
  soil_condition: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  symptom_description: string | null;
  detected_disease: string | null;
  confidence_score: number;
  severity: string;
  status: string;
  language: string;
  created_at: string;
};

export type PestTrap = {
  id: string;
  trap_id: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  pest_type: string;
  count: number;
  crop_type: string;
  risk_level: string;
  observation_date: string;
  notes: string | null;
  created_at: string;
};

export type DiseaseHotspot = {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  disease_type: string;
  intensity: string;
  affected_area_acres: number;
  crop_type: string;
  status: string;
  created_at: string;
};

export type WeatherRisk = {
  id: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  wind_speed: number | null;
  risk_level: string;
  disease_risk: string | null;
  forecast_date: string;
  created_at: string;
};

export type ExpertValidation = {
  id: string;
  report_id: string;
  expert_name: string;
  validation_status: string;
  expert_notes: string | null;
  recommended_action: string | null;
  created_at: string;
};

export type FollowUp = {
  id: string;
  report_id: string;
  action_required: string;
  due_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type Advisory = {
  id: string;
  title_key: string;
  category: string;
  crop_type: string | null;
  disease_type: string | null;
  severity: string;
  region: string | null;
  created_at: string;
};
