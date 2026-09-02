/*
  # Phase 4 - Expert Verification & Audit Trail Schema
  # Smart India Hackathon 2026 - Problem Statement 26131

  1. Schema Updates:
    - crop_observations: priority, assigned_expert_id, assigned_at
    - expert_reviews: structured diagnosis, affected plant part, severity, requested info
    - expert_audit_logs: immutable audit trail of review decisions and actions

  2. Security:
    - Strict role checks ensuring only authenticated experts/admins can write reviews
    - Farmers can only read expert reviews for their own observations
*/

-- ============================================================================
-- 1. Extend CROP_OBSERVATIONS with Priority & Expert Assignment
-- ============================================================================
ALTER TABLE public.crop_observations
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS assigned_expert_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_crop_obs_assigned_expert 
  ON public.crop_observations(assigned_expert_id);

CREATE INDEX IF NOT EXISTS idx_crop_obs_priority_status 
  ON public.crop_observations(priority, status);

-- ============================================================================
-- 2. Extend EXPERT_REVIEWS with Structured Diagnostics
-- ============================================================================
ALTER TABLE public.expert_reviews
  ADD COLUMN IF NOT EXISTS expert_diagnosis TEXT,
  ADD COLUMN IF NOT EXISTS diagnosis_category TEXT DEFAULT 'disease' CHECK (diagnosis_category IN ('disease', 'pest', 'nutrient_deficiency', 'healthy', 'unable_to_determine')),
  ADD COLUMN IF NOT EXISTS affected_plant_part TEXT CHECK (affected_plant_part IN ('leaf', 'stem', 'fruit_boll', 'flower', 'root', 'whole_plant')),
  ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'severe')),
  ADD COLUMN IF NOT EXISTS requested_information TEXT,
  ADD COLUMN IF NOT EXISTS review_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_completed_at TIMESTAMPTZ;

-- ============================================================================
-- 3. Table: EXPERT_AUDIT_LOGS (Immutable Review History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.expert_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.crop_observations(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('review_claimed', 'more_info_requested', 'review_confirmed', 'review_rejected', 'prescription_updated')),
  decision TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expert_audit_obs_id 
  ON public.expert_audit_logs(observation_id);

CREATE INDEX IF NOT EXISTS idx_expert_audit_expert_id 
  ON public.expert_audit_logs(expert_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.expert_audit_logs ENABLE ROW LEVEL SECURITY;

-- Experts & Admins can read audit logs
CREATE POLICY "Experts and admins view audit logs"
  ON public.expert_audit_logs FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('expert', 'admin', 'officer'));

-- Only experts/service_role can insert audit logs
CREATE POLICY "Experts insert audit logs"
  ON public.expert_audit_logs FOR INSERT
  WITH CHECK (expert_id = auth.uid() AND public.get_user_role(auth.uid()) IN ('expert', 'admin'));
