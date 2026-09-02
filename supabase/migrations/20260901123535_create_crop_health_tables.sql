/*
# Crop Health Management System - Database Schema

## Overview
Creates the complete database schema for a crop health management system that supports
image-based disease detection, pest monitoring, weather risk forecasting, hotspot mapping,
expert validation, multilingual advisories, and official dashboards.

## New Tables

1. **crop_reports** - Farmer-submitted crop disease/pest reports with image analysis results
   - id, reporter_name, crop_type, crop_stage, variety, soil_condition, location_name, latitude, longitude,
     image_url, symptom_description, detected_disease, confidence_score, severity, status, language, created_at

2. **pest_traps** - Pest trap monitoring data with insect counts and risk levels
   - id, trap_id, location_name, latitude, longitude, pest_type, count, crop_type, risk_level, observation_date, notes, created_at

3. **disease_hotspots** - Geospatial disease hotspot data for mapping
   - id, location_name, latitude, longitude, disease_type, intensity, affected_area_acres, crop_type, status, created_at

4. **advisories** - Multilingual crop health advisories and recommendations
   - id, title_en, title_key, category, crop_type, disease_type, advisory_text_key, severity, region, created_at

5. **expert_validations** - Expert validation of farmer-submitted reports
   - id, report_id, expert_name, validation_status, expert_notes, recommended_action, created_at

6. **follow_ups** - Follow-up monitoring tasks for tracked reports
   - id, report_id, action_required, due_date, status, notes, created_at

7. **weather_risks** - Weather-based disease risk forecasts
   - id, location_name, latitude, longitude, temperature, humidity, rainfall, wind_speed, risk_level, disease_risk, forecast_date, created_at

## Security
- RLS enabled on all tables
- All tables allow anon + authenticated CRUD (single-tenant, no-auth app - data is intentionally public/shared)
*/

-- Crop Reports
CREATE TABLE IF NOT EXISTS crop_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name text NOT NULL,
  crop_type text NOT NULL,
  crop_stage text,
  variety text,
  soil_condition text,
  location_name text NOT NULL,
  latitude numeric(10,7),
  longitude numeric(10,7),
  image_url text,
  symptom_description text,
  detected_disease text,
  confidence_score numeric(5,2) DEFAULT 0,
  severity text DEFAULT 'unknown',
  status text DEFAULT 'submitted',
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crop_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_crop_reports" ON crop_reports;
CREATE POLICY "anon_select_crop_reports" ON crop_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_crop_reports" ON crop_reports;
CREATE POLICY "anon_insert_crop_reports" ON crop_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_crop_reports" ON crop_reports;
CREATE POLICY "anon_update_crop_reports" ON crop_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_crop_reports" ON crop_reports;
CREATE POLICY "anon_delete_crop_reports" ON crop_reports FOR DELETE
  TO anon, authenticated USING (true);

-- Pest Traps
CREATE TABLE IF NOT EXISTS pest_traps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trap_id text NOT NULL,
  location_name text NOT NULL,
  latitude numeric(10,7),
  longitude numeric(10,7),
  pest_type text NOT NULL,
  count integer DEFAULT 0,
  crop_type text NOT NULL,
  risk_level text DEFAULT 'low',
  observation_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pest_traps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pest_traps" ON pest_traps;
CREATE POLICY "anon_select_pest_traps" ON pest_traps FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pest_traps" ON pest_traps;
CREATE POLICY "anon_insert_pest_traps" ON pest_traps FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pest_traps" ON pest_traps;
CREATE POLICY "anon_update_pest_traps" ON pest_traps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pest_traps" ON pest_traps;
CREATE POLICY "anon_delete_pest_traps" ON pest_traps FOR DELETE
  TO anon, authenticated USING (true);

-- Disease Hotspots
CREATE TABLE IF NOT EXISTS disease_hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name text NOT NULL,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  disease_type text NOT NULL,
  intensity text DEFAULT 'moderate',
  affected_area_acres numeric(10,2) DEFAULT 0,
  crop_type text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disease_hotspots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_disease_hotspots" ON disease_hotspots;
CREATE POLICY "anon_select_disease_hotspots" ON disease_hotspots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_disease_hotspots" ON disease_hotspots;
CREATE POLICY "anon_insert_disease_hotspots" ON disease_hotspots FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_disease_hotspots" ON disease_hotspots;
CREATE POLICY "anon_update_disease_hotspots" ON disease_hotspots FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_disease_hotspots" ON disease_hotspots;
CREATE POLICY "anon_delete_disease_hotspots" ON disease_hotspots FOR DELETE
  TO anon, authenticated USING (true);

-- Advisories
CREATE TABLE IF NOT EXISTS advisories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_key text NOT NULL,
  category text NOT NULL,
  crop_type text,
  disease_type text,
  severity text DEFAULT 'moderate',
  region text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE advisories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_advisories" ON advisories;
CREATE POLICY "anon_select_advisories" ON advisories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_advisories" ON advisories;
CREATE POLICY "anon_insert_advisories" ON advisories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_advisories" ON advisories;
CREATE POLICY "anon_update_advisories" ON advisories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_advisories" ON advisories;
CREATE POLICY "anon_delete_advisories" ON advisories FOR DELETE
  TO anon, authenticated USING (true);

-- Expert Validations
CREATE TABLE IF NOT EXISTS expert_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES crop_reports(id) ON DELETE CASCADE,
  expert_name text NOT NULL,
  validation_status text NOT NULL DEFAULT 'pending',
  expert_notes text,
  recommended_action text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expert_validations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_expert_validations" ON expert_validations;
CREATE POLICY "anon_select_expert_validations" ON expert_validations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_expert_validations" ON expert_validations;
CREATE POLICY "anon_insert_expert_validations" ON expert_validations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_expert_validations" ON expert_validations;
CREATE POLICY "anon_update_expert_validations" ON expert_validations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_expert_validations" ON expert_validations;
CREATE POLICY "anon_delete_expert_validations" ON expert_validations FOR DELETE
  TO anon, authenticated USING (true);

-- Follow-ups
CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES crop_reports(id) ON DELETE CASCADE,
  action_required text NOT NULL,
  due_date date,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_follow_ups" ON follow_ups;
CREATE POLICY "anon_select_follow_ups" ON follow_ups FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_follow_ups" ON follow_ups;
CREATE POLICY "anon_insert_follow_ups" ON follow_ups FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_follow_ups" ON follow_ups;
CREATE POLICY "anon_update_follow_ups" ON follow_ups FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_follow_ups" ON follow_ups;
CREATE POLICY "anon_delete_follow_ups" ON follow_ups FOR DELETE
  TO anon, authenticated USING (true);

-- Weather Risks
CREATE TABLE IF NOT EXISTS weather_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name text NOT NULL,
  latitude numeric(10,7),
  longitude numeric(10,7),
  temperature numeric(5,2),
  humidity numeric(5,2),
  rainfall numeric(5,2),
  wind_speed numeric(5,2),
  risk_level text DEFAULT 'low',
  disease_risk text,
  forecast_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weather_risks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_weather_risks" ON weather_risks;
CREATE POLICY "anon_select_weather_risks" ON weather_risks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_weather_risks" ON weather_risks;
CREATE POLICY "anon_insert_weather_risks" ON weather_risks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_weather_risks" ON weather_risks;
CREATE POLICY "anon_update_weather_risks" ON weather_risks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_weather_risks" ON weather_risks;
CREATE POLICY "anon_delete_weather_risks" ON weather_risks FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crop_reports_status ON crop_reports(status);
CREATE INDEX IF NOT EXISTS idx_crop_reports_crop_type ON crop_reports(crop_type);
CREATE INDEX IF NOT EXISTS idx_pest_traps_risk_level ON pest_traps(risk_level);
CREATE INDEX IF NOT EXISTS idx_disease_hotspots_status ON disease_hotspots(status);
CREATE INDEX IF NOT EXISTS idx_weather_risks_forecast_date ON weather_risks(forecast_date);
CREATE INDEX IF NOT EXISTS idx_expert_validations_report_id ON expert_validations(report_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_report_id ON follow_ups(report_id);
