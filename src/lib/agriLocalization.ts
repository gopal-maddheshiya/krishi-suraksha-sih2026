import type { LanguageCode } from './i18n';

export const CROP_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  cotton: {
    en: 'Cotton',
    hi: 'कपास',
    mr: 'कापूस',
    bn: 'তুলা',
    ta: 'பருத்தி',
    te: 'ప్రత్తి (దూది)',
    gu: 'કપાસ',
    pa: 'ਕਪਾਹ',
  },
  tomato: {
    en: 'Tomato',
    hi: 'टमाटर',
    mr: 'टोमॅटो',
    bn: 'টমেটো',
    ta: 'தக்காளி',
    te: 'టమాట',
    gu: 'ટામેટાં',
    pa: 'ਟਮਾਟਰ',
  },
  rice: {
    en: 'Rice (Paddy)',
    hi: 'धान (चावल)',
    mr: 'भात (धान)',
    bn: 'ধান',
    ta: 'நெல்',
    te: 'వరి (వరి ధాన్యం)',
    gu: 'ડાંગર (ચોખા)',
    pa: 'ਝੋਨਾ (ਚੌਲ)',
  },
  paddy: {
    en: 'Paddy',
    hi: 'धान',
    mr: 'भात',
    bn: 'ধান',
    ta: 'நெல்',
    te: 'వరి',
    gu: 'ડાંગર',
    pa: 'ਝੋਨਾ',
  },
  soybean: {
    en: 'Soybean',
    hi: 'सोयाबीन',
    mr: 'सोयाबीन',
    bn: 'সয়াবিন',
    ta: 'சோயாபீன்',
    te: 'సోయాబీన్',
    gu: 'સોયાબીન',
    pa: 'ਸੋਇਆਬੀਨ',
  },
  wheat: {
    en: 'Wheat',
    hi: 'गेहूं',
    mr: 'गहू',
    bn: 'গম',
    ta: 'கோதுமை',
    te: 'గోధుమలు',
    gu: 'ઘઉં',
    pa: 'ਕਣਕ',
  },
  maize: {
    en: 'Maize (Corn)',
    hi: 'मक्का',
    mr: 'मका',
    bn: 'ভুট্টা',
    ta: 'மக்காச்சோளம்',
    te: 'మొక్కజొన్న',
    gu: 'મકાઈ',
    pa: 'ਮੱਕੀ',
  },
  chilli: {
    en: 'Chilli',
    hi: 'मिर्च',
    mr: 'मिरची',
    bn: 'লঙ্কা',
    ta: 'மிளகாய்',
    te: 'మిరపకాయ',
    gu: 'મરચાં',
    pa: 'ਮਿਰਚ',
  },
  onion: {
    en: 'Onion',
    hi: 'प्याज',
    mr: 'कांदा',
    bn: 'পেঁয়াজ',
    ta: 'வெங்காயம்',
    te: 'ఉల్లిపాయ',
    gu: 'ડુંગળી',
    pa: 'ਪਿਆਜ਼',
  },
  potato: {
    en: 'Potato',
    hi: 'आलू',
    mr: 'बटाटा',
    bn: 'আলু',
    ta: 'உருளைக்கிழங்கு',
    te: 'బంగాళాదుంప',
    gu: 'બટાકા',
    pa: 'ਆਲੂ',
  },
  sugarcane: {
    en: 'Sugarcane',
    hi: 'गन्ना',
    mr: 'ऊस',
    bn: 'আখ',
    ta: 'கரும்பு',
    te: 'చెరకు',
    gu: 'શેરડી',
    pa: 'ਗੰਨਾ',
  },
  mustard: {
    en: 'Mustard',
    hi: 'सरसों',
    mr: 'मोहरी',
    bn: 'সরিষা',
    ta: 'கடுகு',
    te: 'ఆవాలు',
    gu: 'રાઈ',
    pa: 'ਸਰ੍ਹੋਂ',
  },
  gram: {
    en: 'Gram (Chickpea)',
    hi: 'चना',
    mr: 'हरभरा',
    bn: 'ছোলা',
    ta: 'கொண்டைக்கடலை',
    te: 'శనగలు',
    gu: 'ચણા',
    pa: 'ਛੋਲੇ',
  },
  groundnut: {
    en: 'Groundnut',
    hi: 'मूंगफली',
    mr: 'भुईमूग',
    bn: 'চিনাবাদাম',
    ta: 'வேர்க்கடலை',
    te: 'వేరుశనగ',
    gu: 'મગફળી',
    pa: 'ਮੂੰਗਫਲੀ',
  },
};

export const STAGE_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  sowing: {
    en: 'Sowing / Germination Stage',
    hi: 'बुआई व अंकुरण की अवस्था',
    mr: 'पेरणी व उगवण अवस्था',
    bn: 'বপন ও অঙ্কুরোদগম পর্যায়',
    ta: 'விதைப்பு மற்றும் முளைப்பு நிலை',
    te: 'విత్తనాలు మొలకెత్తే దశ',
    gu: 'વાવણી અને અંકુરણ તબક્કો',
    pa: 'ਬਿਜਾਈ ਅਤੇ ਪੁੰਗਰਨ ਦਾ ਪੜਾਅ',
  },
  vegetative: {
    en: 'Vegetative Growth Stage',
    hi: 'वानस्पतिक विकास (बढ़वार) अवस्था',
    mr: 'शाकीय वाढ अवस्था',
    bn: 'অঙ্গজ বৃদ্ধি পর্যায়',
    ta: 'தாவர வளர்ச்சி நிலை',
    te: 'శాకీయ పెరుగుదల దశ',
    gu: 'વાનસ્પતિક વિકાસ તબક્કો',
    pa: 'ਬਨਸਪਤੀ ਵਾਧਾ ਪੜਾਅ',
  },
  flowering: {
    en: 'Flowering & Boll Stage',
    hi: 'फूल व कलियां आने की अवस्था',
    mr: 'फुलोरा व बोंड धारणा अवस्था',
    bn: 'ফুল ফোটার পর্যায়',
    ta: 'பூக்கும் மற்றும் காய் பிடிக்கும் நிலை',
    te: 'పూత మరియు కాయల దశ',
    gu: 'ફૂલ અને કળીઓ બેસવાનો તબક્કો',
    pa: 'ਫੁੱਲ ਅਤੇ ਡੋਡੀਆਂ ਪੈਣ ਦਾ ਪੜਾਅ',
  },
  fruiting: {
    en: 'Fruiting / Grain Filling Stage',
    hi: 'फल व दाना भरने की अवस्था',
    mr: 'फळ धारणा व दाणे भरण्याची अवस्था',
    bn: 'ফল ও দানা গঠনের পর্যায়',
    ta: 'காய் மற்றும் தானியம் நிரப்பும் நிலை',
    te: 'కాయలు మరియు గింజ పాలు పోసుకునే దశ',
    gu: 'ફળ અને દાણા ભરાવવાનો તબક્કો',
    pa: 'ਫਲ ਅਤੇ ਦਾਣਾ ਪੈਣ ਦਾ ਪੜਾਅ',
  },
  maturity: {
    en: 'Maturity / Harvest Stage',
    hi: 'परिपक्वता व कटाई अवस्था',
    mr: 'पक्वता व काढणी अवस्था',
    bn: 'পরিপক্কতা ও ফসল কাটার পর্যায়',
    ta: 'முதிர்வு மற்றும் அறுவடை நிலை',
    te: 'పక్వత మరియు కోత దశ',
    gu: 'પરિપક્વતા અને લણણી તબક્કો',
    pa: 'ਪੱਕਣ ਅਤੇ ਕਟਾਈ ਦਾ ਪੜਾਅ',
  },
};

export const COMMON_LABELS: Record<string, Record<LanguageCode, string>> = {
  safeToSpray: {
    en: '✓ Safe to spray chemicals today',
    hi: '✓ हाँ, आज खेत में दवा छिड़कना सुरक्षित है',
    mr: '✓ होय, आज शेतात औषध फवारणी करणे सुरक्षित आहे',
    bn: '✓ হ্যাঁ, আজ জমিতে কীটনাশক স্প্রে করা নিরাপদ',
    ta: '✓ ஆம், இன்று மருந்து தெளிப்பது பாதுகாப்பானது',
    te: '✓ అవును, ఈ రోజు మందు పిచికారీ చేయడం సురక్షితం',
    gu: '✓ હા, આજે ખેતરમાં દવાનો છંટકાવ કરવો સુરક્ષિત છે',
    pa: '✓ ਹਾਂ, ਅੱਜ ਖੇਤ ਵਿੱਚ ਦਵਾਈ ਦਾ ਛਿੜਕਾਅ ਕਰਨਾ ਸੁਰੱਖਿਅਤ ਹੈ',
  },
  postponeSpray: {
    en: '⚠️ Postpone spraying (Rain/Wind risk)',
    hi: '⚠️ आज छिड़काव टालें (बारिश या तेज हवा का खतरा)',
    mr: '⚠️ आज फवारणी पुढे ढकला (पाऊस किंवा जोरदार वाऱ्याचा धोका)',
    bn: '⚠️ আজ স্প্রে স্থগিত রাখুন (বৃষ্টি বা বাতাসের ঝুঁকি)',
    ta: '⚠️ இன்று தெளிப்பதைத் தள்ளிப்போடுங்கள் (மழை/காற்று அபாயம்)',
    te: '⚠️ ఈ రోజు పిచికారీ వాయిదా వేయండి (వర్షం/గాలి ప్రమాదం)',
    gu: '⚠️ આજે છંટકાવ મુલતવી રાખો (વરસાદ અથવા પવનનું જોખમ)',
    pa: '⚠️ ਅੱਜ ਛਿੜਕਾਅ ਮੁਲਤਵੀ ਕਰੋ (ਮੀਂਹ ਜਾਂ ਤੇਜ਼ ਹਵਾ ਦਾ ਖ਼ਤਰਾ)',
  },
  bestSprayWindow: {
    en: 'Best Spray Window: 4:00 PM to 6:30 PM',
    hi: 'सर्वोत्तम छिड़काव समय: शाम 4:00 से 6:30 बजे',
    mr: 'उत्तम फवारणी वेळ: संध्याकाळी 4:00 ते 6:30 वाजता',
    bn: 'সর্বোত্তম স্প্রে সময়: বিকাল ৪:০০ থেকে ৬:৩০',
    ta: 'சிறந்த தெளிப்பு நேரம்: மாலை 4:00 முதல் 6:30 வரை',
    te: 'ఉత్తమ పిచికారీ సమయం: సాయంత్రం 4:00 నుండి 6:30 వరకు',
    gu: 'શ્રેષ્ઠ છંટકાવ સમય: સાંજે 4:00 થી 6:30',
    pa: 'ਸਭ ਤੋਂ ਵਧੀਆ ਛਿੜਕਾਅ ਦਾ ਸਮਾਂ: ਸ਼ਾਮ 4:00 ਤੋਂ 6:30 ਵਜੇ ਤੱਕ',
  },
  recentScan: {
    en: 'Recent Crop Scan',
    hi: 'हालिया फसल फोटो',
    mr: 'नुकताच घेतलेला पीक फोटो',
    bn: 'সাম্প্রতিক ফসলের ছবি',
    ta: 'சமீபத்திய பயிர் படம்',
    te: 'ఇటీవలి పంట ఫోటో',
    gu: 'તાજેતરનો પાક ફોટો',
    pa: 'ਤਾਜ਼ਾ ਫ਼ਸਲ ਦੀ ਫੋਟੋ',
  },
  healthyCrop: {
    en: 'Healthy Crop (No Disease Detected)',
    hi: 'स्वस्थ फसल (कोई गंभीर बीमारी नहीं)',
    mr: 'निरोगी पीक (कोणताही गंभीर रोग नाही)',
    bn: 'সুস্থ ফসল (কোনো রোগ নেই)',
    ta: 'ஆரோக்கியமான பயிர் (நோய் இல்லை)',
    te: 'ఆరోగ్యకరమైన పంట (ఎలాంటి వ్యాధి లేదు)',
    gu: 'સ્વસ્થ પાક (કોઈ રોગ નથી)',
    pa: 'ਸਿਹਤਮੰਦ ਫ਼ਸਲ (ਕੋਈ ਬਿਮਾਰੀ ਨਹੀਂ)',
  },
  askAiAboutDisease: {
    en: '🌾 Ask AI Doctor About This Disease',
    hi: '🌾 AI फसल डॉक्टर से परामर्श लें',
    mr: '🌾 AI पीक डॉक्टरकडून सल्ला घ्या',
    bn: '🌾 AI ফসল ডাক্তারের পরামর্শ নিন',
    ta: '🌾 AI பயிர் மருத்துவரிடம் ஆலோசனை பெறுக',
    te: '🌾 AI పంట వైద్యుడిని సంప్రదించండి',
    gu: '🌾 AI પાક ડૉક્ટર પાસેથી સલાહ લો',
    pa: '🌾 AI ਫ਼ਸਲ ਡਾਕਟਰ ਤੋਂ ਸਲਾਹ ਲਓ',
  },
  askWeatherAi: {
    en: '🌾 Real-Time Weather AI Advisor',
    hi: '🌾 मौसम AI कृषि सलाहकार',
    mr: '🌾 हवामान AI कृषी सल्लागार',
    bn: '🌾 আবহাওয়া AI কৃষি উপদেষ্টা',
    ta: '🌾 வானிலை AI வேளாண் ஆலோசகர்',
    te: '🌾 వాతావరణ AI వ్యవసాయ సలహాదారు',
    gu: '🌾 હવામાન AI કૃષિ સલાહકાર',
    pa: '🌾 ਮੌਸਮ AI ਖੇਤੀਬਾੜੀ ਸਲਾਹਕਾਰ',
  },
};

/**
 * Translates crop name dynamically to chosen language
 */
export function getLocalizedCropName(rawCropName: string | undefined, lang: LanguageCode): string {
  if (!rawCropName) return CROP_TRANSLATIONS.cotton[lang] || 'Cotton';
  const clean = rawCropName.toLowerCase().trim();
  for (const [key, map] of Object.entries(CROP_TRANSLATIONS)) {
    if (clean.includes(key) || Object.values(map).some(v => clean.includes(v.toLowerCase()))) {
      return map[lang] || map.en || rawCropName;
    }
  }
  return rawCropName;
}

/**
 * Translates crop stage dynamically to chosen language
 */
export function getLocalizedStageName(rawStage: string | undefined, lang: LanguageCode): string {
  if (!rawStage) return STAGE_TRANSLATIONS.flowering[lang] || 'Flowering Stage';
  const clean = rawStage.toLowerCase().trim();
  for (const [key, map] of Object.entries(STAGE_TRANSLATIONS)) {
    if (clean.includes(key) || Object.values(map).some(v => clean.includes(v.toLowerCase()))) {
      return map[lang] || map.en || rawStage;
    }
  }
  return STAGE_TRANSLATIONS.flowering[lang] || rawStage;
}

/**
 * Resolves common label by key
 */
export function getCommonLabel(labelKey: string, lang: LanguageCode): string {
  return COMMON_LABELS[labelKey]?.[lang] || COMMON_LABELS[labelKey]?.en || labelKey;
}

/**
 * Language Name mapping for AI system prompts
 */
export function getFullLanguageName(lang: LanguageCode): string {
  const map: Record<LanguageCode, string> = {
    en: 'English',
    hi: 'Hindi (हिन्दी)',
    mr: 'Marathi (मराठी)',
    bn: 'Bengali (বাংলা)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    gu: 'Gujarati (ગુજરાતી)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
  };
  return map[lang] || 'Hindi';
}
