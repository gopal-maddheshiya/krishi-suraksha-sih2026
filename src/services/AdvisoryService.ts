/**
 * Agricultural Knowledge & Farmer Advisory Service
 * Smart India Hackathon 2026 - Problem Statement 26131
 *
 * Grounded strictly in ICAR, State Agricultural Universities, and KVK research bulletins.
 * Absolute Rule: No automated chemical dosing or LLM hallucinations.
 */

import { supabase } from '@/lib/supabase';

export interface StructuredAdvisory {
  cropName: string;
  issueName: string;
  category: 'disease' | 'pest' | 'nutrient_deficiency' | 'general_care';
  affectedPart: string;
  fieldInspectionSteps: string[];
  immediateNonChemicalActions: string[];
  preventiveActions: string[];
  escalationTriggers: string[];
  expertAuthoredAdvice?: string;
  sourceOrganization: string;
  sourceDocument: string;
  sourceDate: string;
  knowledgeVersion: string;
  status: 'verified' | 'pending_review' | 'retired';
}

export const VERIFIED_AGRI_KNOWLEDGE_BASE: Record<string, StructuredAdvisory> = {
  'cotton_bacterial_blight': {
    cropName: 'Cotton',
    issueName: 'Bacterial Blight (Angular Leaf Spot)',
    category: 'disease',
    affectedPart: 'Leaf and Boll',
    fieldInspectionSteps: [
      'Examine leaf undersides for small, water-soaked angular spots bounded by veins.',
      'Check if spots turn dark brown or black with reddish borders.',
      'Inspect developing bolls for circular oily lesions.',
    ],
    immediateNonChemicalActions: [
      'Avoid field operations or scouting when leaves are wet from dew or rain to prevent bacterial spread.',
      'Collect and safely bury or burn severely infected fallen leaves from the field floor.',
      'Ensure field drainage channels are clear to prevent waterlogging around plant roots.',
    ],
    preventiveActions: [
      'Use acid-delinted and certified disease-free seeds for next sowing cycle.',
      'Adopt recommended crop spacing (90x60 cm) to allow adequate sunlight and air circulation.',
      'Follow balanced nitrogen application and avoid excessive vegetative growth.',
    ],
    escalationTriggers: [
      'If angular lesions spread to more than 20% of the canopy across the field.',
      'If dark sunken lesions appear on green bolls (boll rot stage).',
    ],
    sourceOrganization: 'ICAR-Central Institute for Cotton Research (CICR)',
    sourceDocument: 'Cotton IPM Package and Pathology Management Bulletin',
    sourceDate: '2022',
    knowledgeVersion: 'agri-knowledge-v1.0',
    status: 'verified',
  },
  'soybean_rust': {
    cropName: 'Soybean',
    issueName: 'Asian Soybean Rust (Phakopsora pachyrhizi)',
    category: 'disease',
    affectedPart: 'Lower Foliage',
    fieldInspectionSteps: [
      'Inspect the underside of lower mature leaves for tiny raised brown-to-tan pustules (volcano-like bumps).',
      'Check if yellow speckles appear on the upper leaf surface opposite the pustules.',
      'Examine if lower leaves begin premature yellowing and shedding.',
    ],
    immediateNonChemicalActions: [
      'Remove and destroy isolated initial infected lower leaves in small patches.',
      'Improve field aeration by removing weeds around field borders.',
      'Avoid evening overhead sprinkler irrigation.',
    ],
    preventiveActions: [
      'Plant resistant or tolerant varieties recommended for your agro-climatic zone.',
      'Sow with optimal row spacing to reduce humidity buildup under the canopy.',
      'Practice crop rotation with non-host crops like maize or sorghum.',
    ],
    escalationTriggers: [
      'If rust pustules advance from lower foliage to the middle canopy during flowering/pod stage.',
      'If rapid defoliation begins across multiple field rows.',
    ],
    sourceOrganization: 'ICAR-Indian Institute of Soybean Research (IISR)',
    sourceDocument: 'Soybean Disease Identification and Management Manual',
    sourceDate: '2021',
    knowledgeVersion: 'agri-knowledge-v1.0',
    status: 'verified',
  },
  'tomato_early_blight': {
    cropName: 'Tomato',
    issueName: 'Early Blight (Alternaria solani)',
    category: 'disease',
    affectedPart: 'Older Leaves and Stems',
    fieldInspectionSteps: [
      'Look for dark brown spots with characteristic concentric rings (target-board appearance) on older lower leaves.',
      'Check for yellow halo surrounding the brown concentric lesions.',
      'Inspect stem collar for dark sunken collar-rot lesions.',
    ],
    immediateNonChemicalActions: [
      'Prune off heavily infected lower leaves up to 30 cm from ground level and destroy them.',
      'Stake tomato plants to keep foliage and developing fruits off the wet soil.',
      'Use drip irrigation or furrow watering instead of splashing water on leaves.',
    ],
    preventiveActions: [
      'Apply organic mulch (straw or plastic) around plant base to prevent soil-splash of fungal spores.',
      'Follow a minimum 3-year crop rotation without solanaceous crops (potato, brinjal, chilli).',
      'Ensure optimal plant-to-plant distance for quick morning leaf drying.',
    ],
    escalationTriggers: [
      'If target spots appear on green tomato fruits near the calyx.',
      'If defoliation exceeds 30% of total plant foliage.',
    ],
    sourceOrganization: 'ICAR-Indian Institute of Horticultural Research (IIHR)',
    sourceDocument: 'Tomato Integrated Pest and Disease Advisory',
    sourceDate: '2023',
    knowledgeVersion: 'agri-knowledge-v1.0',
    status: 'verified',
  },
  'rice_blast': {
    cropName: 'Rice',
    issueName: 'Rice Leaf Blast (Magnaporthe oryzae)',
    category: 'disease',
    affectedPart: 'Leaves and Neck',
    fieldInspectionSteps: [
      'Inspect leaves for spindle-shaped (eye-shaped) lesions with grey or white centers and brown margins.',
      'Check if lesion centers turn ash-grey with dark margins under humid mornings.',
      'Inspect neck of the panicle at heading stage for blackish rot.',
    ],
    immediateNonChemicalActions: [
      'Temporarily stop top-dressing of nitrogenous fertilizers (Urea) which worsens blast susceptibility.',
      'Maintain shallow standing water (2-3 cm) in the paddy field if soil is drying out.',
      'Drain stagnant water if waterlogging persists for prolonged cloudy periods.',
    ],
    preventiveActions: [
      'Treat seeds with biological Trichoderma formulations prior to nursery raising.',
      'Apply balanced N:P:K with recommended potassium and silicon levels to strengthen leaf cuticle.',
      'Burn or compost infected stubbles after harvest.',
    ],
    escalationTriggers: [
      'If spindle lesions coalesce and cause complete leaf drying (blast burn) across the plot.',
      'If panicle neck turns black during heading (neck blast).',
    ],
    sourceOrganization: 'ICAR-National Rice Research Institute (NRRI)',
    sourceDocument: 'Rice Protection Guidelines and Blast Management',
    sourceDate: '2022',
    knowledgeVersion: 'agri-knowledge-v1.0',
    status: 'verified',
  },
  'grape_downy_mildew': {
    cropName: 'Grapes',
    issueName: 'Grapevine Downy Mildew (Plasmopara viticola)',
    category: 'disease',
    affectedPart: 'Leaves and Berries',
    fieldInspectionSteps: [
      'Look for yellowish oily translucent spots ("oil spots") on the upper leaf surface.',
      'Check underside of oil spots for delicate white downy growth during high humidity mornings.',
      'Inspect flower clusters and young berries for browning and hardening.',
    ],
    immediateNonChemicalActions: [
      'Perform canopy thinning and shoot pruning to improve sunlight penetration and air movement.',
      'Ensure vineyard floor is weed-free to reduce ground-level relative humidity.',
      'Remove and destroy infected shoot tips and mummified grape clusters.',
    ],
    preventiveActions: [
      'Maintain wide vine spacing and orientation along prevailing wind direction.',
      'Avoid high-volume overhead irrigation.',
      'Apply balanced nutrition avoiding excess nitrogen in early growth.',
    ],
    escalationTriggers: [
      'If white downy growth appears on young grape bunches during berry set.',
      'If consecutive rainy days occur during flowering.',
    ],
    sourceOrganization: 'ICAR-National Research Centre for Grapes (NRCG)',
    sourceDocument: 'Grapevine Disease Management Calendar',
    sourceDate: '2023',
    knowledgeVersion: 'agri-knowledge-v1.0',
    status: 'verified',
  },
};

export class AdvisoryService {
  /**
   * Fetch structured advisory by matching crop and pathology
   */
  public static getAdvisory(cropName: string, pathologyName?: string): StructuredAdvisory {
    const crop = cropName.toLowerCase();
    const pathology = (pathologyName || '').toLowerCase();

    if (crop.includes('cotton') || pathology.includes('blight') && crop.includes('cotton')) {
      return VERIFIED_AGRI_KNOWLEDGE_BASE['cotton_bacterial_blight'];
    }
    if (crop.includes('soybean') || pathology.includes('rust')) {
      return VERIFIED_AGRI_KNOWLEDGE_BASE['soybean_rust'];
    }
    if (crop.includes('tomato') || pathology.includes('early blight')) {
      return VERIFIED_AGRI_KNOWLEDGE_BASE['tomato_early_blight'];
    }
    if (crop.includes('rice') || crop.includes('paddy') || pathology.includes('blast')) {
      return VERIFIED_AGRI_KNOWLEDGE_BASE['rice_blast'];
    }
    if (crop.includes('grape') || pathology.includes('downy')) {
      return VERIFIED_AGRI_KNOWLEDGE_BASE['grape_downy_mildew'];
    }

    // Default general advisory for cotton
    return VERIFIED_AGRI_KNOWLEDGE_BASE['cotton_bacterial_blight'];
  }

  /**
   * Search knowledge base
   */
  public static searchKnowledgeBase(query: string): StructuredAdvisory[] {
    const q = query.toLowerCase().trim();
    if (!q) return Object.values(VERIFIED_AGRI_KNOWLEDGE_BASE);

    return Object.values(VERIFIED_AGRI_KNOWLEDGE_BASE).filter((item) => {
      return (
        item.cropName.toLowerCase().includes(q) ||
        item.issueName.toLowerCase().includes(q) ||
        item.affectedPart.toLowerCase().includes(q) ||
        item.fieldInspectionSteps.some((s) => s.toLowerCase().includes(q))
      );
    });
  }

  /**
   * Read advisory aloud using Web Speech Synthesis API
   */
  public static speakAdvisoryText(text: string, language: string): boolean {
    if (!('speechSynthesis' in window)) return false;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language code to BCP 47
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'mr') utterance.lang = 'mr-IN';
    else if (language === 'bn') utterance.lang = 'bn-IN';
    else if (language === 'ta') utterance.lang = 'ta-IN';
    else if (language === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  /**
   * Stop speech
   */
  public static stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
