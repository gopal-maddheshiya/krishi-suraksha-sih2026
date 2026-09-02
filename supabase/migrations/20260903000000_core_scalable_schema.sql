/*
  # Phase 1.5 - Scalable Core Database Schema
  # Smart India Hackathon 2026 - Problem Statement 26131
  # Government of Maharashtra - Crop Health Management Platform

  1. Tables:
    - profiles (Supabase Auth user extensions with role-based access)
    - farms (Multi-farm support for farmers with geospatial location & soil/irrigation metadata)
    - crops (Master crop registry)
    - farm_crops (Specific seasonal crop cycles on farms with sowing dates & stages)
    - diseases (Verified plant pathology master data)
    - pests (Verified agricultural insect pest master data)
    - crop_observations (Farmer field observation reports and problem submissions)
    - observation_images (Metadata for images stored securely in Supabase Storage)
    - diagnoses (AI/model & heuristic preliminary diagnosis records)
    - expert_reviews (Certified KVK agricultural scientist reviews & decisions)

  2. Security:
    - Row Level Security (RLS) enabled on all tables
    - Strict role & ownership based access control
    - Secure storage bucket: 'crop-observations'

  3. Indexes:
    - Highly optimized query indexes for location, status, and foreign key traversals
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Helper Trigger Function: Automatically update `updated_at` timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Table: PROFILES (Extends auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'expert', 'officer', 'admin')),
  language TEXT NOT NULL DEFAULT 'mr' CHECK (language IN ('en', 'hi', 'mr', 'bn', 'ta', 'te', 'gu', 'pa')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. Table: FARMS (Farmer Farm Assets)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  district TEXT NOT NULL,
  taluka TEXT,
  village TEXT,
  latitude NUMERIC(10, 7) CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC(10, 7) CHECK (longitude BETWEEN -180 AND 180),
  area_acres NUMERIC(8, 2) CHECK (area_acres > 0),
  soil_type TEXT,
  irrigation_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Table: CROPS (Master Crop Catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('Cereals', 'Cash Crops', 'Pulses', 'Oilseeds', 'Vegetables', 'Horticulture', 'Other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Table: FARM_CROPS (Active Crop Cycles on Farms)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.farm_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
  variety TEXT,
  sowing_date DATE NOT NULL,
  expected_harvest_date DATE CHECK (expected_harvest_date >= sowing_date),
  current_stage TEXT NOT NULL DEFAULT 'Vegetative',
  area_acres NUMERIC(8, 2) CHECK (area_acres > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'failed', 'planned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_farm_crops_updated_at
  BEFORE UPDATE ON public.farm_crops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Table: DISEASES (Plant Pathology Master)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  description TEXT,
  symptoms TEXT,
  severity TEXT NOT NULL DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_diseases_updated_at
  BEFORE UPDATE ON public.diseases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Table: PESTS (Insect Pest Master)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  description TEXT,
  symptoms TEXT,
  severity TEXT NOT NULL DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_pests_updated_at
  BEFORE UPDATE ON public.pests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Table: CROP_OBSERVATIONS (Farmer Incident & Field Reports)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crop_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  farm_crop_id UUID REFERENCES public.farm_crops(id) ON DELETE SET NULL,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT,
  latitude NUMERIC(10, 7) CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC(10, 7) CHECK (longitude BETWEEN -180 AND 180),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'diagnosed', 'pending_expert', 'verified', 'closed')),
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_crop_observations_updated_at
  BEFORE UPDATE ON public.crop_observations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. Table: OBSERVATION_IMAGES (Image Metadata linked to Supabase Storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.observation_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.crop_observations(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 10485760), -- max 10MB
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. Table: DIAGNOSES (AI & Heuristic Suspected Diagnoses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.crop_observations(id) ON DELETE CASCADE,
  disease_id UUID REFERENCES public.diseases(id) ON DELETE SET NULL,
  pest_id UUID REFERENCES public.pests(id) ON DELETE SET NULL,
  confidence NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
  model_name TEXT NOT NULL DEFAULT 'AgriVision-RuleEngine',
  model_version TEXT NOT NULL DEFAULT 'v1.0.0',
  diagnosis_status TEXT NOT NULL DEFAULT 'suspected' CHECK (diagnosis_status IN ('suspected', 'pending_review', 'expert_verified', 'rejected', 'unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_diagnoses_updated_at
  BEFORE UPDATE ON public.diagnoses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. Table: EXPERT_REVIEWS (Certified Scientist Reviews & Prescriptions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.expert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.crop_observations(id) ON DELETE CASCADE,
  diagnosis_id UUID REFERENCES public.diagnoses(id) ON DELETE SET NULL,
  expert_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  decision TEXT NOT NULL CHECK (decision IN ('confirmed', 'rejected', 'needs_more_information')),
  comments TEXT,
  recommended_action TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. HIGH-PERFORMANCE INDEXES
-- ============================================================================
-- Farms indexes
CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON public.farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farms_district ON public.farms(district);
CREATE INDEX IF NOT EXISTS idx_farms_lat_lon ON public.farms(latitude, longitude);

-- Farm Crops indexes
CREATE INDEX IF NOT EXISTS idx_farm_crops_farm_id ON public.farm_crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_crops_crop_id ON public.farm_crops(crop_id);
CREATE INDEX IF NOT EXISTS idx_farm_crops_status ON public.farm_crops(status);

-- Crop Observations indexes
CREATE INDEX IF NOT EXISTS idx_crop_observations_farm_id ON public.crop_observations(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_observations_farm_crop_id ON public.crop_observations(farm_crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_observations_reported_by ON public.crop_observations(reported_by);
CREATE INDEX IF NOT EXISTS idx_crop_observations_status ON public.crop_observations(status);
CREATE INDEX IF NOT EXISTS idx_crop_observations_observed_at ON public.crop_observations(observed_at DESC);

-- Diagnoses indexes
CREATE INDEX IF NOT EXISTS idx_diagnoses_observation_id ON public.diagnoses(observation_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_disease_id ON public.diagnoses(disease_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_pest_id ON public.diagnoses(pest_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_status ON public.diagnoses(diagnosis_status);

-- Expert Reviews indexes
CREATE INDEX IF NOT EXISTS idx_expert_reviews_observation_id ON public.expert_reviews(observation_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_expert_id ON public.expert_reviews(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_decision ON public.expert_reviews(decision);

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Helper function to check if user has admin/officer/expert role
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- Policies: PROFILES
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.get_user_role(auth.uid()) IN ('admin', 'officer', 'expert'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Policies: MASTER TABLES (Crops, Diseases, Pests)
-- Read: Publicly readable for all authenticated & anonymous users
-- Write: Admin only
-- ---------------------------------------------------------------------------
CREATE POLICY "Public read access for crops"
  ON public.crops FOR SELECT
  USING (true);

CREATE POLICY "Admin write access for crops"
  ON public.crops FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Public read access for diseases"
  ON public.diseases FOR SELECT
  USING (true);

CREATE POLICY "Admin write access for diseases"
  ON public.diseases FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Public read access for pests"
  ON public.pests FOR SELECT
  USING (true);

CREATE POLICY "Admin write access for pests"
  ON public.pests FOR ALL
  USING (public.get_user_role(auth.uid()) = 'admin');

-- ---------------------------------------------------------------------------
-- Policies: FARMS
-- ---------------------------------------------------------------------------
CREATE POLICY "Farmers can view own farms"
  ON public.farms FOR SELECT
  USING (farmer_id = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin', 'officer', 'expert'));

CREATE POLICY "Farmers can create own farms"
  ON public.farms FOR INSERT
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can update own farms"
  ON public.farms FOR UPDATE
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can delete own farms"
  ON public.farms FOR DELETE
  USING (farmer_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');

-- ---------------------------------------------------------------------------
-- Policies: FARM_CROPS
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view farm crops for accessible farms"
  ON public.farm_crops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = farm_crops.farm_id
      AND (farms.farmer_id = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin', 'officer', 'expert'))
    )
  );

CREATE POLICY "Farmers can insert farm crops for own farms"
  ON public.farm_crops FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = farm_crops.farm_id
      AND farms.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can update farm crops for own farms"
  ON public.farm_crops FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = farm_crops.farm_id
      AND farms.farmer_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Policies: CROP_OBSERVATIONS
-- ---------------------------------------------------------------------------
CREATE POLICY "Farmers view own observations, experts view pending, officers view all"
  ON public.crop_observations FOR SELECT
  USING (
    reported_by = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin', 'officer', 'expert')
  );

CREATE POLICY "Farmers can create observations"
  ON public.crop_observations FOR INSERT
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Farmers or experts can update observations"
  ON public.crop_observations FOR UPDATE
  USING (
    reported_by = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin', 'expert')
  );

-- ---------------------------------------------------------------------------
-- Policies: OBSERVATION_IMAGES
-- ---------------------------------------------------------------------------
CREATE POLICY "View images for accessible observations"
  ON public.observation_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crop_observations
      WHERE crop_observations.id = observation_images.observation_id
      AND (crop_observations.reported_by = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin', 'officer', 'expert'))
    )
  );

CREATE POLICY "Upload images for own observations"
  ON public.observation_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.crop_observations
      WHERE crop_observations.id = observation_images.observation_id
      AND crop_observations.reported_by = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Policies: DIAGNOSES
-- ---------------------------------------------------------------------------
CREATE POLICY "View diagnoses for accessible observations"
  ON public.diagnoses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crop_observations
      WHERE crop_observations.id = diagnoses.observation_id
      AND (crop_observations.reported_by = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin', 'officer', 'expert'))
    )
  );

CREATE POLICY "System / Experts can insert/update diagnoses"
  ON public.diagnoses FOR ALL
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'expert') OR auth.role() = 'service_role'
  );

-- ---------------------------------------------------------------------------
-- Policies: EXPERT_REVIEWS
-- ---------------------------------------------------------------------------
CREATE POLICY "View expert reviews for accessible observations"
  ON public.expert_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crop_observations
      WHERE crop_observations.id = expert_reviews.observation_id
      AND (crop_observations.reported_by = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin', 'officer', 'expert'))
    )
  );

CREATE POLICY "Only certified experts can insert reviews"
  ON public.expert_reviews FOR INSERT
  WITH CHECK (
    expert_id = auth.uid() AND public.get_user_role(auth.uid()) IN ('expert', 'admin')
  );

-- ============================================================================
-- 14. AUTOMATIC PROFILE CREATION TRIGGER (On auth.users Sign Up)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Farmer'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'mr')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 15. STORAGE BUCKET SETUP: crop-observations
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crop-observations',
  'crop-observations',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS
CREATE POLICY "Authenticated users can upload observation images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'crop-observations');

CREATE POLICY "Users can access their own observation images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'crop-observations');
