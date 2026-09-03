import { useState, useEffect } from 'react';
import {
  Leaf, Search, Volume2, VolumeX, ShieldCheck,
  CheckCircle2, AlertTriangle, Sprout, Info, ChevronRight, X, Phone,
  Filter, Award, FlaskConical, Clock, BookOpen, Mic,
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import {
  AdvisoryService,
  VERIFIED_AGRI_KNOWLEDGE_BASE,
  type StructuredAdvisory
} from '@/services/AdvisoryService';

interface ExtendedAdvisory extends StructuredAdvisory {
  cropHi?: string;
  issueHi?: string;
  chemicalDosage?: string;
  organicRemedy?: string;
  phiDays?: number;
}

const EXTENDED_ICAR_ADVISORIES: ExtendedAdvisory[] = [
  {
    cropName: 'Cotton',
    cropHi: 'कपास',
    issueName: 'Pink Bollworm (गुलाबी सुंडी / ব।ंडअळी)',
    issueHi: 'गुलाबी सुंडी (पिंক বॉলवर्म)',
    category: 'pest',
    affectedPart: 'Flower buds, Squares, and Bolls',
    fieldInspectionSteps: [
      'গুলাব जैसे वিকृत फूल (Rosette Flowers) दिखाई दें তো তुरंত খোলकर अंদর ছোटी গুলাবী इল्ली देखें।',
      'हरे ब।ंडোং पर বारीক ছिद্র और অন্দर की ओर भूरे ধब্বে जাঁचें।',
      'প্রতি একড़ 5 ফেরোমোন ট্রैপ লগाकর প্রতি ট্রैপ 8-10 পতঙে আने पर তৎকাল कদম উठाएँ।',
    ],
    immediateNonChemicalActions: [
      'खेत में প্রতি एकड़ 5-8 ফেরোমোন ट्रैप লगাএँ।',
      'ট্রাইকোগ্রামা পরজीवী 1.5 লাখ अंडে/एकड़ 3 बार छोड़ें।',
      'नीম का तेल (1500 ppm) 5 ml प्रति लीटर पानी में मिलाकर প্রारंभिक छिड়काव करें।',
    ],
    preventiveActions: [
      'खेत में ब।ंडअळी के अ�वशेष और गिरे हुए फूलওं को একত্র কর नষ্ট কর कर।.',
      'फসল की কটाई के बाद खेत की गहरी जुতाई करें ताकि পিউপা नষ্ট হো জাএँ।',
    ],
    escalationTriggers: [
      'यদि 10% সে অধিক ব।ंडোং में ইল्ली का प्रবেশ দिखাঈ দें (ETL পার হো)।',
    ],
    chemicalDosage: 'ইমামেক্টিন বেঁজোএট 5% SG @ 0.4 গ্রাম/লীটর या প্রোফেনোফোস 50% EC @ 2.0 ml/লীটর',
    organicRemedy: 'নীম का তেল 1500 ppm @ 5 ml/L + বাভেরিয়া বেসিয়ানা @ 5 gm/L',
    phiDays: 14,
    sourceOrganization: 'ICAR-CICR (केन्द্রीय कपास অनुसंধান संস্থান, নাগপুর)',
    sourceDocument: 'ICAR-CICR Cotton IPM Package 2024-26',
    sourceDate: '2024',
    knowledgeVersion: 'icar-cicr-v2.4',
    status: 'verified',
  },
  {
    cropName: 'Tomato',
    cropHi: 'टমাটার',
    issueName: 'Early Blight (টমাটার আগেতী ঝুলসা)',
    issueHi: 'আগেতী ঝুলসা (আর্লী ব্লাইট)',
    category: 'disease',
    affectedPart: 'Older Lower Leaves & Stems',
    fieldInspectionSteps: [
      'नিচली पुरানी पत्तियোং पर গহरे भूरे রং के छल्लেদার (Target Rings) ধব্বে देखें।',
      'ধব্বোং के চারোং ओর হল्का पीलা ঘেরা (Yellow Halo) দিখাঈ দেগা।',
      'গম্ভীর স্থিতি में पत्तियाँ सूखकर नीচে গिर जाती हैं।',
    ],
    immediateNonChemicalActions: [
      'संक्रमিত नিচली पत्तियोং को তোड़कर खेत से দूर जमीন में গाड़ দें।',
      'পৌধোং के নীচে ড্রিপ या थाला বিধि से পानी दें, পत्तियোং पर पानी ন ছিড়कें।',
      'खेत में বায়ु সঞ্চার বড়ানे के लिए খরপতবার সাফ करें।',
    ],
    preventiveActions: [
      'बুবাঈ से পহলে ট্রাইকোডার্মা বিরিদী (5-10 গ্রাম/কিগ্রা বীজ) से বীজ উচ্চার করেন।',
      'फসল চক্র অপনাএँ, সোলানেসী কুল (आलू, बैंगন) के बाद तुरंत टমাটার ন লগাএँ।',
    ],
    escalationTriggers: [
      'यদि লক্ষ্ণ মুখ্য तने या ফলোং के ডंঠল तক ফैलने লगें।.',
    ],
    chemicalDosage: 'কোপার অক্সিকক্লোরাই ড 50% WP @ 2.5 গ্রাম/লীটর या ম্যাঙ্কোজেব 75% WP @ 2.5 গ্রাম/লীটর',
    organicRemedy: 'ট্রাইকোডার্মা বিরিদী 1% WP @ 5 গ্রাম/লীটর + সিউডোমোনাস 5 গ্রাম/লীটর',
    phiDays: 7,
    sourceOrganization: 'ICAR-IIVR (ভারতীয় সব्जী অनुसंধান संস্থान, বারানসী)',
    sourceDocument: 'Vegetable Pathology Bulletin 2024',
    sourceDate: '2024',
    knowledgeVersion: 'icar-iivr-v3.1',
    status: 'verified',
  },
  {
    cropName: 'Rice',
    cropHi: 'ধান (চাবল)',
    issueName: 'Rice Blast (ধান का ঝোঁকা / ব্লাস্ট রোগ)',
    issueHi: 'ঝোঁকা রোগ (ব্লাস্ট)',
    category: 'disease',
    affectedPart: 'Leaves, Nodes & Neck',
    fieldInspectionSteps: [
      'পত্তিয়োং पर आঁখ या নাব के আকার के (Spindle Shaped) ধব্বে देखें যিঁহঁকা केन्द্র সফেদ और কিনারে ভূরে হোঁ।',
      'বালী के গর্দন বালে হিসসে (Neck) पर কালা ধব্বা জাঁচें যিসসে বালী টুটকর লটক জাতী है।',
      'অত্যধিক নাইট্রোজেন খাড বালে খেতোং में বিশেষ রূপ से নিরীক্ষণ করেন।',
    ],
    immediateNonChemicalActions: [
      'যুরিয়া (নাইট্রোজেন) খাড का প্রয়োগ তुरঁত রোকें।',
      'খেতে में পানী का স্তর সন্তুলিত রাখেন, খেতে কো সूখने ন দें।',
      'সিউডোমোনাস ফ্লোরোসঁস @ 5 গ্রাম/লীটর का ছিড়কাব করেন।',
    ],
    preventiveActions: [
      'প্রমাণিত ব্লাস্ট-প্রতিরোধী কিস্মোং (যেসে পুসা 44, MTU 1010) का চযন করেন।',
      'কার্বেনডাজিম 2 গ্রাম/কিগ্রা से বীজ শোধন করেন।',
    ],
    escalationTriggers: [
      'বালী নিকলতে সময গर्दন पर কালাপন আনে पर (Neck Blast)।',
    ],
    chemicalDosage: 'ট্রাইসাইক্লাজোল 75% WP @ 0.6 গ্রাম/লীটর या আইসোপ্রোথিওলেন 40% EC @ 1.5 ml/লীটর',
    organicRemedy: 'সিউডোমোনাস ফ্লোরোসঁস @ 5 গ্রাম/লীটর পানী',
    phiDays: 21,
    sourceOrganization: 'ICAR-NRRI (রাষ্ট্রীয চাবল অनुसंধান संস্থान, কটক)',
    sourceDocument: 'Rice Blast Management Protocol',
    sourceDate: '2024',
    knowledgeVersion: 'icar-nrri-v4.0',
    status: 'verified',
  },
  {
    cropName: 'Soybean',
    cropHi: 'সোযাবীন',
    issueName: 'Soybean Rust & Pod Borer (সোযাবীন রাস্ট ভ ইল्ली)',
    issueHi: 'সোযাবীন রাস্ট এবং ফলী ছেদক',
    category: 'disease',
    affectedPart: 'Foliage & Developing Pods',
    fieldInspectionSteps: [
      'নিচলী পত্তিয়োং কী নিচলী সতহ पर বারীক ভূরে রঙ কে উভার (Pustules) দেখে্ং।',
      'পত্তিয়োং का সময সে পহলে পীলা পড়কর গিরনা জাঁচেন্ং।',
      'ফূল এবং ফলিযোং মেঁ ছেদ করনে বালী হরী ইল্লিযোং কা নিরীক্ষণ করেন্ং।',
    ],
    immediateNonChemicalActions: [
      'খেতে কে চারোং ওর হবা কা প্রবাহ বনাএ রাখনে কে লিএ মেড়োং কী ঘাস কাটেন্ং।',
      'শাম কে সময স্প্রিঙ্কলর সে পানী দেনে সে বচেন্ং।',
      'নীম অর্ক 5% কা পহলা সুরক্ষাত্মক ছিড়কাব করেন্ং।',
    ],
    preventiveActions: [
      'উচিত কতার দূরী (45x5 সেমী) पर বুবাঈ করেন্ং।',
      'সোযাবীন কে সাথ মক্কা या জ্বার কী অন্তর্বর্তীয ফসল লগাএঁ।',
    ],
    escalationTriggers: [
      'ফূল আনে কী অবস্থা মে রাস্ট কা পত্তিযোং সে ঊপর কী ওর বড়না।',
    ],
    chemicalDosage: 'হেক্সাকোনাজোল 5% EC @ 2.0 ml/লীটর या টেবুকোনাজোল 25.9% EC @ 1.5 ml/লীটর',
    organicRemedy: 'নীম তেল 1500 ppm @ 5 ml/L + ট্রাইকোডার্মা 5 gm/L',
    phiDays: 15,
    sourceOrganization: 'ICAR-IISR (ভারতীয সোযাবীন অनुसंধান संস্থান, ইন্দোর)',
    sourceDocument: 'Soybean Health Advisory Package',
    sourceDate: '2024',
    knowledgeVersion: 'icar-iisr-v2.8',
    status: 'verified',
  },
  {
    cropName: 'Chilli',
    cropHi: 'মির্চ',
    issueName: 'Chilli Leaf Curl & Thrips (মির্চ কা মরোড়িযা রোগ ভ থ্রিপ্স)',
    issueHi: 'মরোড়িযা রোগ এবং থ্রিপ্স',
    category: 'pest',
    affectedPart: 'Top Tender Leaves & Shoots',
    fieldInspectionSteps: [
      'পত্তিযাঁ ঊপর কী ওর নাব জেসী মুড়ী হুঈ (Upward Cupping) দিখেন টো থ্রিপ্স কী জাঁচ করেন্ং।',
      'পত্তিযাঁ নীচে কী ওর মুড়ী হুঈ (Downward Cupping) হোঁ টো মাইট্স (Mites) কা প্রকোপ হৈ।',
      'পৌধোং কী নঈ বড়বার রুক জানা এবং পত্তিযাঁ ছোটী রহ জানা।',
    ],
    immediateNonChemicalActions: [
      'খেতে মে প্রতি একড় 20 নীলে এবং পীলে চিপচিপে জাল (Sticky Traps) লগাএঁ।',
      'খেতে কে চারোং ওর মক্কা या জ্বার কী 2 লাইনেন্ং বোর্ডার ক্রোপ কে রূপ মে লগাএঁ।',
      'সংক্রমিত পৌধোং কো উখাড়কর নষ্ট করেন্ং।',
    ],
    preventiveActions: [
      'সফেদ মক্খী এবং থ্রিপ্স কীটোং কা সময পর নিয়ন্ত্রণ করেন যো ব াইরাস ফেলাতে হেন্ং।',
      'সন্তুলিত পোষণ দেন্ং, অধিক যুরিয়া কে প্রযোগ সে বচেন্ং।',
    ],
    escalationTriggers: [
      'যদি 15% সে অধিক পৌধোং মে পত্তিযোং কা গুচ্ছা বননে লগে।',
    ],
    chemicalDosage: 'এসিটামিপ্রিড 20% SP @ 0.3 গ্রাম/লীটর या ফিপ্রোনিল 5% SC @ 2.0 ml/লীটর',
    organicRemedy: 'নীম তেল 10,000 ppm @ 2 ml/L + ভের্টিসিলিয লেকানী @ 5 gm/L',
    phiDays: 7,
    sourceOrganization: 'ICAR-IIHR (ভারতীয বাগবানী অनुसंধান संস্থান, বেঙ্গালুরু)',
    sourceDocument: 'Integrated Pest & Disease Management for Solanaceous Crops',
    sourceDate: '2024',
    knowledgeVersion: 'icar-iihr-v3.0',
    status: 'verified',
  },
];

export default function AdvisoryList() {
  const { lang, t } = useLang();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedAdvisory, setSelectedAdvisory] = useState<ExtendedAdvisory | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const filteredAdvisories = EXTENDED_ICAR_ADVISORIES.filter((item) => {
    const matchesCrop = selectedCrop === 'all' || item.cropName.toLowerCase() === selectedCrop.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      item.cropName.toLowerCase().includes(query) ||
      (item.cropHi && item.cropHi.includes(query)) ||
      item.issueName.toLowerCase().includes(query) ||
      (item.issueHi && item.issueHi.includes(query)) ||
      (item.chemicalDosage && item.chemicalDosage.toLowerCase().includes(query));
    return matchesCrop && (searchQuery ? matchesQuery : true);
  });

  const handleSpeak = (advisory: ExtendedAdvisory) => {
    if (isSpeaking) {
      AdvisoryService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      const speechText = `${advisory.cropHi || advisory.cropName}. ${advisory.issueHi || advisory.issueName}. रासायनिक उपचार: ${advisory.chemicalDosage}. जैविक उपचार: ${advisory.organicRemedy}.`;
      const ok = AdvisoryService.speakAdvisoryText(speechText, lang);
      if (ok) setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-6xl mx-auto py-2">

      {/* Header (light) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {t('home_kvk_bulletins')}
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-stone-900">
              {t('advisory_title')}
            </h1>
            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
              {t('advisory_subtitle')}
            </p>
          </div>
        </div>

        <a
          href="tel:18001801551"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>1800-180-1551</span>
        </a>
      </div>

      {/* Search + crop filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'फसल या बीमारी खोजें (उदा. कपास सुंडी, टमाटर झुलसा, ब्लास्ट)...' : 'Search crop or disease (e.g. Cotton Bollworm, Tomato Blight, Blast)...'}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-stone-200 shadow-sm text-xs sm:text-sm font-bold text-stone-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-500 font-bold flex items-center gap-1 pl-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'फसल चुनें:' : 'Crop:'}</span>
          </span>
          {[
            { id: 'all', label: lang === 'hi' ? 'सभी फसलें' : 'All Crops' },
            { id: 'cotton', label: lang === 'hi' ? 'कपास' : 'Cotton' },
            { id: 'tomato', label: lang === 'hi' ? 'टमाटर' : 'Tomato' },
            { id: 'rice', label: lang === 'hi' ? 'धान' : 'Rice' },
            { id: 'soybean', label: lang === 'hi' ? 'सोयाबीन' : 'Soybean' },
            { id: 'chilli', label: lang === 'hi' ? 'मिर्च' : 'Chilli' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCrop(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCrop === c.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advisory list (compact rows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredAdvisories.map((advisory, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-stone-200 hover:border-teal-300 shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            <div className="p-4 flex-1 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[11px]">
                    {advisory.cropHi || advisory.cropName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-bold text-[11px]">
                    {advisory.category === 'pest' ? (lang === 'hi' ? 'कीट' : 'Pest') : (lang === 'hi' ? 'रोग' : 'Disease')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(advisory);
                  }}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-teal-50 text-stone-600 hover:text-teal-700"
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-extrabold text-sm text-stone-900 leading-snug">
                {advisory.issueHi || advisory.issueName}
              </h3>

              <p className="text-xs text-stone-600 line-clamp-2 leading-snug">
                {advisory.fieldInspectionSteps[0]}
              </p>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="p-2 bg-teal-50/60 border border-teal-100 rounded-lg">
                  <div className="text-stone-500 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                    {lang === 'hi' ? 'दवा मात्रा' : 'Chemical'}
                  </div>
                  <div className="font-extrabold text-teal-900 line-clamp-2">{advisory.chemicalDosage}</div>
                </div>
                <div className="p-2 bg-emerald-50/60 border border-emerald-100 rounded-lg">
                  <div className="text-stone-500 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                    {lang === 'hi' ? 'जैविक' : 'Organic'}
                  </div>
                  <div className="font-bold text-emerald-900 line-clamp-2">{advisory.organicRemedy}</div>
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-stone-500 font-bold">
                <Clock className="w-3 h-3" />
                <span>PHI: {advisory.phiDays} {lang === 'hi' ? 'दिन' : 'Days'}</span>
              </div>
              <button
                onClick={() => setSelectedAdvisory(advisory)}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] flex items-center gap-1"
              >
                <span>{lang === 'hi' ? 'पूरी सलाह' : 'Full Plan'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedAdvisory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md">
                    {selectedAdvisory.cropHi || selectedAdvisory.cropName}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    {lang === 'hi' ? 'भाग:' : 'Part:'} {selectedAdvisory.affectedPart}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-stone-900 leading-snug">
                  {selectedAdvisory.issueHi || selectedAdvisory.issueName}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSpeak(selectedAdvisory)}
                  className="p-2 rounded-lg bg-stone-100 hover:bg-teal-50 text-stone-600 hover:text-teal-700"
                  title="Listen"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setSelectedAdvisory(null);
                    AdvisoryService.stopSpeaking();
                    setIsSpeaking(false);
                  }}
                  className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1">

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-teal-700" />
                  <span>{lang === 'hi' ? '1. खेत में जांचें' : '1. Field inspection'}</span>
                </div>
                <ul className="text-xs text-stone-800 space-y-1 list-disc list-inside leading-snug">
                  {selectedAdvisory.fieldInspectionSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'hi' ? '2. तुरंत जैविक कदम' : '2. Immediate non-chemical'}</span>
                </div>
                <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside leading-snug">
                  {selectedAdvisory.immediateNonChemicalActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-1.5">
                <div className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-teal-700" />
                  <span>{lang === 'hi' ? '3. दवा एवं मात्रा' : '3. Chemical dosage'}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-teal-200 text-xs">
                  <div className="font-extrabold text-teal-950 text-sm mb-0.5">{selectedAdvisory.chemicalDosage}</div>
                  <div className="text-[11px] text-stone-600">
                    {lang === 'hi' ? `सुबह 10 बजे से पहले या शाम को करें। PHI: ${selectedAdvisory.phiDays} दिन।` : `Spray before 10 AM or after 4 PM. PHI: ${selectedAdvisory.phiDays} days.`}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>{lang === 'hi' ? '4. बचाव (Prevention)' : '4. Long-term prevention'}</span>
                </div>
                <ul className="text-xs text-blue-950 space-y-1 list-disc list-inside leading-snug">
                  {selectedAdvisory.preventiveActions.map((prev, i) => (
                    <li key={i}>{prev}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between flex-wrap gap-1.5">
                <span className="flex items-center gap-1">
                  <Info className="w-3 h-3 text-teal-700" />
                  {selectedAdvisory.sourceOrganization} ({selectedAdvisory.sourceDocument})
                </span>
                <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded">{selectedAdvisory.knowledgeVersion}</span>
              </div>

            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <a
                href="tel:18001801551"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3" />
                <span>{lang === 'hi' ? 'KVK वैज्ञानिक' : 'Call KVK Scientist'}</span>
              </a>

              <button
                onClick={() => {
                  setSelectedAdvisory(null);
                  AdvisoryService.stopSpeaking();
                  setIsSpeaking(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px]"
              >
                {lang === 'hi' ? 'बंद' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}