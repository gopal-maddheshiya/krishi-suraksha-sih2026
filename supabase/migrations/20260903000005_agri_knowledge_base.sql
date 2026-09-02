/*
  # Phase 7 - Agricultural Knowledge Base & Advisory Schema
  # Smart India Hackathon 2026 - Problem Statement 26131

  1. Tables:
    - agri_knowledge: Structured, source-verified non-chemical and cultural crop health advisories
    - agri_knowledge_audit_logs: Audit trail tracking knowledge modifications

  2. Security:
    - Public/Farmers can read only verified knowledge entries
    - Experts/Admins can author, update, and retire knowledge entries
*/

-- ============================================================================
-- 1. Table: AGRI_KNOWLEDGE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agri_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  disease_name TEXT,
  pest_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('disease', 'pest', 'nutrient_deficiency', 'general_care')),
  affected_plant_part TEXT NOT NULL DEFAULT 'leaf',
  symptoms_en TEXT[] NOT NULL DEFAULT '{}',
  symptoms_hi TEXT[] NOT NULL DEFAULT '{}',
  symptoms_mr TEXT[] NOT NULL DEFAULT '{}',
  field_inspection_steps_en TEXT[] NOT NULL DEFAULT '{}',
  field_inspection_steps_hi TEXT[] NOT NULL DEFAULT '{}',
  field_inspection_steps_mr TEXT[] NOT NULL DEFAULT '{}',
  immediate_actions_en TEXT[] NOT NULL DEFAULT '{}',
  immediate_actions_hi TEXT[] NOT NULL DEFAULT '{}',
  immediate_actions_mr TEXT[] NOT NULL DEFAULT '{}',
  preventive_actions_en TEXT[] NOT NULL DEFAULT '{}',
  preventive_actions_hi TEXT[] NOT NULL DEFAULT '{}',
  preventive_actions_mr TEXT[] NOT NULL DEFAULT '{}',
  escalation_triggers_en TEXT[] NOT NULL DEFAULT '{}',
  escalation_triggers_hi TEXT[] NOT NULL DEFAULT '{}',
  escalation_triggers_mr TEXT[] NOT NULL DEFAULT '{}',
  source_organization TEXT NOT NULL,
  source_document TEXT NOT NULL,
  source_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'pending_review', 'retired')),
  knowledge_version TEXT NOT NULL DEFAULT 'agri-knowledge-v1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agri_knowledge_lookup 
  ON public.agri_knowledge(crop_name, disease_name, pest_name, status);

-- ============================================================================
-- 2. Table: AGRI_KNOWLEDGE_AUDIT_LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agri_knowledge_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID NOT NULL REFERENCES public.agri_knowledge(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'retired', 'restored')),
  old_version TEXT,
  new_version TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.agri_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_knowledge_audit_logs ENABLE ROW LEVEL SECURITY;

-- Everyone can read verified agricultural knowledge
CREATE POLICY "Public read verified agri knowledge"
  ON public.agri_knowledge FOR SELECT
  USING (status = 'verified' OR public.get_user_role(auth.uid()) IN ('expert', 'officer', 'admin'));

-- Experts and Admins can manage knowledge entries
CREATE POLICY "Experts and admins manage agri knowledge"
  ON public.agri_knowledge FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('expert', 'officer', 'admin'));

-- Audit logs are viewable by experts/admins
CREATE POLICY "Experts view knowledge audit logs"
  ON public.agri_knowledge_audit_logs FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('expert', 'officer', 'admin'));

CREATE POLICY "Experts insert knowledge audit logs"
  ON public.agri_knowledge_audit_logs FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.get_user_role(auth.uid()) IN ('expert', 'officer', 'admin'));
