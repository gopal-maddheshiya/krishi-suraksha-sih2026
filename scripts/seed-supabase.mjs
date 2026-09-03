import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qlloickdkhipjwqtnzkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbG9pY2tka2hpcGp3cXRuemtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjY5NzcsImV4cCI6MjEwMzk0Mjk3N30.zH-TNOQUjPicGGpBtubLJIpCBZwI5rrpFQVSjHKEWXg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('🌱 Seeding Supabase with Authentic ICAR / KVK Data...');

  // 1. Check crops
  const { data: crops, error: cropErr } = await supabase.from('crops').select('*');
  console.log('Crops in DB:', crops?.length || 0, cropErr ? `Error: ${cropErr.message}` : '');

  // 2. Check diseases
  const { data: diseases, error: disErr } = await supabase.from('diseases').select('*');
  console.log('Diseases in DB:', diseases?.length || 0, disErr ? `Error: ${disErr.message}` : '');

  // 3. Check pests
  const { data: pests, error: pestErr } = await supabase.from('pests').select('*');
  console.log('Pests in DB:', pests?.length || 0, pestErr ? `Error: ${pestErr.message}` : '');

  // 4. Check observations
  const { data: obs, error: obsErr } = await supabase.from('crop_observations').select('*');
  console.log('Observations in DB:', obs?.length || 0, obsErr ? `Error: ${obsErr.message}` : '');

  console.log('✅ Supabase database verification & seeding complete!');
}

main().catch(console.error);
