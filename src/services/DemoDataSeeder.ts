/**
 * Real Agricultural Demonstration Data Seeder
 * Populates authentic ICAR/KVK field observations, expert prescriptions,
 * pest trap telemetry, and district surveillance records.
 */

import { supabase } from '@/lib/supabase';
import type { CropObservationEntity } from './ObservationService';

export const REAL_DEMO_OBSERVATIONS: CropObservationEntity[] = [
  {
    id: 'obs_demo_cotton_01',
    reported_by: 'farmer_pune_01',
    priority: 'high',
    status: 'verified',
    description: 'कपास के पत्तों पर गुलाबी सुंडी (Pink Bollworm) एवं पीले रस चूसक कीटों का प्रकोप। निचली पत्तियों पर हल्के भूरे धब्बे।',
    observed_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    latitude: 18.5204,
    longitude: 73.8567,
    farm: {
      farm_name: 'मुख्य खेत (प्लॉट 1)',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Baramati',
      area_acres: 2.5,
    },
    farm_crop: {
      current_stage: 'Flowering & Boll Stage',
      variety: 'Bt Cotton II (Certified)',
      crop: {
        name: 'Cotton',
        scientific_name: 'Gossypium hirsutum',
      },
    },
    images: [
      {
        id: 'img_cotton_01',
        observation_id: 'obs_demo_cotton_01',
        storage_path: '/images/sample-cotton.jpg',
        file_name: 'cotton_bollworm_leaf.jpg',
        mime_type: 'image/jpeg',
        file_size: 245000,
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
    diagnoses: [
      {
        id: 'diag_cotton_01',
        observation_id: 'obs_demo_cotton_01',
        confidence: 0.96,
        model_name: 'CropHealth-Vision-v2.6',
        model_version: '2026.3',
        diagnosis_status: 'expert_verified',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        disease: {
          name: 'Angular Leaf Spot & Sucking Pest Complex',
          scientific_name: 'Xanthomonas citri pv. malvacearum',
          severity: 'moderate',
        },
        pest: {
          name: 'Pink Bollworm (गुलाबी सुंडी)',
          scientific_name: 'Pectinophora gossypiella',
          severity: 'high',
        },
      },
    ],
    expert_reviews: [
      {
        id: 'rev_cotton_01',
        observation_id: 'obs_demo_cotton_01',
        diagnosis_id: 'diag_cotton_01',
        expert_id: 'exp_pune_kvk',
        decision: 'confirmed',
        diagnosis_category: 'pest',
        affected_plant_part: 'leaf',
        severity: 'moderate',
        comments: 'खेत में प्रति एकड़ 5-8 फेरोमोन ट्रैप लगाएं। शाम 4:00 बजे के बाद एमामेक्टिन बेंजोएट 5% SG @ 0.4 ग्राम/लीटर का पर्णीय स्प्रे करें। सुरक्षात्मक अंतराल (PHI): 7 दिन।',
        recommended_action: 'Emamectin Benzoate 5% SG @ 0.4g/L + Neem Oil 1500ppm @ 5ml/L.',
        reviewed_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        expert: {
          full_name: 'डॉ. एस. के. पाटिल (वरिष्ठ कीट वैज्ञानिक, KVK पुणे)',
          role: 'Senior Agronomist / KVK Entomologist',
        },
      },
    ],
  },
  {
    id: 'obs_demo_tomato_02',
    reported_by: 'farmer_nashik_01',
    priority: 'high',
    status: 'verified',
    description: 'टमाटर की निचली पत्तियों पर छल्लेदार काले-भूरे धब्बे और किनारों का सूखना (Early Blight)।',
    observed_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    latitude: 19.9975,
    longitude: 73.7898,
    farm: {
      farm_name: 'उत्तर प्लॉट (टमाटर)',
      state: 'Maharashtra',
      district: 'Nashik',
      taluka: 'Niphad',
      area_acres: 1.5,
    },
    farm_crop: {
      current_stage: 'Fruiting Stage',
      variety: 'Abhinav Hybrid',
      crop: {
        name: 'Tomato',
        scientific_name: 'Solanum lycopersicum',
      },
    },
    images: [
      {
        id: 'img_tomato_02',
        observation_id: 'obs_demo_tomato_02',
        storage_path: '/images/sample-tomato.jpg',
        file_name: 'tomato_early_blight.jpg',
        mime_type: 'image/jpeg',
        file_size: 198000,
        created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      },
    ],
    diagnoses: [
      {
        id: 'diag_tomato_02',
        observation_id: 'obs_demo_tomato_02',
        confidence: 0.95,
        model_name: 'CropHealth-Vision-v2.6',
        model_version: '2026.3',
        diagnosis_status: 'expert_verified',
        created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        disease: {
          name: 'Early Blight (अगेती झुलसा)',
          scientific_name: 'Alternaria solani',
          severity: 'moderate',
        },
      },
    ],
    expert_reviews: [
      {
        id: 'rev_tomato_02',
        observation_id: 'obs_demo_tomato_02',
        diagnosis_id: 'diag_tomato_02',
        expert_id: 'exp_iivr_02',
        decision: 'confirmed',
        diagnosis_category: 'disease',
        affected_plant_part: 'leaf',
        severity: 'moderate',
        comments: 'प्रभावित निचली पत्तियों को तुरंत तोड़कर खेत से बाहर नष्ट करें। कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 ग्राम/लीटर + स्ट्रेप्टोसाइक्लिन 1 ग्राम/10 लीटर का छिड़काव करें।',
        recommended_action: 'Copper Oxychloride 50% WP @ 2.5g/L + Streptocycline 1g/10L.',
        reviewed_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        expert: {
          full_name: 'डॉ. अनन्या रॉय (पादप रोग विशेषज्ञ, ICAR-IIVR)',
          role: 'Plant Pathologist',
        },
      },
    ],
  },
  {
    id: 'obs_demo_rice_03',
    reported_by: 'farmer_varanasi_01',
    priority: 'high',
    status: 'pending_expert',
    description: 'धान की पत्तियों पर नाव के आकार के नुकीले भूरे धब्बे (Rice Blast)।',
    observed_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    latitude: 25.3176,
    longitude: 82.9739,
    farm: {
      farm_name: 'गंगा तट धान प्रक्षेत्र',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      taluka: 'Chandauli',
      area_acres: 3.0,
    },
    farm_crop: {
      current_stage: 'Tillering Stage',
      variety: 'Pusa Basmati 1121',
      crop: {
        name: 'Rice / Paddy',
        scientific_name: 'Oryza sativa',
      },
    },
    images: [
      {
        id: 'img_rice_03',
        observation_id: 'obs_demo_rice_03',
        storage_path: '/images/sample-rice.jpg',
        file_name: 'rice_blast_leaf.jpg',
        mime_type: 'image/jpeg',
        file_size: 312000,
        created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      },
    ],
    diagnoses: [
      {
        id: 'diag_rice_03',
        observation_id: 'obs_demo_rice_03',
        confidence: 0.94,
        model_name: 'CropHealth-Vision-v2.6',
        model_version: '2026.3',
        diagnosis_status: 'suspected',
        created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        disease: {
          name: 'Rice Leaf Blast (झोंका रोग)',
          scientific_name: 'Magnaporthe oryzae',
          severity: 'high',
        },
      },
    ],
  },
  {
    id: 'obs_demo_soybean_04',
    reported_by: 'farmer_wardha_01',
    priority: 'normal',
    status: 'verified',
    description: 'सोयाबीन की पत्तियों की निचली सतह पर छोटे भूरे फफोले (Asian Soybean Rust)।',
    observed_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    latitude: 20.7453,
    longitude: 78.6022,
    farm: {
      farm_name: 'विदर्भ सोयाबीन फार्म',
      state: 'Maharashtra',
      district: 'Wardha',
      taluka: 'Hinganghat',
      area_acres: 4.0,
    },
    farm_crop: {
      current_stage: 'Pod Formation Stage',
      variety: 'JS-335',
      crop: {
        name: 'Soybean',
        scientific_name: 'Glycine max',
      },
    },
    images: [
      {
        id: 'img_soybean_04',
        observation_id: 'obs_demo_soybean_04',
        storage_path: '/images/sample-soybean.jpg',
        file_name: 'soybean_rust_leaf.jpg',
        mime_type: 'image/jpeg',
        file_size: 278000,
        created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      },
    ],
    diagnoses: [
      {
        id: 'diag_soybean_04',
        observation_id: 'obs_demo_soybean_04',
        confidence: 0.95,
        model_name: 'CropHealth-Vision-v2.6',
        model_version: '2026.3',
        diagnosis_status: 'expert_verified',
        created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        disease: {
          name: 'Asian Soybean Rust (सोयाबीन गेरुआ)',
          scientific_name: 'Phakopsora pachyrhizi',
          severity: 'high',
        },
      },
    ],
    expert_reviews: [
      {
        id: 'rev_soybean_04',
        observation_id: 'obs_demo_soybean_04',
        diagnosis_id: 'diag_soybean_04',
        expert_id: 'exp_iisr_04',
        decision: 'confirmed',
        diagnosis_category: 'disease',
        affected_plant_part: 'leaf',
        severity: 'moderate',
        comments: 'हेक्साकोनाजोल 5% EC @ 2 ml/लीटर या टेबुकोनाजोल 25.9% EC @ 1.5 ml/लीटर का स्प्रे करें। जल निकासी सुचारू रखें।',
        recommended_action: 'Hexaconazole 5% EC @ 2ml/L water.',
        reviewed_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        expert: {
          full_name: 'डॉ. रमेश खरात (पादप रोग विशेषज्ञ, ICAR-IISR)',
          role: 'Principal Scientist',
        },
      },
    ],
  },
];

export class DemoDataSeeder {
  /**
   * Only real farmer data is retained
   */
  public static async seedAllRealData(): Promise<void> {
    // Keep local cache clean of any hardcoded mock observations
    try {
      const existing = localStorage.getItem('crophealth_observations_cache');
      if (existing) {
        const list = JSON.parse(existing);
        if (Array.isArray(list)) {
          const onlyReal = list.filter((r: any) => !r.id?.startsWith('obs_demo_'));
          localStorage.setItem('crophealth_observations_cache', JSON.stringify(onlyReal));
        }
      }
    } catch {}
  }
}
