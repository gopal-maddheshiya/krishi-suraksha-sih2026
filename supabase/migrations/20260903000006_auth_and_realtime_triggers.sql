-- ============================================================================
-- 20260903000006_auth_and_realtime_triggers.sql
-- Smart India Hackathon 2026 | Problem Statement 26131
-- Auto Profile Creation Trigger + Realtime Publications for End-to-End Sync
-- ============================================================================

-- 1. Function to handle new user signup from Supabase Auth (Phone or Google)
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

-- 2. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Enable Real-Time Replication on all critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.farms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.farm_crops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crop_observations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diagnoses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expert_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.in_app_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_observations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_assessments;

-- 4. Ensure RLS permits Authenticated Users to Insert & Upsert own profiles
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Comments
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates public.profiles record when farmer signs up via Phone or Google';
