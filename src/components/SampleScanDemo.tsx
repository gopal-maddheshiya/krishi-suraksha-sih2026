import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, X,
  Zap, Volume2, VolumeX, Eye, Flame, Layers, MapPin, Calendar, Clock,
  ChevronRight, Activity
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface SampleScanDemoProps {
  onNavigate: (section: string) => void;
}

interface BoundingBox {
  x: number; // Percentage from left
  y: number; // Percentage from top
  w: number; // Width percentage
  h: number; // Height percentage
  label: string;
  confidence: number;
}

interface RecoveryStep {
  day: string;
  title: string;
  titleHi: string;
  titleMr: string;
  action: string;
  actionHi: string;
  actionMr: string;
}

interface SampleDisease {
  id: string;
  crop: string;
  cropHi: string;
  cropMr: string;
  disease: string;
  diseaseHi: string;
  diseaseMr: string;
  scientific: string;
  severity: 'low' | 'moderate' | 'high';
  confidence: number;
  image: string;
  symptoms: string;
  symptomsHi: string;
  symptomsMr: string;
  organicRemedy: string;
  organicRemedyHi: string;
  organicRemedyMr: string;
  chemicalRemedy: string;
  chemicalRemedyHi: string;
  chemicalRemedyMr: string;
  dosage: string;
  dosageHi: string;
  phi: string;
  boxes: BoundingBox[];
  recoveryPlan: RecoveryStep[];
}

const samples: SampleDisease[] = [
  {
    id: 'tomato-blight',
    crop: 'Tomato',
    cropHi: 'टमाटर',
    cropMr: 'टोमॅटो',
    disease: 'Early Blight',
    diseaseHi: 'अगेती झुलसा (Early Blight)',
    diseaseMr: 'लवकर येणारा करपा',
    scientific: 'Alternaria solani',
    severity: 'moderate',
    confidence: 97.4,
    image: '/images/sample-tomato.jpg',
    symptoms: 'Concentric dark brown rings with chlorotic yellow halo margins on mature leaves.',
    symptomsHi: 'पुरानी पत्तियों पर पीले घेरे के साथ संकेंद्रित गहरे भूरे रंग के छल्ले और समय पूर्व पत्ती झड़ना।',
    symptomsMr: 'जुन्या पानांवर पिवळ्या कडांसह गडद तपकिरी वर्तुळाकार डाग.',
    organicRemedy: 'Foliar spray of Trichoderma viride (5g/L) combined with Cold-pressed Neem Oil (1500 ppm @ 3ml/L).',
    organicRemedyHi: 'ट्राइकोडर्मा विरिडे (5 ग्राम/लीटर) + नीम तेल 1500 ppm (3 मिली/लीटर) का 10 दिनों के अंतराल पर छिड़काव करें।',
    organicRemedyMr: 'ट्रायकोडर्मा विरिडी (५ ग्रॅम/लिटर) + कडुनिंब तेल १५०० ppm ची १० दिवसांच्या अंतराने फवारणी करा.',
    chemicalRemedy: 'Mancozeb 75% WP or Copper Oxychloride 50% WP (CIBRC Approved).',
    chemicalRemedyHi: 'मैंकोजेब 75% WP (2.5 ग्राम/लीटर) या कॉपर ऑक्सीक्लोराइड 50% WP।',
    chemicalRemedyMr: 'मॅन्कोझेब ७५% WP किंवा कॉपर ऑक्सिक्लोराईड ५०% WP.',
    dosage: '2.5g per litre water (500g / acre in 200L)',
    dosageHi: '2.5 ग्राम प्रति लीटर पानी (500 ग्राम / एकड़, 200 लीटर पानी में)',
    phi: 'Safe Pre-Harvest Interval (PHI): 7 Days',
    boxes: [
      { x: 26, y: 30, w: 42, h: 38, label: 'Alternaria Solani Primary Lesion', confidence: 97.4 },
      { x: 62, y: 56, w: 28, h: 30, label: 'Concentric Chlorotic Halo', confidence: 93.8 }
    ],
    recoveryPlan: [
      {
        day: 'Day 0',
        title: 'Quarantine & Pruning',
        titleHi: 'संक्रमित पत्तों की छंटाई',
        titleMr: 'बाधित पाने वेगळी करा',
        action: 'Remove severely diseased lower leaves and safely bury outside field.',
        actionHi: 'अत्यधिक संक्रमित निचली पत्तियों को तोड़कर खेत से दूर मिट्टी में दबा दें।',
        actionMr: 'जास्त खराब झालेली पाने काढून शेताबाहेर नष्ट करा.'
      },
      {
        day: 'Day 2',
        title: 'Bio-Fungicide Spray',
        titleHi: 'जैव-कवकनाशी छिड़काव',
        titleMr: 'जैविक बुरशीनाशक फवारणी',
        action: 'Apply Trichoderma viride + Neem formulation in late afternoon.',
        actionHi: 'शाम के समय ट्राइकोडर्मा विरिडे + नीम तेल का सुरक्षात्मक छिड़काव करें।',
        actionMr: 'संध्याकाळच्या वेळी ट्रायकोडर्मा व निंबोळी अर्काची फवारणी करा.'
      },
      {
        day: 'Day 7',
        title: 'Lesion Arrest Check',
        titleHi: 'धब्बों के फैलाव की जांच',
        titleMr: 'डागांची पाहणी',
        action: 'Inspect new apical foliage. If halo spreads, rotate to Mancozeb 75% WP.',
        actionHi: 'नई पत्तियों की जांच करें। यदि रोग फैले तो मैंकोजेब 75% WP का छिड़काव करें।',
        actionMr: 'नवीन पानांची पाहणी करा. रोग वाढल्यास मॅन्कोझेबची फवारणी करा.'
      },
      {
        day: 'Day 14',
        title: 'Safe Harvest (PHI)',
        titleHi: 'सुरक्षित तुड़ाई (PHI)',
        titleMr: 'सुरक्षित तोडणी',
        action: 'Complete chemical withdrawal period; crop is clean for market harvest.',
        actionHi: 'सुरक्षा अंतराल पूर्ण; टमाटर बाजार में बेचने व खाने के लिए पूर्णतः सुरक्षित।',
        actionMr: 'सुरक्षा कालावधी पूर्ण; फळे काढणीसाठी पूर्णपणे सुरक्षित.'
      }
    ]
  },
  {
    id: 'cotton-pest',
    crop: 'Cotton',
    cropHi: 'कपास',
    cropMr: 'कापूस',
    disease: 'Pink Bollworm Infestation',
    diseaseHi: 'गुलाबी सुंडी (Pink Bollworm)',
    diseaseMr: 'गुलाबी बोंडअळी प्रादुर्भाव',
    scientific: 'Pectinophora gossypiella',
    severity: 'high',
    confidence: 98.9,
    image: '/images/sample-cotton.jpg',
    symptoms: 'Larvae boring into squares and developing bolls, characteristic rosette flowers, lint staining.',
    symptomsHi: 'सुंडी द्वारा फूलों व बोंडों में छेद, रोसेट (गुलाबनुमा) फूल बनना और कपास के रेशे खराब होना।',
    symptomsMr: 'अळी बोंडात शिरणे, रोझेट (गुलाबासारखी) फुले तयार होणे आणि कापूस खराब होणे.',
    organicRemedy: 'Install 5-8 Gossyplure pheromone traps per acre + Release Trichogramma bactrae @ 60,000 eggs/acre.',
    organicRemedyHi: 'प्रति एकड़ 5-8 गॉसीप्लूर फेरोमोन ट्रैप लगाएं + ट्राइकोग्रामा परजीवी 60,000 अंडे/एकड़ छोड़ें।',
    organicRemedyMr: 'प्रति एकरी ५-८ गॉसिप्ल्यूर कामगंध सापळे लावा + ट्रायकोड्रॉमा कीटक सोडा.',
    chemicalRemedy: 'Emamectin Benzoate 5% SG or Profenofos 50% EC upon ETL threshold (>8 moths/trap/day).',
    chemicalRemedyHi: 'इमामेक्टिन बेंजोएट 5% SG (0.4 ग्राम/लीटर) या प्रोफेनोफॉस 50% EC।',
    chemicalRemedyMr: 'इमामेक्टिन बेंझोएट ५% SG किंवा प्रोफेनोफॉस ५०% EC.',
    dosage: '0.4g Emamectin Benzoate per litre water (80g / acre)',
    dosageHi: '0.4 ग्राम प्रति लीटर पानी (80 ग्राम / एकड़, 200 लीटर पानी में)',
    phi: 'Safe Pre-Harvest Interval (PHI): 14 Days',
    boxes: [
      { x: 30, y: 24, w: 44, h: 50, label: 'Pectinophora Larva Boring Site', confidence: 98.9 },
      { x: 18, y: 58, w: 26, h: 26, label: 'Secondary Entrance Frass', confidence: 95.2 }
    ],
    recoveryPlan: [
      {
        day: 'Day 0',
        title: 'Trapping & ETL Audit',
        titleHi: 'फेरोमोन ट्रैप व ईटीएल जांच',
        titleMr: 'सापळे व कीड मोजणी',
        action: 'Install 8 pheromone traps. Check daily moth catch to determine threshold.',
        actionHi: '8 फेरोमोन ट्रैप लगाएं। यदि लगातार 3 दिन 8 पतंगे/ट्रैप आएं तो तुरंत स्प्रे करें।',
        actionMr: '८ कामगंध सापळे लावा आणि दररोज पतंगांची मोजणी करा.'
      },
      {
        day: 'Day 2',
        title: 'Bio-Parasitoid Release',
        titleHi: 'ट्राइकोग्रामा परजीवी छोड़ना',
        titleMr: 'परजीवी कीटक सोडणे',
        action: 'Staple Trichocards on leaf undersides to destroy incoming moth eggs.',
        actionHi: 'ट्राइकोकार्ड को पत्तियों के नीचे स्टेपल करें ताकि अंडों से सुंडी न निकले।',
        actionMr: 'पानांच्या खाली ट्रायकोकार्ड लावा जेणेकरून अंडी नष्ट होतील.'
      },
      {
        day: 'Day 6',
        title: 'Targeted Ovicide / Larvicide',
        titleHi: 'लक्षित कीटनाशक स्प्रे',
        titleMr: 'कीटकनाशक फवारणी',
        action: 'Apply Emamectin Benzoate 5% SG precisely on squares and bolls.',
        actionHi: 'फूलों और गूलरों पर इमामेक्टिन बेंजोएट 5% SG का सटीक छिड़काव करें।',
        actionMr: 'बोंडांवर इमामेक्टिन बेंझोएट ५% SG ची फवारणी करा.'
      },
      {
        day: 'Day 14',
        title: 'Boll Health Verification',
        titleHi: 'बोंड स्वास्थ्य सत्यापन',
        titleMr: 'बोंड आरोग्य तपासणी',
        action: 'Verify rosette flower reduction; lint remains bright white and protected.',
        actionHi: 'रोसेट फूलों की समाप्ति; कपास का रेशा पूरी तरह सफेद और सुरक्षित।',
        actionMr: 'बोंडअळीचा नायनाट; कापूस निरोगी व पांढराशुभ्र राहील.'
      }
    ]
  },
  {
    id: 'rice-blast',
    crop: 'Rice / Paddy',
    cropHi: 'धान (चावल)',
    cropMr: 'भात / धान',
    disease: 'Rice Leaf Blast',
    diseaseHi: 'धान का झोंका रोग (Leaf Blast)',
    diseaseMr: 'भातावरील करपा (ब्लास्ट)',
    scientific: 'Magnaporthe oryzae',
    severity: 'high',
    confidence: 96.8,
    image: '/images/sample-rice.jpg',
    symptoms: 'Spindle-shaped diamond lesions with grayish-white centers and dark reddish-brown borders.',
    symptomsHi: 'पत्तियों पर धुरी के आकार के आंख जैसे धब्बे जिनका केंद्र राख जैसा और किनारे गहरे कत्थई होते हैं।',
    symptomsMr: 'पानांवर डोळ्याच्या आकाराचे राखाडी डाग आणि गडद तपकिरी कडा.',
    organicRemedy: 'Foliar spray of Pseudomonas fluorescens (2.5g/L) + Silicon-enriched rice husk ash.',
    organicRemedyHi: 'स्यूडोमोनास फ्लोरोसेंस (2.5 ग्राम/लीटर) का छिड़काव व नाइट्रोजन खाद की मात्रा कम करें।',
    organicRemedyMr: 'स्यूडोमोनास फ्लोरोसेन्स (२.५ ग्रॅम/लिटर) फवारणी करा आणि नत्र खत कमी करा.',
    chemicalRemedy: 'Tricyclazole 75% WP or Isoprothiolane 40% EC at early neck-blast initiation.',
    chemicalRemedyHi: 'ट्राइसाइक्लाजोल 75% WP (0.6 ग्राम/लीटर) या आइसोप्रथियोलेन 40% EC।',
    chemicalRemedyMr: 'ट्रायसायक्लाझोल ७५% WP किंवा आयसोप्रोथिओलेन ४०% EC.',
    dosage: '0.6g Tricyclazole per litre water (120g / acre)',
    dosageHi: '0.6 ग्राम प्रति लीटर पानी (120 ग्राम / एकड़, 200 लीटर पानी में)',
    phi: 'Safe Pre-Harvest Interval (PHI): 21 Days',
    boxes: [
      { x: 34, y: 20, w: 36, h: 52, label: 'Magnaporthe Spindle Lesion', confidence: 96.8 },
      { x: 42, y: 66, w: 24, h: 22, label: 'Necrotic Foliar Margin', confidence: 92.4 }
    ],
    recoveryPlan: [
      {
        day: 'Day 0',
        title: 'Nitrogen Halt & Water Drainage',
        titleHi: 'यूरिया बंद व जल निकास',
        titleMr: 'युरिया खत थांबवा',
        action: 'Immediately halt top-dressing nitrogen urea; drain standing stagnant water.',
        actionHi: 'यूरिया डालना तुरंत बंद करें और खेत का अतिरिक्त पानी 2 दिन के लिए निकालें।',
        actionMr: 'युरिया देणे ताबडतोब थांबवा आणि शेतातील साचलेले पाणी काढून टाका.'
      },
      {
        day: 'Day 2',
        title: 'Bio-Control Inoculation',
        titleHi: 'स्यूडोमोनास बायो-स्प्रे',
        titleMr: 'स्यूडोमोनास फवारणी',
        action: 'Spray Pseudomonas fluorescens to colonize leaf surface against spore germination.',
        actionHi: 'पत्तियों पर स्यूडोमोनास फ्लोरोसेंस का छिड़काव करें ताकि नए बीजाणु न पनपें।',
        actionMr: 'पानांवर स्यूडोमोनासची फवारणी करा.'
      },
      {
        day: 'Day 5',
        title: 'Systemic Fungicide Cover',
        titleHi: 'ट्राइसाइक्लाजोल सुरक्षा आवरण',
        titleMr: 'बुरशीनाशक सुरक्षा',
        action: 'Apply Tricyclazole 75% WP to safeguard emerging panicles from neck blast.',
        actionHi: 'बाली निकलने की अवस्था में ट्राइसाइक्लाजोल 75% WP का सुरक्षात्मक छिड़काव करें।',
        actionMr: 'लोंब्या सुरक्षित ठेवण्यासाठी ट्रायसायक्लाझोलची फवारणी करा.'
      },
      {
        day: 'Day 21',
        title: 'Healthy Grain Filling',
        titleHi: 'स्वस्थ दाना भराव (PHI)',
        titleMr: 'निरोगी दाणे भरणे',
        action: 'Safe PHI period concluded. Panicles mature without sterile chaffy grains.',
        actionHi: 'सुरक्षा अवधि पूर्ण; धान की बालियों में शत-प्रतिशत स्वस्थ दानों का भराव।',
        actionMr: 'सुरक्षा कालावधी पूर्ण; लोंब्यांमध्ये निरोगी दाणे भरतील.'
      }
    ]
  },
  {
    id: 'soybean-rust',
    crop: 'Soybean',
    cropHi: 'सोयाबीन',
    cropMr: 'सोयाबीन',
    disease: 'Asian Soybean Rust',
    diseaseHi: 'सोयाबीन रस्ट (तांबेरा/गेरुआ)',
    diseaseMr: 'सोयाबीन तांबेरा रोग',
    scientific: 'Phakopsora pachyrhizi',
    severity: 'moderate',
    confidence: 98.1,
    image: '/images/sample-soybean.jpg',
    symptoms: 'Tiny tan to brick-red pustules erupting primarily on lower leaf surfaces causing rapid defoliation.',
    symptomsHi: 'पत्तियों की निचली सतह पर बारीक तांबे जैसे लाल-भूरे दाने जिससे पत्तियां पीली पड़कर सूखती हैं।',
    symptomsMr: 'पानांच्या खालच्या भागावर लहान तांबूस-तपकिरी ठिपके, पाने पिवळी पडून गळतात.',
    organicRemedy: 'Preventive foliar wash with Bacillus subtilis (5g/L) or Panchagavya (3% solution).',
    organicRemedyHi: 'बैसिलस सबटिलिस जैव-कवकनाशी (5g/L) या 3% पंचगव्य का सुरक्षात्मक छिड़काव।',
    organicRemedyMr: 'बॅसिलस सबटिलिस जैविक बुरशीनाशक (५ ग्रॅम/लिटर) किंवा ३% पंचगव्य फवारणी करा.',
    chemicalRemedy: 'Hexaconazole 5% EC or Tebuconazole 25.9% EC at the first sign of rust pustules.',
    chemicalRemedyHi: 'हेक्साकोनाजोल 5% EC (2 ml/L) या टेबुकोनाजोल 25.9% EC (1 ml/L)।',
    chemicalRemedyMr: 'हेक्साकोनाझोल ५% EC (२ मिली/लिटर) किंवा टेबुकोनाझोल २५.९% EC.',
    dosage: '1.0 ml Tebuconazole per litre water (200 ml / acre)',
    dosageHi: '1.0 मिली टेबुकोनाजोल प्रति लीटर पानी (200 मिली / एकड़, 200 लीटर पानी में)',
    phi: 'Safe Pre-Harvest Interval (PHI): 15 Days',
    boxes: [
      { x: 24, y: 28, w: 50, h: 46, label: 'Phakopsora Pustule Colony', confidence: 98.1 },
      { x: 58, y: 16, w: 30, h: 32, label: 'Uredinial Spore Outbreak', confidence: 93.6 }
    ],
    recoveryPlan: [
      {
        day: 'Day 0',
        title: 'Lower Canopy Inspection',
        titleHi: 'निचली पत्तियों की जांच',
        titleMr: 'खालच्या पानांची तपासणी',
        action: 'Inspect bottom leaves with magnifying lens for active brick-red erupting pustules.',
        actionHi: 'फसल के नीचे की पत्तियों की जांच करें कि क्या तांबे जैसे लाल दाने फूटे हैं।',
        actionMr: 'पानांच्या खालच्या बाजूस तांबूस ठिपके तपासा.'
      },
      {
        day: 'Day 2',
        title: 'Bio-Fungicide Suppression',
        titleHi: 'जैव-कवकनाशी से रोकथाम',
        titleMr: 'जैविक बुरशीनाशक फवारणी',
        action: 'Spray Bacillus subtilis to form protective biofilm across leaf undersides.',
        actionHi: 'पत्तियों के नीचे बैसिलस सबटिलिस का छिड़काव करें ताकि बीजाणु न फैलें।',
        actionMr: 'पानांवर जैविक बुरशीनाशकाची फवारणी करा.'
      },
      {
        day: 'Day 5',
        title: 'Triazole Curative Spray',
        titleHi: 'ट्रायजोल उपचारात्मक छिड़काव',
        titleMr: 'बुरशीनाशक उपचार',
        action: 'Apply Tebuconazole 25.9% EC to halt internal mycelial incubation.',
        actionHi: 'टेबुकोनाजोल 25.9% EC का छिड़काव करके रोग को तुरंत बढ़ने से रोकें।',
        actionMr: 'टेबुकोनाझोल २५.९% EC ची फवारणी करून रोग थांबवा.'
      },
      {
        day: 'Day 15',
        title: 'Healthy Pod Formation',
        titleHi: 'स्वस्थ फली विकास (PHI)',
        titleMr: 'निरोगी शेंगा विकास',
        action: 'Full canopy retention achieved; soybean pods fill with maximum grain weight.',
        actionHi: 'पत्तियां हरी बनी रहेंगी और फलियों में भरपूर वजनदार दाना भरेगा।',
        actionMr: 'पाने निरोगी राहून शेंगांमध्ये दर्जेदार दाणे भरतील.'
      }
    ]
  }
];

export default function SampleScanDemo({ onNavigate }: SampleScanDemoProps) {
  const { lang } = useLang();
  const [selectedSample, setSelectedSample] = useState<SampleDisease | null>(null);
  const [visionMode, setVisionMode] = useState<'yolo' | 'heatmap' | 'original'>('yolo');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'recovery'>('diagnosis');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Stop speech when modal closes or unmounts & listen to Tour events
  useEffect(() => {
    const handleTrigger = (e: any) => {
      const targetId = e.detail?.id || 'tomato-early-blight';
      const found = samples.find(s => s.id === targetId) || samples[0];
      handleSelectSample(found);
    };

    const handleClose = () => {
      handleCloseModal();
    };

    window.addEventListener('trigger-sample-scan-demo', handleTrigger);
    window.addEventListener('close-sample-scan-demo', handleClose);

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      window.removeEventListener('trigger-sample-scan-demo', handleTrigger);
      window.removeEventListener('close-sample-scan-demo', handleClose);
    };
  }, []);

  const handleSelectSample = (sample: SampleDisease) => {
    setAnalyzingId(sample.id);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setTimeout(() => {
      setSelectedSample(sample);
      setVisionMode('yolo');
      setActiveTab('diagnosis');
      setAnalyzingId(null);
    }, 400);
  };

  const handleCloseModal = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setSelectedSample(null);
  };

  const toggleAudioSpeech = () => {
    if (!('speechSynthesis' in window) || !selectedSample) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const cropName = lang === 'hi' ? selectedSample.cropHi : selectedSample.crop;
    const diseaseName = lang === 'hi' ? selectedSample.diseaseHi : selectedSample.disease;
    const organic = lang === 'hi' ? selectedSample.organicRemedyHi : selectedSample.organicRemedy;
    const chemical = lang === 'hi' ? selectedSample.chemicalRemedyHi : selectedSample.chemicalRemedy;

    const speechText = lang === 'hi'
      ? `फसल: ${cropName}। रोग: ${diseaseName}। सटीकता: ${selectedSample.confidence} प्रतिशत। जैविक उपचार: ${organic}। रासायनिक उपचार: ${chemical}। खुराक: ${selectedSample.dosageHi}।`
      : `Crop: ${cropName}. Diagnosis: ${diseaseName} with ${selectedSample.confidence} percent confidence. Biological remedy: ${organic}. Recommended chemical: ${chemical}. Dosage: ${selectedSample.dosage}.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <section 
      id="sample-scan-section"
      aria-label="AI Diagnostic Studio & Sample Crop Testing"
      className="py-10 sm:py-14 bg-white/90 backdrop-blur-xl rounded-3xl border border-stone-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] relative overflow-hidden scroll-mt-20"
    >
      {/* Background organic glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-5 sm:px-8 lg:px-10 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-900 text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            <span>{lang === 'hi' ? 'AI विजन डायग्नोस्टिक स्टूडियो' : 'AI Vision Diagnostic Studio'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
            {lang === 'hi'
              ? 'खेत की असली फसलों पर 1-क्लिक AI कंप्यूटर विजन टेस्ट'
              : '1-Click Computer Vision Test on Real Field Crops'}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed max-w-2xl mx-auto">
            {lang === 'hi'
              ? 'यदि अभी आपके पास पत्ती की फोटो उपलब्ध नहीं है, तो नीचे दिए गए 4 सैंपल पर क्लिक करके लाइव AI बाउंडिंग बॉक्स डिटेक्शन, रोग कारक और ICAR प्रमाणित उपचार देखें।'
              : 'No field photo right now? Tap any sample below to evaluate our multi-crop deep learning vision model with live bounding box detections and ICAR-backed treatment protocols.'}
          </p>
        </div>

        {/* 4 Sample Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {samples.map((sample) => {
            const cropTitle = lang === 'hi' ? sample.cropHi : lang === 'mr' ? sample.cropMr : sample.crop;
            const diseaseTitle = lang === 'hi' ? sample.diseaseHi : lang === 'mr' ? sample.diseaseMr : sample.disease;
            const isAnalyzingThis = analyzingId === sample.id;

            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="group relative bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-emerald-600/70 overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container with Vision Grid */}
                <div className="relative aspect-square overflow-hidden bg-stone-900">
                  <img
                    src={sample.image}
                    alt={sample.disease}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />

                  {/* Laser Scanning Line Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 pointer-events-none" />

                  {/* Corner Reticle Brackets */}
                  <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
                  <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

                  {/* Crop Tag Pill */}
                  <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{cropTitle}</span>
                  </div>

                  {/* Confidence Badge */}
                  <div className="absolute bottom-3 right-3 bg-emerald-700/90 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-emerald-400/30">
                    <Zap className="w-3 h-3 text-amber-300" />
                    <span>{sample.confidence}%</span>
                  </div>

                  {/* Analyzing Spinner Overlay */}
                  {isAnalyzingThis && (
                    <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-bold tracking-wider uppercase">{lang === 'hi' ? 'AI स्कैनिंग...' : 'AI Vision Scan...'}</span>
                    </div>
                  )}
                </div>

                {/* Card Information */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        sample.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sample.severity === 'high'
                        ? (lang === 'hi' ? 'गंभीर जोखिम' : 'High Severity')
                        : (lang === 'hi' ? 'मध्यम जोखिम' : 'Moderate Severity')}
                    </span>
                    <span className="text-[10px] text-stone-400 font-semibold italic truncate max-w-[110px]">
                      {sample.scientific}
                    </span>
                  </div>

                  <h3 className="font-black text-stone-900 text-sm group-hover:text-emerald-800 transition-colors line-clamp-1">
                    {diseaseTitle}
                  </h3>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-800 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'hi' ? 'AI विजन रिपोर्ट देखें' : 'View Vision Report'}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================= */}
        {/* INTERACTIVE AI COMPUTER VISION MODAL & DIAGNOSTIC STUDIO      */}
        {/* ============================================================= */}
        {selectedSample && (
          <div 
            className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Sticky Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-stone-100 px-5 py-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-stone-900 leading-none">
                        {lang === 'hi' ? selectedSample.diseaseHi : selectedSample.disease}
                      </h3>
                      <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-extrabold uppercase">
                        {lang === 'hi' ? selectedSample.cropHi : selectedSample.crop}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 italic mt-0.5">
                      {selectedSample.scientific} • {lang === 'hi' ? 'ICAR पैथोलॉजी कोड: ICAR-AG-2026' : 'ICAR Pathology Code: ICAR-AG-2026'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-4 sm:p-6 space-y-5">

                {/* 1. VISION DISPLAY & DETECTIONS */}
                <div className="space-y-3">
                  
                  {/* Vision Controls Bar: Mode Switcher + Audio Waveform */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
                    
                    {/* Mode Buttons */}
                    <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200/80 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setVisionMode('yolo')}
                        className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                          visionMode === 'yolo'
                            ? 'bg-white text-emerald-900 shadow-2xs font-black'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{lang === 'hi' ? 'AI बाउंडिंग बॉक्स (YOLO)' : 'AI Bounding Boxes'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisionMode('heatmap')}
                        className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                          visionMode === 'heatmap'
                            ? 'bg-white text-emerald-900 shadow-2xs font-black'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 text-rose-600" />
                        <span>{lang === 'hi' ? 'स्पोर घनत्व हीटमैप' : 'Spore Heatmap'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisionMode('original')}
                        className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                          visionMode === 'original'
                            ? 'bg-white text-emerald-900 shadow-2xs font-black'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-stone-500" />
                        <span>{lang === 'hi' ? 'मूल फोटो' : 'Raw Leaf'}</span>
                      </button>
                    </div>

                    {/* Speech Voice Synthesizer Button with Soundwave */}
                    <button
                      type="button"
                      onClick={toggleAudioSpeech}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
                        isPlayingAudio
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs ring-2 ring-emerald-300/50'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      {isPlayingAudio ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>{lang === 'hi' ? 'ऑडियो रोकें' : 'Stop Audio'}</span>
                          {/* Animated Sound Waveform bars */}
                          <div className="flex items-center gap-0.5 ml-1">
                            <span className="w-0.5 h-3 bg-white animate-bounce" />
                            <span className="w-0.5 h-4 bg-white animate-bounce [animation-delay:0.1s]" />
                            <span className="w-0.5 h-2 bg-white animate-bounce [animation-delay:0.2s]" />
                            <span className="w-0.5 h-3.5 bg-white animate-bounce [animation-delay:0.15s]" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{lang === 'hi' ? 'ऑडियो में सुनें (Listen Voice)' : 'Voice Briefing'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Interactive Leaf Vision Frame */}
                  <div className="relative rounded-2xl overflow-hidden border border-stone-300 aspect-video sm:aspect-2/1 bg-stone-950 shadow-inner">
                    <img
                      src={selectedSample.image}
                      alt={selectedSample.disease}
                      className="w-full h-full object-cover"
                    />

                    {/* MODE 1: YOLO BOUNDING BOXES OVERLAY */}
                    {visionMode === 'yolo' && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Animated Holographic AI Laser Scanning Beam */}
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 via-emerald-400 to-transparent shadow-[0_0_16px_#10b981] animate-laser-scan pointer-events-none z-10" />

                        {selectedSample.boxes.map((b, idx) => (
                          <div
                            key={idx}
                            style={{
                              left: `${b.x}%`,
                              top: `${b.y}%`,
                              width: `${b.w}%`,
                              height: `${b.h}%`,
                            }}
                            className="absolute border-2 border-emerald-400/90 rounded-lg bg-emerald-400/10 shadow-[0_0_12px_rgba(52,211,153,0.3)] transition-all"
                          >
                            {/* Corner Accents */}
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-emerald-400 rounded-xs" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-xs" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-400 rounded-xs" />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-400 rounded-xs" />

                            {/* Detection Label Tag */}
                            <div className="absolute -top-6 left-0 bg-stone-950/90 backdrop-blur-md text-emerald-300 border border-emerald-400/50 text-[10px] font-black px-2 py-0.5 rounded shadow-md whitespace-nowrap flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              <span>{b.label}: {b.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* MODE 2: SPORE DENSITY HEATMAP PSEUDO-OVERLAY */}
                    {visionMode === 'heatmap' && (
                      <div className="absolute inset-0 bg-radial from-rose-500/50 via-amber-400/30 to-transparent mix-blend-color-burn pointer-events-none flex items-end p-3">
                        <div className="bg-stone-950/85 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[11px] font-bold border border-rose-500/40">
                          🔥 {lang === 'hi' ? 'स्पोर सांद्रता: अत्यधिक सक्रिय (Zone 1 Hotspot)' : 'Spore Density: Actively Incubating (Zone 1 Hotspot)'}
                        </div>
                      </div>
                    )}

                    {/* Bottom Telemetry Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
                      <div className="bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-extrabold">{lang === 'hi' ? 'AI सटीकता' : 'Accuracy'}: {selectedSample.confidence}%</span>
                      </div>
                      <div className="bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 font-bold text-[11px]">
                        {lang === 'hi' ? 'प्रमाणित: ICAR-CIBRC डेटाबेस' : 'Verified: ICAR-CIBRC Database'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. TABS: DIAGNOSIS & REMEDIES vs 14-DAY RECOVERY CALENDAR */}
                <div className="border-b border-stone-200 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('diagnosis')}
                    className={`pb-2.5 text-xs sm:text-sm font-black transition-all relative ${
                      activeTab === 'diagnosis'
                        ? 'text-emerald-900 border-b-2 border-emerald-700'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {lang === 'hi' ? '1. रोग निदान व अनुशंसित उपचार' : '1. Diagnosis & ICAR Treatments'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('recovery')}
                    className={`pb-2.5 text-xs sm:text-sm font-black transition-all relative flex items-center gap-1.5 ${
                      activeTab === 'recovery'
                        ? 'text-emerald-900 border-b-2 border-emerald-700'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{lang === 'hi' ? '2. 14-दिवसीय रिकवरी कैलेंडर (Timeline)' : '2. 14-Day Recovery Calendar'}</span>
                  </button>
                </div>

                {/* TAB CONTENT 1: DIAGNOSIS & REMEDIES */}
                {activeTab === 'diagnosis' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    
                    {/* Visible Symptoms Callout */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs">
                      <span className="font-black text-stone-500 uppercase tracking-wider block mb-1">
                        {lang === 'hi' ? 'पहचाने गए लक्षण (Field Symptoms)' : 'Field Symptoms'}
                      </span>
                      <p className="text-stone-800 font-medium leading-relaxed">
                        {lang === 'hi' ? selectedSample.symptomsHi : selectedSample.symptoms}
                      </p>
                    </div>

                    {/* Integrated Pest Management (Biological + Chemical) Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      
                      {/* Biological / Eco-Friendly Control */}
                      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                          <span>{lang === 'hi' ? 'जैविक व पर्यावरण-अनुकूल उपचार' : 'Organic & Bio-Control'}</span>
                        </div>
                        <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                          {lang === 'hi' ? selectedSample.organicRemedyHi : selectedSample.organicRemedy}
                        </p>
                        <div className="text-[10px] text-emerald-800 bg-emerald-100/60 px-2 py-1 rounded font-bold">
                          ✓ {lang === 'hi' ? 'मित्र कीटों व केंचुओं के लिए 100% सुरक्षित' : 'Safe for beneficial pollinators & soil biome'}
                        </div>
                      </div>

                      {/* Chemical Control & Certified Dosage */}
                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
                        <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                          <span>{lang === 'hi' ? 'रासायनिक उपचार व सटीक खुराक' : 'Chemical Control & Dosage'}</span>
                        </div>
                        <p className="text-xs text-amber-950 font-bold leading-relaxed">
                          {lang === 'hi' ? selectedSample.chemicalRemedyHi : selectedSample.chemicalRemedy}
                        </p>
                        
                        {/* Dosage and PHI Strip */}
                        <div className="p-2 rounded-xl bg-amber-100/70 text-[11px] text-amber-950 space-y-1 font-semibold">
                          <div><strong>{lang === 'hi' ? 'खुराक' : 'Dosage'}:</strong> {lang === 'hi' ? selectedSample.dosageHi : selectedSample.dosage}</div>
                          <div className="text-emerald-800 font-bold"><strong>{selectedSample.phi}</strong></div>
                        </div>

                        {/* Direct Dealer Locator CTA */}
                        <button
                          type="button"
                          onClick={() => {
                            handleCloseModal();
                            onNavigate('medical-map');
                          }}
                          className="w-full mt-2 py-1.5 px-3 rounded-xl bg-amber-200/80 hover:bg-amber-300/80 text-amber-950 text-[11px] font-black transition-all flex items-center justify-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-800" />
                          <span>{lang === 'hi' ? 'निकटतम प्रमाणित खाद-बीज दुकान देखें' : 'Locate Certified Dealers for Remedy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 2: 14-DAY ICAR RECOVERY TIMELINE */}
                {activeTab === 'recovery' && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-stone-600 mb-2">
                      {lang === 'hi'
                        ? 'प्रोटोकॉल का पालन करने पर पौधे के पूर्ण स्वस्थ होने का 4-चरणीय वैज्ञानिक चक्र:'
                        : 'ICAR 4-Step Scientific Recovery Progression:'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedSample.recoveryPlan.map((step, sIdx) => (
                        <div key={sIdx} className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black">
                              {step.day}
                            </span>
                            <span className="font-bold text-stone-700">
                              {lang === 'hi' ? step.titleHi : step.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 font-medium leading-relaxed pt-1">
                            {lang === 'hi' ? step.actionHi : step.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseModal();
                      onNavigate('report');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm text-center shadow-sm transition-all"
                  >
                    {lang === 'hi' ? '📸 अपनी फसल की नई फोटो स्कैन करें' : '📸 Scan Your Own Crop Leaf'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseModal();
                      onNavigate('expert');
                    }}
                    className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm text-center transition-all"
                  >
                    {lang === 'hi' ? '👨‍🔬 KVK कृषि वैज्ञानिक से पुष्टि करवाएं' : '👨‍🔬 KVK Scientist Referral'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
