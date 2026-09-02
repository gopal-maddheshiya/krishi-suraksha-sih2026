/*
# Add Gemini API key for the crop health assistant

1. Purpose
- Creates the server-only settings table if it does not already exist and stores the Gemini key there.
- Allows the chatbot edge function to call Gemini without exposing the key to the browser.

2. Table Used
- `app_settings`
  - `key`: setting identifier.
  - `value`: server-side secret value.
  - `updated_at`: timestamp updated whenever this setting is replaced.

3. Security
- RLS is enabled and restricted to the service role.
- Anonymous and signed-in browser users cannot read or write this table.
- The edge function reads this value using the server role only.

4. Notes
- Replace the example below with your own Gemini API key.
- This migration does not delete or alter existing settings.
*/

CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_service_only" ON app_settings;
CREATE POLICY "app_settings_service_only" ON app_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO app_settings (key, value)
VALUES ('gemini_api_key', 'YOUR_GEMINI_API_KEY_HERE')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();
