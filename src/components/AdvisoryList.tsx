import { useState, useEffect } from 'react';
import { 
  Leaf, Search, Volume2, VolumeX, ShieldCheck, 
  CheckCircle2, AlertTriangle, UserCheck, BookOpen, 
  Sparkles, Sprout, Info, ChevronRight, X, Phone,
  Filter, Award, FlaskConical, Clock, Layers
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
    issueName: 'Pink Bollworm (गुलाबी सुंडी / बोंडअळी)',
    issueHi: 'गुलाबी सुंडी (पिंक बॉलवर्म)',
    category: 'pest',
    affectedPart: 'Flower buds, Squares, and Bolls',
    fieldInspectionSteps: [
      'गुलाब जैसे विकृत फूल (Rosette Flowers) दिखाई दें तो तुरंत खोलकर अंदर छोटी गुलाबी इल्ली देखें।',
      'हरे बोंडों पर बारीक छिद्र और अंदर की ओर भूरे धब्बे जांचें।',
      'प्रति एकड़ 5 फेरोमोन ट्रैप लगाकर प्रति ट्रैप 8-10 पतंगे आने पर तत्काल कदम उठाएं।',
    ],
    immediateNonChemicalActions: [
      'खेत में प्रति एकड़ 5-8 गॉसीप्लूर फेरोमोन ट्रैप (Pheromone Traps) लगाएं।',
      'ट्राइकोग्रामा परजीवी (Trichogramma wasps) 1.5 लाख अंडे/एकड़ 3 बार छोड़ें।',
      'नीम का तेल (1500 ppm) 5 ml प्रति लीटर पानी में मिलाकर प्रारंभिक छिड़काव करें।',
    ],
    preventiveActions: [
      'खेत में बोंडअळी के अवशेष और गिरे हुए फूलों को एकत्र कर नष्ट करें।',
      'फसल की कटाई के बाद खेत की गहरी जुताई करें ताकि प्यूपा नष्ट हो जाएं।',
    ],
    escalationTriggers: [
      'यदि 10% से अधिक बोंडों में इल्ली का प्रवेश दिखाई दे (ETL पार हो)।',
    ],
    chemicalDosage: 'इमामेक्टिन बेंजोएट 5% SG @ 0.4 ग्राम/लीटर या प्रोफेनोफॉस 50% EC @ 2.0 ml/लीटर',
    organicRemedy: 'नीम का तेल 1500 ppm @ 5 ml/L + बवेरिया बेसियाना @ 5 gm/L',
    phiDays: 14,
    sourceOrganization: 'ICAR-CICR (केंद्रीय कपास अनुसंधान संस्थान, नागपुर)',
    sourceDocument: 'ICAR-CICR Cotton IPM Package 2024-26',
    sourceDate: '2024',
    knowledgeVersion: 'icar-cicr-v2.4',
    status: 'verified',
  },
  {
    cropName: 'Tomato',
    cropHi: 'टमाटर',
    issueName: 'Early Blight (टमाटर अगेती झुलसा)',
    issueHi: 'अगेती झुलसा (अर्ली ब्लाइट)',
    category: 'disease',
    affectedPart: 'Older Lower Leaves & Stems',
    fieldInspectionSteps: [
      'निचली पुरानी पत्तियों पर गहरे भूरे रंग के छल्लेदार (Target Rings) धब्बे देखें।',
      'धब्बों के चारों ओर हल्का पीला घेरा (Yellow Halo) दिखाई देगा।',
      'गंभीर स्थिति में पत्तियां सूखकर नीचे गिर जाती हैं।',
    ],
    immediateNonChemicalActions: [
      'संक्रमित निचली पत्तियों को तोड़कर खेत से दूर जमीन में गाड़ दें।',
      'पौधों के नीचे ड्रिप या थाला विधि से पानी दें, पत्तियों पर पानी न छिड़कें।',
      'खेत में वायु संचार बढ़ाने के लिए खरपतवार साफ करें।',
    ],
    preventiveActions: [
      'बुवाई से पहले ट्राइकोडर्मा विरिडी (5-10 ग्राम/किग्रा बीज) से बीज उपचार करें।',
      'फसल चक्र अपनाएं, सोलेनेसी कुल (आलू, बैंगन) के बाद तुरंत टमाटर न लगाएं।',
    ],
    escalationTriggers: [
      'यदि लक्षण मुख्य तने या फलों के डंठल तक फैलने लगें।',
    ],
    chemicalDosage: 'कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 ग्राम/लीटर या मैंकोजेब 75% WP @ 2.5 ग्राम/लीटर',
    organicRemedy: 'ट्राइकोडर्मा विरिडी 1% WP @ 5 ग्राम/लीटर + स्यूडोमोनास 5 ग्राम/लीटर',
    phiDays: 7,
    sourceOrganization: 'ICAR-IIVR (भारतीय सब्जी अनुसंधान संस्थान, वाराणसी)',
    sourceDocument: 'Vegetable Pathology Bulletin 2024',
    sourceDate: '2024',
    knowledgeVersion: 'icar-iivr-v3.1',
    status: 'verified',
  },
  {
    cropName: 'Rice',
    cropHi: 'धान (चावल)',
    issueName: 'Rice Blast (धान का झोंका / ब्लास्ट रोग)',
    issueHi: 'झोंका रोग (ब्लास्ट)',
    category: 'disease',
    affectedPart: 'Leaves, Nodes & Neck',
    fieldInspectionSteps: [
      'पत्तियों पर आंख या नाव के आकार के (Spindle Shaped) धब्बे देखें जिनका केंद्र सफेद और किनारे भूरे हों।',
      'बाली के गर्दन वाले हिस्से (Neck) पर काला धब्बा जांचें जिससे बाली टूटकर लटक जाती है।',
      'अत्यधिक नाइट्रोजन खाद वाले खेतों में विशेष रूप से निरीक्षण करें।',
    ],
    immediateNonChemicalActions: [
      'यूरिया (नाइट्रोजन) खाद का प्रयोग तुरंत रोकें।',
      'खेत में पानी का स्तर संतुलित रखें, खेत को सूखने न दें।',
      'स्यूडोमोनास फ्लोरोसेंस @ 5 ग्राम/लीटर का छिड़काव करें।',
    ],
    preventiveActions: [
      'प्रमाणित ब्लास्ट-प्रतिरोधी किस्मों (जैसे पूसा 44, MTU 1010) का चयन करें।',
      'कार्बेंडाजिम 2 ग्राम/किग्रा से बीज शोधन करें।',
    ],
    escalationTriggers: [
      'बाली निकलते समय गर्दन पर कालापन आने पर (Neck Blast)।',
    ],
    chemicalDosage: 'ट्राइसाइक्लाजोल 75% WP @ 0.6 ग्राम/लीटर या आइसोप्रोथियोलेन 40% EC @ 1.5 ml/लीटर',
    organicRemedy: 'स्यूडोमोनास फ्लोरोसेंस @ 5 ग्राम/लीटर पानी',
    phiDays: 21,
    sourceOrganization: 'ICAR-NRRI (राष्ट्रीय चावल अनुसंधान संस्थान, कटक)',
    sourceDocument: 'Rice Blast Management Protocol',
    sourceDate: '2024',
    knowledgeVersion: 'icar-nrri-v4.0',
    status: 'verified',
  },
  {
    cropName: 'Soybean',
    cropHi: 'सोयाबीन',
    issueName: 'Soybean Rust & Pod Borer (सोयाबीन रस्ट व इल्ली)',
    issueHi: 'सोयाबीन रस्ट एवं फली छेदक',
    category: 'disease',
    affectedPart: 'Foliage & Developing Pods',
    fieldInspectionSteps: [
      'निचली पत्तियों की निचली सतह पर बारीक भूरे रंग के उभार (Pustules) देखें।',
      'पत्तियों का समय से पहले पीला पड़कर गिरना जांचें।',
      'फूल और फलियों में छेद करने वाली हरी इल्लियों का निरीक्षण करें।',
    ],
    immediateNonChemicalActions: [
      'खेत के चारों ओर हवा का प्रवाह बनाए रखने के लिए मेड़ों की घास काटें।',
      'शाम के समय स्प्रिंकलर से पानी देने से बचें।',
      'नीम अर्क 5% का पहला सुरक्षात्मक छिड़काव करें।',
    ],
    preventiveActions: [
      'उचित कतार दूरी (45x5 सेमी) पर बुवाई करें।',
      'सोयाबीन के साथ मक्का या ज्वार की अंतरवर्तीय फसल लगाएं।',
    ],
    escalationTriggers: [
      'फूल आने की अवस्था में रस्ट का पत्तियों से ऊपर की ओर बढ़ना।',
    ],
    chemicalDosage: 'हेक्साकोनाजोल 5% EC @ 2.0 ml/लीटर या टेबुकोनाजोल 25.9% EC @ 1.5 ml/लीटर',
    organicRemedy: 'नीम तेल 1500 ppm @ 5 ml/L + ट्राइकोडर्मा 5 gm/L',
    phiDays: 15,
    sourceOrganization: 'ICAR-IISR (भारतीय सोयाबीन अनुसंधान संस्थान, इंदौर)',
    sourceDocument: 'Soybean Health Advisory Package',
    sourceDate: '2024',
    knowledgeVersion: 'icar-iisr-v2.8',
    status: 'verified',
  },
  {
    cropName: 'Chilli',
    cropHi: 'मिर्च',
    issueName: 'Chilli Leaf Curl & Thrips (मिर्च का मरोड़िया रोग व थ्रिप्स)',
    issueHi: 'मरोड़िया रोग एवं थ्रिप्स',
    category: 'pest',
    affectedPart: 'Top Tender Leaves & Shoots',
    fieldInspectionSteps: [
      'पत्तियां ऊपर की ओर नाव जैसी मुड़ी हुई (Upward Cupping) दिखें तो थ्रिप्स की जांच करें।',
      'पत्तियां नीचे की ओर मुड़ी हुई (Downward Cupping) हों तो माइट्स (Mites) का प्रकोप है।',
      'पौधों की नई बढ़वार रुक जाना और पत्तियां छोटी रह जाना।',
    ],
    immediateNonChemicalActions: [
      'खेत में प्रति एकड़ 20 नीले एवं पीले चिपचिपे जाल (Sticky Traps) लगाएं।',
      'खेत के चारों ओर मक्का या ज्वार की 2 लाइनें बॉर्डर क्रॉप के रूप में लगाएं।',
      'संक्रमित पौधों को उखाड़कर नष्ट करें।',
    ],
    preventiveActions: [
      'सफेद मक्खी और थ्रिप्स कीटों का समय पर नियंत्रण करें जो वायरस फैलाते हैं।',
      'संतुलित पोषण दें, अधिक यूरिया के प्रयोग से बचें।',
    ],
    escalationTriggers: [
      'यदि 15% से अधिक पौधों में पत्तियों का गुच्छा बनने लगे।',
    ],
    chemicalDosage: 'एसिटामिप्रिड 20% SP @ 0.3 ग्राम/लीटर या फिप्रोनिल 5% SC @ 2.0 ml/लीटर',
    organicRemedy: 'नीम तेल 10,000 ppm @ 2 ml/L + वर्टिसिलियम लेकानी @ 5 gm/L',
    phiDays: 7,
    sourceOrganization: 'ICAR-IIHR (भारतीय बागवानी अनुसंधान संस्थान, बेंगलुरु)',
    sourceDocument: 'Integrated Pest & Disease Management for Solanaceous Crops',
    sourceDate: '2024',
    knowledgeVersion: 'icar-iihr-v3.0',
    status: 'verified',
  },
];

export default function AdvisoryList() {
  const { lang } = useLang();
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
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto py-2">
      
      {/* ============================================================= */}
      {/* 1. TOP HERO BANNER (ICAR VERIFIED)                            */}
      {/* ============================================================= */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'hi' ? 'ICAR सरकारी कृषि सलाह एवं उपचार गाइड' : 'ICAR Government Crop Advisory & Action Guide'}
            </h1>
          </div>
          <p className="text-xs text-teal-200/90 mt-1.5 font-medium max-w-2xl leading-relaxed">
            {lang === 'hi' 
              ? 'भारतीय कृषि अनुसंधान परिषद (ICAR) एवं कृषि विज्ञान केंद्र (KVK) द्वारा प्रमाणित रोग लक्षण, जैविक उपाय और कीटनाशकों की सटीक खुराक।'
              : 'Official ICAR & KVK certified agricultural package of practices, biological remedies & dosage recommendations.'}
          </p>
        </div>

        {/* Toll-Free Kisan Helpline Badge */}
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-bold">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-teal-200 font-bold uppercase">{lang === 'hi' ? 'किसान कॉल सेंटर (मुफ्त)' : 'Kisan Call Center (Toll Free)'}</div>
            <a href="tel:18001801551" className="text-sm font-black text-white hover:text-emerald-300">1800-180-1551</a>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. SEARCH & CROP SELECTOR TABS                                */}
      {/* ============================================================= */}
      <div className="space-y-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'फसल या बीमारी खोजें (उदा. कपास सुंडी, टमाटर झुलसा, ब्लास्ट)...' : 'Search crop or disease (e.g. Cotton Bollworm, Tomato Blight, Blast)...'}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm text-xs sm:text-sm font-bold text-stone-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Filter Pills */}
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
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

      </div>

      {/* ============================================================= */}
      {/* 3. ADVISORY CARDS GRID                                        */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAdvisories.map((advisory, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm hover:shadow-lg hover:border-teal-500/80 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              {/* Header tags & Audio Button */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-black text-xs">
                    {advisory.cropHi || advisory.cropName}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600 font-bold text-[11px]">
                    {advisory.category === 'pest' ? (lang === 'hi' ? 'कीट प्रकोप' : 'Pest') : (lang === 'hi' ? 'फफूंद रोग' : 'Disease')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(advisory);
                  }}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-teal-50 text-stone-600 hover:text-teal-700 transition-colors"
                  title="बोलकर सुनें (Voice)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Title */}
              <h3 className="font-black text-base sm:text-lg text-stone-900 group-hover:text-teal-800 transition-colors">
                {advisory.issueHi || advisory.issueName}
              </h3>

              {/* Symptoms snippet */}
              <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                {advisory.fieldInspectionSteps[0]}
              </p>

              {/* Dosage Prescriptions Box */}
              <div className="mt-3.5 p-3 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5 text-stone-900">
                  <FlaskConical className="w-3.5 h-3.5 text-teal-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-teal-950">{lang === 'hi' ? 'रासायनिक दवा मात्रा:' : 'Chemical Dosage:'} </span>
                    <span className="font-extrabold text-teal-900">{advisory.chemicalDosage}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-stone-800">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">{lang === 'hi' ? 'जैविक उपाय:' : 'Biological Remedy:'} </span>
                    <span className="font-medium text-emerald-900">{advisory.organicRemedy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Button */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-[11px] text-stone-500 font-bold">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>PHI: {advisory.phiDays} {lang === 'hi' ? 'दिन' : 'Days'}</span>
              </div>

              <button
                onClick={() => setSelectedAdvisory(advisory)}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <span>{lang === 'hi' ? 'पूरा कार्ययोजना देखें' : 'View Full Action Plan'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================= */}
      {/* 4. COMPREHENSIVE ACTION PLAN MODAL                            */}
      {/* ============================================================= */}
      {selectedAdvisory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-950 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
                    {selectedAdvisory.cropHi || selectedAdvisory.cropName}
                  </span>
                  <span className="text-xs text-teal-200 font-medium">
                    {lang === 'hi' ? 'प्रभावित भाग:' : 'Part:'} {selectedAdvisory.affectedPart}
                  </span>
                </div>
                <h3 className="font-black text-base sm:text-lg text-white">
                  {selectedAdvisory.issueHi || selectedAdvisory.issueName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeak(selectedAdvisory)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="बोलकर सुनें (Voice)"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setSelectedAdvisory(null);
                    AdvisoryService.stopSpeaking();
                    setIsSpeaking(false);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* 1. Field Inspection Steps */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-teal-700" />
                  <span>{lang === 'hi' ? '1. खेत में क्या और कैसे जांचें (लक्षण):' : '1. What to check in field:'}</span>
                </div>
                <ul className="text-xs text-stone-800 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                  {selectedAdvisory.fieldInspectionSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* 2. Immediate Safe Non-Chemical Actions */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{lang === 'hi' ? '2. तुरंत क्या देसी / जैविक कदम उठाएं:' : '2. Immediate Non-Chemical Actions:'}</span>
                </div>
                <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                  {selectedAdvisory.immediateNonChemicalActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* 3. Official Chemical Prescription */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
                <div className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-teal-700" />
                  <span>{lang === 'hi' ? '3. ICAR अनुमोदित दवा एवं छिड़काव मात्रा:' : '3. Certified Chemical Dosage:'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-200/80 text-xs">
                  <div className="font-extrabold text-teal-950 text-sm mb-1">{selectedAdvisory.chemicalDosage}</div>
                  <div className="text-[11px] text-stone-600">
                    ⏰ <strong>छिड़काव समय:</strong> सुबह 10 बजे से पहले या शाम को करें। कटाई पूर्व प्रतीक्षा अवधि (PHI): <strong>{selectedAdvisory.phiDays} दिन</strong>।
                  </div>
                </div>
              </div>

              {/* 4. Prevention */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>{lang === 'hi' ? '4. आगे के लिए बचाव के उपाय (Prevention):' : '4. Long-term Prevention:'}</span>
                </div>
                <ul className="text-xs text-blue-950 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                  {selectedAdvisory.preventiveActions.map((prev, i) => (
                    <li key={i}>{prev}</li>
                  ))}
                </ul>
              </div>

              {/* Verified Source Attribution Footer */}
              <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-teal-700" />
                  {selectedAdvisory.sourceOrganization} ({selectedAdvisory.sourceDocument})
                </span>
                <span className="font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded">{selectedAdvisory.knowledgeVersion}</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <a 
                href="tel:18001801551" 
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'KVK वैज्ञानिक से बात करें (Toll Free)' : 'Call KVK Scientist'}</span>
              </a>

              <button
                onClick={() => {
                  setSelectedAdvisory(null);
                  AdvisoryService.stopSpeaking();
                  setIsSpeaking(false);
                }}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
