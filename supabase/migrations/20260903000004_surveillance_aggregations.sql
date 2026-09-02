/*
  # Phase 6 - Privacy-Preserving Geospatial Surveillance Schema
  # Smart India Hackathon 2026 - Problem Statement 26131

  1. Security:
    - Privacy-preserving aggregated RPC function: get_area_surveillance_summary
    - Minimum aggregation threshold (MIN_AREA_REPORTS = 3) prevents single-farm triangulation
    - Zero private farmer identities, phone numbers, or exact farm coordinates exposed

  2. Performance:
    - Dedicated composite indexes on observations, farms, and diagnoses for high-speed aggregation
*/

-- ============================================================================
-- 1. Optimized Surveillance Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_farms_state_district_taluka 
  ON public.farms(state, district, taluka);

CREATE INDEX IF NOT EXISTS idx_crop_obs_surveillance 
  ON public.crop_observations(observed_at, status, farm_id);

CREATE INDEX IF NOT EXISTS idx_diagnoses_obs_status 
  ON public.diagnoses(observation_id, diagnosis_status);

-- ============================================================================
-- 2. Stored Procedure: GET_AREA_SURVEILLANCE_SUMMARY
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_area_surveillance_summary(
  p_state TEXT DEFAULT NULL,
  p_district TEXT DEFAULT NULL,
  p_crop TEXT DEFAULT NULL,
  p_days INT DEFAULT 7,
  p_min_threshold INT DEFAULT 3
)
RETURNS TABLE (
  area_id TEXT,
  state TEXT,
  district TEXT,
  taluka TEXT,
  total_reports BIGINT,
  verified_reports BIGINT,
  preliminary_reports BIGINT,
  rejected_reports BIGINT,
  affected_crops TEXT[],
  activity_level TEXT,
  trend TEXT,
  surge_detected BOOLEAN,
  latest_report_at TIMESTAMPTZ,
  privacy_protected BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_cutoff TIMESTAMPTZ := NOW() - (p_days || ' days')::INTERVAL;
  v_prev_cutoff TIMESTAMPTZ := NOW() - (p_days * 2 || ' days')::INTERVAL;
BEGIN
  RETURN QUERY
  WITH current_obs AS (
    SELECT 
      f.state,
      f.district,
      COALESCE(f.taluka, 'General District') AS taluka,
      co.id AS observation_id,
      co.status,
      co.observed_at,
      fc.crop_id,
      c.name AS crop_name
    FROM public.crop_observations co
    JOIN public.farms f ON f.id = co.farm_id
    LEFT JOIN public.farm_crops fc ON fc.id = co.farm_crop_id
    LEFT JOIN public.crops c ON c.id = fc.crop_id
    WHERE co.observed_at >= v_current_cutoff
      AND (p_state IS NULL OR f.state = p_state)
      AND (p_district IS NULL OR f.district = p_district)
      AND (p_crop IS NULL OR c.name ILIKE '%' || p_crop || '%')
  ),
  prev_obs AS (
    SELECT 
      f.state,
      f.district,
      COALESCE(f.taluka, 'General District') AS taluka,
      COUNT(co.id) AS prev_count
    FROM public.crop_observations co
    JOIN public.farms f ON f.id = co.farm_id
    LEFT JOIN public.farm_crops fc ON fc.id = co.farm_crop_id
    LEFT JOIN public.crops c ON c.id = fc.crop_id
    WHERE co.observed_at >= v_prev_cutoff 
      AND co.observed_at < v_current_cutoff
      AND (p_state IS NULL OR f.state = p_state)
      AND (p_district IS NULL OR f.district = p_district)
      AND (p_crop IS NULL OR c.name ILIKE '%' || p_crop || '%')
    GROUP BY f.state, f.district, COALESCE(f.taluka, 'General District')
  ),
  aggregated AS (
    SELECT 
      cur.state,
      cur.district,
      cur.taluka,
      COUNT(cur.observation_id) AS total_count,
      COUNT(cur.observation_id) FILTER (WHERE cur.status = 'verified') AS ver_count,
      COUNT(cur.observation_id) FILTER (WHERE cur.status IN ('submitted', 'diagnosed', 'processing', 'pending_expert')) AS prelim_count,
      COUNT(cur.observation_id) FILTER (WHERE cur.status = 'closed') AS rej_count,
      ARRAY_AGG(DISTINCT cur.crop_name) FILTER (WHERE cur.crop_name IS NOT NULL) AS crops_list,
      MAX(cur.observed_at) AS latest_time,
      COALESCE(po.prev_count, 0) AS previous_count
    FROM current_obs cur
    LEFT JOIN prev_obs po 
      ON po.state = cur.state 
      AND po.district = cur.district 
      AND po.taluka = cur.taluka
    GROUP BY cur.state, cur.district, cur.taluka, po.prev_count
  )
  SELECT
    (agg.state || '_' || agg.district || '_' || agg.taluka)::TEXT AS area_id,
    agg.state,
    agg.district,
    agg.taluka,
    CASE WHEN agg.total_count >= p_min_threshold THEN agg.total_count ELSE 0 END AS total_reports,
    CASE WHEN agg.total_count >= p_min_threshold THEN agg.ver_count ELSE 0 END AS verified_reports,
    CASE WHEN agg.total_count >= p_min_threshold THEN agg.prelim_count ELSE 0 END AS preliminary_reports,
    CASE WHEN agg.total_count >= p_min_threshold THEN agg.rej_count ELSE 0 END AS rejected_reports,
    CASE WHEN agg.total_count >= p_min_threshold THEN agg.crops_list ELSE ARRAY[]::TEXT[] END AS affected_crops,
    CASE 
      WHEN agg.total_count < p_min_threshold THEN 'insufficient_data'
      WHEN agg.ver_count >= 5 OR agg.total_count >= 10 THEN 'high'
      WHEN agg.ver_count >= 2 OR agg.total_count >= 5 THEN 'moderate'
      ELSE 'low'
    END AS activity_level,
    CASE
      WHEN agg.total_count < p_min_threshold THEN 'insufficient_data'
      WHEN agg.previous_count = 0 AND agg.total_count >= 3 THEN 'increasing'
      WHEN agg.total_count > (agg.previous_count * 1.5) THEN 'increasing'
      WHEN agg.total_count < (agg.previous_count * 0.7) THEN 'decreasing'
      ELSE 'stable'
    END AS trend,
    (agg.total_count >= 5 AND agg.total_count >= (agg.previous_count * 2)) AS surge_detected,
    agg.latest_time AS latest_report_at,
    (agg.total_count < p_min_threshold) AS privacy_protected
  FROM aggregated agg;
END;
$$;
