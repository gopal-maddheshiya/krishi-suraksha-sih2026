import type { LanguageCode } from './i18n';

export type DiseaseInfo = {
  name: string;
  confidence: number;
  severity: 'low' | 'moderate' | 'high';
  recommendationKey: string;
  recommendations: Record<LanguageCode, string>;
};

export const cropTypes = ['Rice', 'Wheat', 'Cotton', 'Grapes', 'Chilli', 'Groundnut', 'Sugarcane', 'Maize', 'Tomato', 'Potato'];
export const cropStages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'];
export const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Silty', 'Peaty', 'Saline'];

export const diseaseDatabase: Record<string, DiseaseInfo> = {
  rice_blast: {
    name: 'Rice Blast',
    confidence: 92,
    severity: 'high',
    recommendationKey: 'rec_rice_blast',
    recommendations: {
      en: 'Apply tricyclazole or azoxystrobin fungicide. Remove infected plants. Maintain proper water management. Use resistant varieties in next season.',
      hi: 'ट्राइसाइक्लाज़ोल या एज़ोक्सीस्ट्रोबिन फफूंदनाशक लगाएँ। संक्रमित पौधों को हटाएँ। उचित जल प्रबंधन बनाए रखें। अगले सीज़न में प्रतिरोधी किस्मों का उपयोग करें।',
      bn: 'ট্রাইসাইক্লাজল বা অ্যাজক্সিস্ট্রোবিন ছত্রাকনাশক প্রয়োগ করুন। সংক্রমিত চারা সরিয়ে ফেলুন। সঠিক জল ব্যবস্থাপনা বজায় রাখুন।',
      ta: 'ட்ரைசைக்லாசோல் அல்லது அசாக்ஸிஸ்ட்ரோபின் பூஞ்சைக்கொல்லி பயன்படுத்தவும். பாதிக்கப்பட்ட செடிகளை அகற்றவும். சரியான நீர் மேலாண்மை பேணவும்.',
      te: 'ట్రైసైక్లాజోల్ లేదా అజోక్సిస్ట్రోబిన్ శిలీంధ్రనాశకం ప్రయోగించండి. సోకిన మొక్కలను తొలగించండి.',
      mr: 'ट्रायसायक्लाझोल किंवा अझॉक्सीस्ट्रोबिन बुरशीनाशक वापरा. संक्रमित रोपटी काढा. योग्य पाणी व्यवस्थापन ठेवा.',
      gu: 'ટ્રાયસાયક્લાઝોલ અથવા એઝોક્સીસ્ટ્રોબિન ફૂગનાશક લગાવો. ચેપગ્રસ્ત છોડ હટાવો.',
      pa: 'ਟ੍ਰਾਈਸਾਈਕਲਾਜ਼ੋਲ ਜਾਂ ਐਜ਼ੋਕਸੀਸਟ੍ਰੋਬਿਨ ਫਫੂੰਦਨਾਸ਼ਕ ਲਗਾਓ। ਸੰਕ੍ਰਮਿਤ ਪੌਦੇ ਹਟਾਓ।',
    },
  },
  wheat_rust: {
    name: 'Wheat Rust',
    confidence: 88,
    severity: 'high',
    recommendationKey: 'rec_wheat_rust',
    recommendations: {
      en: 'Apply propiconazole or tebuconazole fungicide. Remove volunteer wheat plants. Plant resistant varieties. Monitor weather for rust-favorable conditions.',
      hi: 'प्रोपिकोनाज़ोल या टेबुकोनाज़ोल फफूंदनाशक लगाएँ। स्वयंसेवी गेहूं पौधों को हटाएँ। प्रतिरोधी किस्में लगाएँ।',
      bn: 'প্রোপিকোনাজল বা টেবুকোনাজল ছত্রাকনাশক প্রয়োগ করুন। স্বেচ্ছাসেবী গম গাছ সরিয়ে ফেলুন।',
      ta: 'ப்ரோபிகோனசோல் அல்லது டெபுகோனசோல் பூஞ்சைக்கொல்லி பயன்படுத்தவும். தன்னார்வ கோதுமை செடிகளை அகற்றவும்.',
      te: 'ప్రొపికోనజోల్ లేదా టెబుకోనజోల్ శిలీంధ్రనాశకం ప్రయోగించండి. స్వచ్ఛంద గోధుమ మొక్కలను తొలగించండి.',
      mr: 'प्रोपिकोनाझोल किंवा टेबुकोनाझोल बुरशीनाशक वापरा. स्वयंसेवी गव्हाचे रोपटे काढा.',
      gu: 'પ્રોપિકોનાઝોલ અથવા ટેબુકોનાઝોલ ફૂગનાશક લગાવો. સ્વયંસેવી ઘઉં છોડ હટાવો.',
      pa: 'ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ ਜਾਂ ਟੇਬੁਕੋਨਾਜ਼ੋਲ ਫਫੂੰਦਨਾਸ਼ਕ ਲਗਾਓ। ਸਵੈ-ਇੱਛਤ ਕਣਕ ਪੌਦੇ ਹਟਾਓ।',
    },
  },
  cotton_bollworm: {
    name: 'Cotton Bollworm',
    confidence: 85,
    severity: 'high',
    recommendationKey: 'rec_bollworm',
    recommendations: {
      en: 'Use Bt cotton varieties. Apply spinosad or emamectin benzoate. Set up pheromone traps. Practice crop rotation. Monitor pest populations weekly.',
      hi: 'Bt कपास किस्मों का उपयोग करें। स्पिनोसैड या इमामेक्टिन बेंजोएट लगाएँ। फेरोमोन ट्रैप लगाएँ। फसल चक्र अपनाएँ।',
      bn: 'Bt তুলা জাত ব্যবহার করুন। স্পিনোসাড বা ইমামেকটিন বেনজোয়েট প্রয়োগ করুন। ফেরোমন ফাঁদ স্থাপন করুন।',
      ta: 'Bt பருத்தி ரகங்களை பயன்படுத்தவும். ஸ்பினோசாட் அல்லது எமமெக்டின் பென்சோயேட் பயன்படுத்தவும். ஃபெரோமோன் வலைகள் அமைக்கவும்.',
      te: 'Bt పత్తి రకాలను ఉపయోగించండి. స్పినోసాడ్ లేదా ఎమమెక్టిన్ బెంజోయేట్ ప్రయోగించండి.',
      mr: 'Bt कापूस वाण वापरा. स्पिनोसॅड किंवा इमामेक्टिन बेंझोएट वापरा. फेरोमोन फासे लावा.',
      gu: 'Bt કપાસ જાતો વાપરો. સ્પિનોસાડ અથવા એમામેક્ટિન બેન્ઝોએટ લગાવો. ફેરોમોન જાળ ગોઠવો.',
      pa: 'Bt ਕਪਾਹ ਕਿਸਮਾਂ ਵਰਤੋ। ਸਪਿਨੋਸਾਡ ਜਾਂ ਇਮਾਮੇਕਟਿਨ ਬੈਂਜ਼ੋਏਟ ਲਗਾਓ। ਫੈਰੋਮੋਨ ਜਾਲ ਲਗਾਓ।',
    },
  },
  powdery_mildew: {
    name: 'Powdery Mildew',
    confidence: 90,
    severity: 'moderate',
    recommendationKey: 'rec_powdery_mildew',
    recommendations: {
      en: 'Apply sulfur-based fungicide or potassium bicarbonate. Improve air circulation by pruning. Avoid overhead irrigation. Remove infected leaves.',
      hi: 'सल्फर-आधारित फफूंदनाशक या पोटेशियम बाइकार्बोनेट लगाएँ। छंटाई से हवा का प्रवाह बढ़ाएँ। ऊपर से सिंचाई न करें।',
      bn: 'সালফার-ভিত্তিক ছত্রাকনাশক বা পটাশিয়াম বাইকার্বোনেট প্রয়োগ করুন। ছাঁটাই করে বায়ু চলাচল উন্নত করুন।',
      ta: 'கந்தக அடிப்படையிலான பூஞ்சைக்கொல்லி அல்லது பொட்டாசியம் பைகார்பனேட் பயன்படுத்தவும். கத்தரிப்பதன் மூலம் காற்றோட்டம் மேம்படுத்தவும்.',
      te: 'సల్ఫర్-ఆధారిత శిలీంధ్రనాశకం లేదా పొటాషియం బైకార్బనేట్ ప్రయోగించండి. కత్తిరింపు ద్వారా గాలి చలనం మెరుగుపరచండి.',
      mr: 'गंधक-आधारित बुरशीनाशक किंवा पोटॅशियम बायकार्बोनेट वापरा. छाटणी करून हवा फेरफार सुधारा.',
      gu: 'સલ્ફર-આધારિત ફૂગનાશક અથવા પોટેશિયમ બાયકાર્બોનેટ લગાવો. છાંટણીથી હવા ફરવાનું સુધારો.',
      pa: 'ਸਲਫਰ-ਅਧਾਰਿਤ ਫਫੂੰਦਨਾਸ਼ਕ ਜਾਂ ਪੋਟਾਸ਼ੀਅਮ ਬਾਈਕਾਰਬੋਨੇਟ ਲਗਾਓ। ਛਾਂਟਕੱਟ ਨਾਲ ਹਵਾ ਦਾ ਵਹਾਅ ਵਧਾਓ।',
    },
  },
  anthracnose: {
    name: 'Anthracnose',
    confidence: 87,
    severity: 'high',
    recommendationKey: 'rec_anthracnose',
    recommendations: {
      en: 'Apply copper-based fungicide or chlorothalonil. Remove and destroy infected plant parts. Practice crop rotation. Use disease-free seeds.',
      hi: 'तांबे-आधारित फफूंदनाशक या क्लोरोथालोनिल लगाएँ। संक्रमित पौधों को नष्ट करें। फसल चक्र अपनाएँ।',
      bn: 'তামা-ভিত্তিক ছত্রাকনাশক বা ক্লোরোথালোনিল প্রয়োগ করুন। সংক্রমিত অংশ ধ্বংস করুন।',
      ta: 'செம்பு அடிப்படையிலான பூஞ்சைக்கொல்லி அல்லது குளோரோதலோனில் பயன்படுத்தவும். பாதிக்கப்பட்ட பகுதிகளை அழிக்கவும்.',
      te: 'రాగి-ఆధారిత శిలీంధ్రనాశకం లేదా క్లోరోథాలోనిల్ ప్రయోగించండి. సోకిన భాగాలను నాశనం చేయండి.',
      mr: 'तांबे-आधारित बुरशीनाशक किंवा क्लोरोथॅलोनिल वापरा. संक्रमित भाग नष्ट करा.',
      gu: 'તાંબા-આધારિત ફૂગનાશક અથવા ક્લોરોથેલોનિલ લગાવો. ચેપગ્રસ્ત ભાગોનો નાશ કરો.',
      pa: 'ਤਾਂਬੇ-ਅਧਾਰਿਤ ਫਫੂੰਦਨਾਸ਼ਕ ਜਾਂ ਕਲੋਰੋਥਾਲੋਨਿਲ ਲਗਾਓ। ਸੰਕ੍ਰਮਿਤ ਹਿੱਸੇ ਨਸ਼ਟ ਕਰੋ।',
    },
  },
  sheath_blight: {
    name: 'Rice Sheath Blight',
    confidence: 84,
    severity: 'high',
    recommendationKey: 'rec_sheath_blight',
    recommendations: {
      en: 'Apply validamycin or hexaconazole fungicide. Reduce plant density. Avoid excessive nitrogen. Maintain proper drainage.',
      hi: 'वैलिडामाइसिन या हेक्साकोनाज़ोल फफूंदनाशक लगाएँ। पौधों की घनत्व कम करें। अत्यधिक नाइट्रोजन से बचें।',
      bn: 'ভ্যালিডামাইসিন বা হেক্সাকোনাজল ছত্রাকনাশক প্রয়োগ করুন। উদ্ভিদ ঘনত্ব কমান।',
      ta: 'வாலிடாமைசின் அல்லது ஹெக்ஸாகோனசோல் பூஞ்சைக்கொல்லி பயன்படுத்தவும். தாவர அடர்த்தியை குறைக்கவும்.',
      te: 'వాలిడామైసిన్ లేదా హెక్సాకోనజోల్ శిలీంధ్రనాశకం ప్రయోగించండి. మొక్కల సాంద్రత తగ్గించండి.',
      mr: 'व्हॅलिडामायसिन किंवा हेक्साकोनाझोल बुरशीनाशक वापरा. रोपटी घनता कमी करा.',
      gu: 'વેલિડામાયસિન અથવા હેક્સાકોનાઝોલ ફૂગનાશક લગાવો. છોડની ગીચતા ઘટાડો.',
      pa: 'ਵੈਲੀਡਾਮਾਈਸਿਨ ਜਾਂ ਹੈਕਸਾਕੋਨਾਜ਼ੋਲ ਫਫੂੰਦਨਾਸ਼ਕ ਲਗਾਓ। ਪੌਦਿਆਂ ਦੀ ਘਣਤਾ ਘਟਾਓ।',
    },
  },
  tikka_leaf_spot: {
    name: 'Groundnut Tikka Leaf Spot',
    confidence: 86,
    severity: 'moderate',
    recommendationKey: 'rec_tikka',
    recommendations: {
      en: 'Apply chlorothalonil or mancozeb fungicide. Practice crop rotation. Remove infected debris. Maintain proper spacing between plants.',
      hi: 'क्लोरोथालोनिल या मैंकोज़ेब फफूंदनाशक लगाएँ। फसल चक्र अपनाएँ। संक्रमित मलबे को हटाएँ।',
      bn: 'ক্লোরোথালোনিল বা ম্যানকোজেব ছত্রাকনাশক প্রয়োগ করুন। ফসল চক্র অনুশীলন করুন।',
      ta: 'குளோரோதலோனில் அல்லது மான்கோசெப் பூஞ்சைக்கொல்லி பயன்படுத்தவும். பயிர் சுழற்சி கடைப்பிடிக்கவும்.',
      te: 'క్లోరోథాలోనిల్ లేదా మాంకోజెబ్ శిలీంధ్రనాశకం ప్రయోగించండి. పంట మార్పిడి ఆచరించండి.',
      mr: 'क्लोरोथॅलोनिल किंवा मँकोझेब बुरशीनाशक वापरा. पीक फेरबदल करा.',
      gu: 'ક્લોરોથેલોનિલ અથવા મેન્કોઝેબ ફૂગનાશક લગાવો. પાક ફેરબદલ આચરો.',
      pa: 'ਕਲੋਰੋਥਾਲੋਨਿਲ ਜਾਂ ਮੈਂਕੋਜ਼ੇਬ ਫਫੂੰਦਨਾਸ਼ਕ ਲਗਾਓ। ਫਸਲ ਚੱਕਰ ਅਪਣਾਓ।',
    },
  },
  red_rot: {
    name: 'Sugarcane Red Rot',
    confidence: 83,
    severity: 'high',
    recommendationKey: 'rec_red_rot',
    recommendations: {
      en: 'Use disease-free setts. Apply carbendazim. Practice crop rotation. Improve drainage. Select resistant varieties.',
      hi: 'रोग-मुक्त सेट्स का उपयोग करें। कार्बेन्डाज़िम लगाएँ। फसल चक्र अपनाएँ। जल निकास सुधारें।',
      bn: 'রোগ-মুক্ত সেট ব্যবহার করুন। কারবেন্ডাজিম প্রয়োগ করুন। ফসল চক্র অনুশীলন করুন।',
      ta: 'நோய் இல்லாத செட்டுகளை பயன்படுத்தவும். கார்பென்டாசிம் பயன்படுத்தவும். பயிர் சுழற்சி கடைப்பிடிக்கவும்.',
      te: 'వ్యాధి-రహిత సెట్లను ఉపయోగించండి. కార్బెండాజిమ్ ప్రయోగించండి. పంట మార్పిడి ఆచరించండి.',
      mr: 'रोग-मुक्त सेट वापरा. कार्बेंडाझिम वापरा. पीक फेरबदल करा.',
      gu: 'રોગ-મુક્ત સેટ વાપરો. કાર્બેન્ડાઝિમ લગાવો. પાક ફેરબદલ આચરો.',
      pa: 'ਰੋਗ-ਮੁਕਤ ਸੈੱਟ ਵਰਤੋ। ਕਾਰਬੇਂਡਾਜ਼ਿਮ ਲਗਾਓ। ਫਸਲ ਚੱਕਰ ਅਪਣਾਓ।',
    },
  },
};

export const cropDiseaseMap: Record<string, string[]> = {
  Rice: ['rice_blast', 'sheath_blight'],
  Wheat: ['wheat_rust'],
  Cotton: ['cotton_bollworm'],
  Grapes: ['powdery_mildew'],
  Chilli: ['anthracnose'],
  Groundnut: ['tikka_leaf_spot'],
  Sugarcane: ['red_rot'],
  Maize: ['wheat_rust'],
  Tomato: ['anthracnose', 'powdery_mildew'],
  Potato: ['powdery_mildew'],
};

export function analyzeImage(cropType: string): DiseaseInfo | null {
  const possibleDiseases = cropDiseaseMap[cropType];
  if (!possibleDiseases || possibleDiseases.length === 0) {
    const allKeys = Object.keys(diseaseDatabase);
    const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
    return diseaseDatabase[randomKey];
  }
  const selectedKey = possibleDiseases[Math.floor(Math.random() * possibleDiseases.length)];
  const disease = diseaseDatabase[selectedKey];
  const variance = Math.floor(Math.random() * 8) - 4;
  return {
    ...disease,
    confidence: Math.max(70, Math.min(98, disease.confidence + variance)),
  };
}
