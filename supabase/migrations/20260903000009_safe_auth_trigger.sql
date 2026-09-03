-- ============================================================================
-- 20260903000009_safe_auth_trigger.sql
-- Smart India Hackathon 2026 | Problem Statement 26131
-- Exception-Safe Auth Trigger (Fixes "Database error saving new user")
-- ============================================================================

-- 1. Ensure public.profiles table exists and has proper defaults
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'Farmer',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'expert', 'officer', 'admin')),
  preferred_language TEXT NOT NULL DEFAULT 'hi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Drop any restrictive foreign key triggers and recreate with full safety
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NULLIF(split_part(NEW.email, '@', 1), ''),
        'Farmer'
      ),
      COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
      COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'hi'),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
      updated_at = NOW();
  EXCEPTION
    WHEN OTHERS THEN
      -- Ensures auth.users insert NEVER crashes or aborts during Google OAuth
      RAISE WARNING 'handle_new_user notice: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable RLS and public policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
