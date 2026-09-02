-- ============================================================================
-- 20260903000007_unified_all_in_one_setup.sql
-- Smart India Hackathon 2026 | Problem Statement 26131
-- COMPLETE SELF-CONTAINED DATABASE SETUP (Zero Dependency Errors)
-- ============================================================================

-- 1. Table: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'expert', 'officer', 'admin')),
  preferred_language TEXT NOT NULL DEFAULT 'hi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table: FARMS
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT,
  village TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  area_acres NUMERIC(6, 2) NOT NULL DEFAULT 2.0,
  soil_type TEXT,
  irrigation_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table: CROPS
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  category TEXT NOT NULL DEFAULT 'Kharif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table: FARM_CROPS
CREATE TABLE IF NOT EXISTS public.farm_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  variety TEXT,
  sowing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_harvest_date DATE,
  current_stage TEXT NOT NULL DEFAULT 'Vegetative Stage',
  area_acres NUMERIC(6, 2) NOT NULL DEFAULT 2.0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'failed', 'planned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Table: CROP_OBSERVATIONS
CREATE TABLE IF NOT EXISTS public.crop_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  farm_crop_id UUID REFERENCES public.farm_crops(id) ON DELETE SET NULL,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'diagnosed', 'pending_expert', 'verified', 'closed')),
  assigned_expert_id UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Table: OBSERVATION_IMAGES
CREATE TABLE IF NOT EXISTS public.observation_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.crop_observations(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Table: DIAGNOSES
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.crop_observations(id) ON DELETE CASCADE,
  disease_id UUID,
  pest_id UUID,
  confidence NUMERIC(5, 2) NOT NULL,
  model_name TEXT NOT NULL DEFAULT 'Google Gemini Multimodal Vision',
  model_version TEXT NOT NULL DEFAULT 'v2.5-flash',
  diagnosis_status TEXT NOT NULL DEFAULT 'suspected' CHECK (diagnosis_status IN ('suspected', 'pending_review', 'expert_verified', 'rejected', 'unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Table: EXPERT_REVIEWS
CREATE TABLE IF NOT EXISTS public.expert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.crop_observations(id) ON DELETE CASCADE,
  diagnosis_id UUID REFERENCES public.diagnoses(id) ON DELETE SET NULL,
  expert_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('confirmed', 'rejected', 'needs_more_information')),
  expert_diagnosis TEXT,
  comments TEXT,
  recommended_action TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Table: RISK_ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  farm_crop_id UUID REFERENCES public.farm_crops(id) ON DELETE SET NULL,
  crop_name TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  primary_risk_factor TEXT NOT NULL,
  contributing_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rule_version TEXT NOT NULL DEFAULT 'risk-rules-v1.0',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Table: IN_APP_ALERTS
CREATE TABLE IF NOT EXISTS public.in_app_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'disease_risk_warning',
  title TEXT NOT NULL,
  title_hi TEXT,
  title_mr TEXT,
  message TEXT NOT NULL,
  message_hi TEXT,
  message_mr TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  dedup_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Table: WEATHER_OBSERVATIONS
CREATE TABLE IF NOT EXISTS public.weather_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  temperature_c DOUBLE PRECISION NOT NULL,
  relative_humidity_pct DOUBLE PRECISION NOT NULL,
  precipitation_mm DOUBLE PRECISION NOT NULL,
  wind_speed_kmh DOUBLE PRECISION NOT NULL,
  weather_condition TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_observations ENABLE ROW LEVEL SECURITY;

-- 13. Enable RLS Policies
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users manage own farms" ON public.farms;
CREATE POLICY "Users manage own farms" ON public.farms FOR ALL USING (farmer_id = auth.uid() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public read crops" ON public.crops;
CREATE POLICY "Public read crops" ON public.crops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage farm crops" ON public.farm_crops;
CREATE POLICY "Users manage farm crops" ON public.farm_crops FOR ALL USING (true);

DROP POLICY IF EXISTS "Users manage observations" ON public.crop_observations;
CREATE POLICY "Users manage observations" ON public.crop_observations FOR ALL USING (reported_by = auth.uid() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users manage observation images" ON public.observation_images;
CREATE POLICY "Users manage observation images" ON public.observation_images FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read diagnoses" ON public.diagnoses;
CREATE POLICY "Public read diagnoses" ON public.diagnoses FOR ALL USING (true);

DROP POLICY IF EXISTS "Public manage expert reviews" ON public.expert_reviews;
CREATE POLICY "Public manage expert reviews" ON public.expert_reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "Public manage risk assessments" ON public.risk_assessments;
CREATE POLICY "Public manage risk assessments" ON public.risk_assessments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public manage in_app_alerts" ON public.in_app_alerts;
CREATE POLICY "Public manage in_app_alerts" ON public.in_app_alerts FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read weather" ON public.weather_observations;
CREATE POLICY "Public read weather" ON public.weather_observations FOR ALL USING (true);

-- 14. Automatic Profile Trigger on Signup (Phone / Google)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    role,
    preferred_language,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Farmer'),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'hi'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Enable Real-Time Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.farms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.farm_crops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crop_observations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diagnoses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expert_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.in_app_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_observations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_assessments;
