-- ============================================================================
-- 20260903000008_master_key_password_reset.sql
-- Smart India Hackathon 2026 | Problem Statement 26131
-- Password Reset with Master Key "SIH2026"
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reset_farmer_password(
  p_phone TEXT,
  p_recovery_key TEXT,
  p_new_password TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_clean_phone TEXT;
  v_email TEXT;
BEGIN
  -- 1. Verify Master Key
  IF p_recovery_key != 'SIH2026' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'अमान्य रिकवरी कुंजी (Invalid Recovery Key). सही मास्टर कुंजी "SIH2026" दर्ज करें।'
    );
  END IF;

  v_clean_phone := right(regexp_replace(p_phone, '\D', '', 'g'), 10);
  v_email := v_clean_phone || '@farmer.crophealth.in';

  -- 2. Find user in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email OR phone = v_clean_phone;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'इस नंबर से कोई पंजीकृत किसान खाता नहीं मिला (No account found for this phone number).'
    );
  END IF;

  -- 3. Update encrypted password in auth.users
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE id = v_user_id;

  -- 4. Update profile audit timestamp
  UPDATE public.profiles
  SET updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'पासवर्ड सफलतापूर्वक बदल दिया गया है (Password updated successfully).'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.reset_farmer_password IS 'Secure RPC function to reset farmer password using Master Key SIH2026';
