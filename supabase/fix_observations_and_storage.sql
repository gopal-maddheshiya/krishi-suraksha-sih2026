-- ============================================================================
-- FIX: ENABLE SEAMLESS CROP OBSERVATIONS, IMAGES & HISTORY SAVING
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Allow guest/anonymous submissions by making reported_by nullable
ALTER TABLE IF EXISTS public.crop_observations 
  ALTER COLUMN reported_by DROP NOT NULL;

-- 2. Ensure RLS is active but permits open farmer submissions & history queries
ALTER TABLE IF EXISTS public.crop_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.observation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expert_reviews ENABLE ROW LEVEL SECURITY;

-- 3. Open Policies for CROP_OBSERVATIONS
DROP POLICY IF EXISTS "Public can insert crop observations" ON public.crop_observations;
CREATE POLICY "Public can insert crop observations" ON public.crop_observations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read crop observations" ON public.crop_observations;
CREATE POLICY "Public can read crop observations" ON public.crop_observations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update crop observations" ON public.crop_observations;
CREATE POLICY "Public can update crop observations" ON public.crop_observations
  FOR UPDATE USING (true);

-- 4. Open Policies for OBSERVATION_IMAGES
DROP POLICY IF EXISTS "Public can insert observation images" ON public.observation_images;
CREATE POLICY "Public can insert observation images" ON public.observation_images
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read observation images" ON public.observation_images;
CREATE POLICY "Public can read observation images" ON public.observation_images
  FOR SELECT USING (true);

-- 5. Open Policies for DIAGNOSES
DROP POLICY IF EXISTS "Public can insert diagnoses" ON public.diagnoses;
CREATE POLICY "Public can insert diagnoses" ON public.diagnoses
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read diagnoses" ON public.diagnoses;
CREATE POLICY "Public can read diagnoses" ON public.diagnoses
  FOR SELECT USING (true);

-- 6. Open Policies for EXPERT_REVIEWS
DROP POLICY IF EXISTS "Public can insert expert reviews" ON public.expert_reviews;
CREATE POLICY "Public can insert expert reviews" ON public.expert_reviews
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read expert reviews" ON public.expert_reviews;
CREATE POLICY "Public can read expert reviews" ON public.expert_reviews
  FOR SELECT USING (true);

-- 7. Ensure Storage Bucket 'crop-observations' exists with Public Access
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-observations', 'crop-observations', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 8. Storage RLS Policies for 'crop-observations' bucket
DROP POLICY IF EXISTS "Allow public uploads to crop-observations" ON storage.objects;
CREATE POLICY "Allow public uploads to crop-observations" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'crop-observations');

DROP POLICY IF EXISTS "Allow public view for crop-observations" ON storage.objects;
CREATE POLICY "Allow public view for crop-observations" ON storage.objects
  FOR SELECT USING (bucket_id = 'crop-observations');

-- Done!
SELECT 'Database & Storage policies updated successfully!' AS result;
