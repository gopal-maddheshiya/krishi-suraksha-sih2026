/*
  # Phase 2 - Weather Storage & Cache Tables
  # Smart India Hackathon 2026 - Problem Statement 26131

  1. Tables:
    - weather_observations (Caches actual meteorological readings by geographic coordinate)
    - weather_forecasts (Caches multi-day weather predictions with rain probability)

  2. Indexes:
    - Geo-spatial coordinates + fetched_at timestamp for sub-second cache validation
*/

-- ============================================================================
-- 1. Table: WEATHER_OBSERVATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.weather_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  temperature NUMERIC(5, 2),
  humidity NUMERIC(5, 2),
  rainfall NUMERIC(6, 2) DEFAULT 0,
  wind_speed NUMERIC(6, 2),
  wind_direction NUMERIC(6, 2),
  weather_condition TEXT,
  observed_at TIMESTAMPTZ NOT NULL,
  provider TEXT NOT NULL DEFAULT 'open-meteo',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Table: WEATHER_FORECASTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.weather_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  forecast_date DATE NOT NULL,
  temperature_min NUMERIC(5, 2),
  temperature_max NUMERIC(5, 2),
  humidity NUMERIC(5, 2),
  rain_probability NUMERIC(5, 2) DEFAULT 0,
  rainfall NUMERIC(6, 2) DEFAULT 0,
  wind_speed NUMERIC(6, 2),
  weather_condition TEXT,
  provider TEXT NOT NULL DEFAULT 'open-meteo',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES FOR RAPID CACHE RETRIEVAL
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_weather_obs_coords_fetched 
  ON public.weather_observations(latitude, longitude, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_weather_forecast_coords_date 
  ON public.weather_forecasts(latitude, longitude, forecast_date);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (Secure Public Read, Authorized Write)
-- ============================================================================
ALTER TABLE public.weather_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_forecasts ENABLE ROW LEVEL SECURITY;

-- Read: Publicly readable for all application clients
CREATE POLICY "Public read access for weather observations"
  ON public.weather_observations FOR SELECT
  USING (true);

CREATE POLICY "Public read access for weather forecasts"
  ON public.weather_forecasts FOR SELECT
  USING (true);

-- Write: Restricted to authenticated users / service role cache writes
CREATE POLICY "Restricted insert to weather observations"
  ON public.weather_observations FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "Restricted insert to weather forecasts"
  ON public.weather_forecasts FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);
