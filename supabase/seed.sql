-- ============================================================================
-- SEED REFERENCE MASTER DATA ONLY
-- Smart India Hackathon 2026 - Problem Statement 26131
-- NOTE: Contains ONLY official ICAR / State Agriculture Master Registries.
-- NO FAKE FARMERS, NO FAKE FARMS, NO FAKE WEATHER OR OUTBREAKS ARE SEEDED.
-- ============================================================================

-- 1. Master Crops Catalog (Valid Hex UUIDs: a0000000-...)
INSERT INTO public.crops (id, name, scientific_name, category)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Cotton', 'Gossypium hirsutum', 'Cash Crops'),
  ('a0000000-0000-0000-0000-000000000002', 'Soybean', 'Glycine max', 'Oilseeds'),
  ('a0000000-0000-0000-0000-000000000003', 'Tomato', 'Solanum lycopersicum', 'Vegetables'),
  ('a0000000-0000-0000-0000-000000000004', 'Rice / Paddy', 'Oryza sativa', 'Cereals'),
  ('a0000000-0000-0000-0000-000000000005', 'Sugarcane', 'Saccharum officinarum', 'Cash Crops'),
  ('a0000000-0000-0000-0000-000000000006', 'Grapes', 'Vitis vinifera', 'Horticulture'),
  ('a0000000-0000-0000-0000-000000000007', 'Chilli', 'Capsicum annuum', 'Vegetables'),
  ('a0000000-0000-0000-0000-000000000008', 'Onion', 'Allium cepa', 'Vegetables'),
  ('a0000000-0000-0000-0000-000000000009', 'Pomegranate', 'Punica granatum', 'Horticulture'),
  ('a0000000-0000-0000-0000-000000000010', 'Wheat', 'Triticum aestivum', 'Cereals')
ON CONFLICT (name) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  category = EXCLUDED.category;

-- 2. Master Plant Diseases Catalog (Valid Hex UUIDs: b0000000-...)
INSERT INTO public.diseases (id, name, scientific_name, description, symptoms, severity)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Early Blight',
    'Alternaria solani',
    'Fungal foliar disease causing significant yield loss in Solanaceae family.',
    'Concentric target-board rings on older leaves with yellow chlorotic margins.',
    'moderate'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Rice Leaf Blast',
    'Magnaporthe oryzae',
    'Major fungal pathogen affecting rice foliage, neck, and panicles.',
    'Spindle-shaped diamond lesions with gray/whitish centers and dark reddish-brown borders.',
    'high'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Asian Soybean Rust',
    'Phakopsora pachyrhizi',
    'Aggressive airborne fungal disease causing premature defoliation in soybean.',
    'Tiny raised tan to reddish-brown pustules on lower leaf surface.',
    'high'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'Downy Mildew',
    'Plasmopara viticola',
    'Destructive fungal disease in grapes triggered by high humidity and free moisture.',
    'Yellowish translucent oily spots on upper leaf surface, white downy growth beneath.',
    'critical'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'Bacterial Blight (Telya)',
    'Xanthomonas axonopodis pv. punicae',
    'Bacterial disease causing dark oily spots on pomegranate leaves, stems, and fruits.',
    'Water-soaked dark brown to black angular lesions with yellow halo.',
    'critical'
  )
ON CONFLICT (name) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  severity = EXCLUDED.severity;

-- 3. Master Insect Pests Catalog (Valid Hex UUIDs: c0000000-...)
INSERT INTO public.pests (id, name, scientific_name, description, symptoms, severity)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'Pink Bollworm',
    'Pectinophora gossypiella',
    'Destructive lepidopteran pest of cotton causing internal boll damage.',
    'Larvae bore into squares and developing bolls, rosette flowers, staining of lint.',
    'critical'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'Fall Armyworm',
    'Spodoptera frugiperda',
    'Invasive polyphagous pest causing extensive whorl damage in maize and cereals.',
    'Pin-holes, windowing on leaves, large ragged feeding holes with sawdust-like frass in whorl.',
    'high'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'Brown Plant Hopper (BPH)',
    'Nilaparvata lugens',
    'Major phloem-feeding pest in paddy causing hopper burn.',
    'Yellowing, drying of plants in circular patches resembling fire-burned spots.',
    'critical'
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'Chilli Thrips',
    'Scirtothrips dorsalis',
    'Sucking pest damaging tender leaves and shoots in chilli and vegetables.',
    'Upward curling of leaves, crinkling, bronze discoloration, reduced flower set.',
    'moderate'
  )
ON CONFLICT (name) DO UPDATE SET
  scientific_name = EXCLUDED.scientific_name,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  severity = EXCLUDED.severity;
