/*
  # Phase 5 - Early Warning Risk Assessment & Alert Schema
  # Smart India Hackathon 2026 - Problem Statement 26131

  1. Tables:
    - risk_assessments: Stores explainable crop-level risk calculations with contributing factors and rule versions
    - in_app_alerts: Deduplicated in-app notifications for high/critical risks

  2. Security:
    - Farmers can only view risk assessments and alerts for their own farms
    - Admins/system role can insert and compute risk evaluations
*/

-- ============================================================================
-- 1. Table: RISK_ASSESSMENTS
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_risk_assessments_farm_crop 
  ON public.risk_assessments(farm_id, farm_crop_id, valid_until);

-- ============================================================================
-- 2. Table: IN_APP_ALERTS (Deduplicated Early Warnings)
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_in_app_alerts_farmer_read 
  ON public.in_app_alerts(farmer_id, is_read, created_at);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_alerts ENABLE ROW LEVEL SECURITY;

-- Farmers can view risk assessments for their own farms
CREATE POLICY "Farmers view own farm risk assessments"
  ON public.risk_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.farms f
      WHERE f.id = risk_assessments.farm_id
      AND f.farmer_id = auth.uid()
    )
    OR public.get_user_role(auth.uid()) IN ('expert', 'officer', 'admin')
  );

-- Service role & authenticated experts can insert risk assessments
CREATE POLICY "Authorized roles manage risk assessments"
  ON public.risk_assessments FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('expert', 'officer', 'admin', 'farmer'));

-- Farmers can view and mark own alerts as read
CREATE POLICY "Farmers view own in_app_alerts"
  ON public.in_app_alerts FOR SELECT
  USING (farmer_id = auth.uid());

CREATE POLICY "Farmers update own in_app_alerts"
  ON public.in_app_alerts FOR UPDATE
  USING (farmer_id = auth.uid());

CREATE POLICY "Authorized insert in_app_alerts"
  ON public.in_app_alerts FOR INSERT
  WITH CHECK (farmer_id = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin', 'officer'));
