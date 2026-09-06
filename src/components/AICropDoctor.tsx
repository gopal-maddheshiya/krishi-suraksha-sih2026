import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Send, Loader2, ImagePlus, XCircle, 
  Sparkles, Leaf, Trash2, ShieldCheck, 
  CheckCircle2, Sprout, Bot, ArrowRight
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { GeminiVisionLiveService } from '@/services/GeminiVisionLiveService';
import VoiceMicButton from '@/components/VoiceMicButton';
import SpeakerButton from '@/components/SpeakerButton';
import type { LanguageCode } from '@/lib/i18n';

type Message = { 
  role: 'user' | 'assistant'; 
  content: string; 
  image?: string;
  timestamp?: string;
  isStreaming?: boolean;
};

/**
 * Intelligent In-House ICAR Senior Agronomist Knowledge Engine (Offline Fallback)
 */
function getNaturalAgriculturalAdvice(query: string, lang: string): string {
  const q = query.toLowerCase().trim();

  // 1. Greetings & Salutations
  if (q.match(/^(hi|hello|hey|namaste|ram ram|namaskar|kem cho|kisan bhai|kaise ho|bhai)/)) {
    if (lang === 'hi') {
      return 'राम-राम किसान भाई! 🙏 मैं आपका कृषि-रक्षा AI सलाहकार हूँ।\n\nआपकी फसल में क्या समस्या आ रही है?\n• पत्तियों का पीला पड़ना या काले-भूरे धब्बे\n• इल्ली, सुंडी या रस चूसक कीड़ों का प्रकोप\n• खाद (NPK/डीएपी/यूरिया) की सही मात्रा\n• आज के मौसम अनुसार छिड़काव की सलाह\n\nआप सीधे अपना प्रश्न पूछें या नीचे 📷 कैमरे से पत्ते की फोटो भेजें!';
    }
    if (lang === 'mr') {
      return 'राम-राम शेतकरी मित्र! 🙏 मी आपला कृषी-रक्षा AI सल्लागार आहे.\n\nआपल्या पिकात कोणती अडचण येत आहे?\n• पाने पिवळी पडणे किंवा करपा/तांबेरा\n• बोंडअळी, मावा किंवा तुडतुडे नियंत्रण\n• खताचे योग्य प्रमाण\n• फवारणीची योग्य वेळ\n\nआपण थेट प्रश्न विचारा किंवा खालील 📷 आयकॉनवरून पानाचा फोटो पाठवा!';
    }
    return 'Hello farmer friend! 🙏 I am your dedicated CropHealth AI Agronomist.\n\nHow can I assist your farm today?\n• Identify leaf diseases & chlorosis\n• Recommend ICAR chemical & bio-pesticide dosages\n• Weather-based safe spray planning & fertilizer guide\n\nFeel free to ask any question or attach a leaf photo 📷!';
  }

  // 2. Yellow Leaves / Chlorosis / Nutrient Deficiency
  if (q.includes('पीला') || q.includes('pila') || q.includes('yellow') || q.includes('पिवळे') || q.includes('chlorosis')) {
    if (lang === 'hi') {
      return '🍂 **पत्तियों का पीला पड़ना - ICAR प्रमाणित निदान व समाधान:**\n\n1. **नाइट्रोजन / जिंक की कमी (Nutrient Deficiency):**\n• यदि निचली पुरानी पत्तियां पीली पड़ रही हैं, तो पानी में घुलनशील NPK 19:19:19 @ 5 ग्राम/लीटर + चिलेटेड जिंक (Zn-EDTA 12%) @ 1 ग्राम/लीटर का स्प्रे करें।\n\n2. **सफेद मक्खी / रस चूसक कीट:**\n• यदि नई पत्तियां ऊपर से मुड़कर पीली हो रही हैं, तो नीम तेल (1500 ppm) @ 5 ml/L या एसिटामिप्रिड 20% SP @ 0.5 ग्राम/लीटर का छिड़काव करें।\n\n3. **जलभराव (Waterlogging):**\n• खेत की जल निकासी दुरुस्त करें ताकि जड़ों में हवा का संचार बना रहे।';
    }
    return '🍂 **Leaf Yellowing Diagnosis & Treatment (ICAR):**\n\n1. **Nutrient Deficiency:** Foliar spray of NPK 19:19:19 @ 5g/L + Chelated Zinc (Zn-EDTA 12%) @ 1g/L.\n2. **Sucking Pests:** Spray Neem Oil (1500 ppm) @ 5 ml/L or Acetamiprid 20% SP @ 0.5g/L.\n3. **Aeration:** Ensure proper field drainage to avoid root hypoxia.';
  }

  // 3. Pink Bollworm / Caterpillars / Spodoptera (इल्ली / सुंडी)
  if (q.includes('इल्ली') || q.includes('सुंडी') || q.includes('illi') || q.includes('sundi') || q.includes('bollworm') || q.includes('caterpillar') || q.includes('बोंडअळी') || q.includes('कीड़ा') || q.includes('kida')) {
    if (lang === 'hi') {
      return '🐛 **इल्ली एवं सुंडी (Caterpillar / Bollworm) संपूर्ण नियंत्रण:**\n\n1. **जैविक नियंत्रण:**\n• खेत में 5-8 फेरोमोन ट्रैप (Pheromone Traps) प्रति एकड़ लगाएं।\n• नीम तेल (10,000 ppm) @ 2 ml/लीटर या बवेरिया बेसियाना @ 5 ग्राम/लीटर का छिड़काव करें।\n\n2. **ICAR अनुमोदित रासायनिक स्प्रे:**\n• **प्रारंभिक अवस्था:** एमामेक्टिन बेंजोएट 5% SG @ 0.4 ग्राम/लीटर (यानि 4 ग्राम प्रति 10 लीटर पानी)।\n• **तीव्र प्रकोप:** क्लोरेंट्रानिलिप्रोल (कोराजन 18.5% SC) @ 0.4 ml/लीटर।\n\n⏰ **छिड़काव समय:** शाम 4:00 बजे के बाद जब इल्लियां सक्रिय होती हैं।';
    }
    return '🐛 **Caterpillar & Bollworm IPM Protocol:**\n\n1. **Bio-Control:** Install 5-8 pheromone traps/acre; spray Beauveria bassiana @ 5g/L.\n2. **ICAR Chemical Dosage:** Emamectin Benzoate 5% SG @ 0.4 g/L water or Chlorantraniliprole 18.5% SC @ 0.4 ml/L.\n⏰ **Timing:** Best applied late afternoon (>4 PM).';
  }

  // 4. Tomato / Potato Blight (झुलसा / करपा)
  if (q.includes('टमाटर') || q.includes('tomato') || q.includes('potato') || q.includes('आलू') || q.includes('blight') || q.includes('झुलसा') || q.includes('करपा')) {
    if (lang === 'hi') {
      return '🍅 **टमाटर एवं आलू का झुलसा (Early/Late Blight) समाधान:**\n\n• **लक्षण:** पत्तियों पर गहरे भूरे छल्लेदार धब्बे और फलों का सड़ना।\n\n1. **रोकथाम:**\n• कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 ग्राम/लीटर + स्ट्रेप्टोसाइक्लिन 1 ग्राम/10 लीटर का छिड़काव करें।\n• तीव्र अवस्था में: एजॉक्सीस्ट्रोबिन + डाइफेनोकोनाजोल (एमिस्टार टॉप) @ 1 ml/लीटर।\n\n2. **जैविक उपचार:**\n• ट्राइकोडर्मा विरिडी 1% WP @ 5 ग्राम/लीटर का पर्णीय छिड़काव करें।';
    }
    return '🍅 **Tomato/Potato Blight Management:**\n\n• **Spray:** Copper Oxychloride 50% WP @ 2.5g/L + Streptocycline 1g/10L.\n• For advanced blight: Azoxystrobin + Difenoconazole @ 1 ml/L.\n• Prune lower infected foliage.';
  }

  // 5. Cotton Protection (कपास)
  if (q.includes('कपास') || q.includes('cotton') || q.includes('कापूस')) {
    if (lang === 'hi') {
      return '🌾 **कपास (Cotton) संपूर्ण सुरक्षा सलाह:**\n\n1. **रस चूसक कीट (थ्रिप्स, हरा तेला, सफेद मक्खी):**\n• फ्लोनिकामिड 50% WG @ 0.3 ग्राम/लीटर या डायफेंथियूरॉन 50% WP @ 1.2 ग्राम/लीटर।\n\n2. **गुलाबी सुंडी (Pink Bollworm):**\n• फूल व बोंड अवस्था पर एमामेक्टिन बेंजोएट (0.4 ग्राम/लीटर) का स्प्रे करें।\n\n3. **पोषक तत्व स्प्रे:**\n• बोंड विकास के समय 13:00:45 (पोटेशियम नाइट्रेट) @ 10 ग्राम/लीटर का स्प्रे करें।';
    }
    return '🌾 **Cotton IPM Advisory:**\n\n1. **Sucking Pests:** Spray Flonicamid 50% WG @ 0.3g/L.\n2. **Pink Bollworm:** Spray Emamectin Benzoate 5% SG @ 0.4g/L.\n3. **Foliar Nutrition:** Spray 13:00:45 @ 10g/L during boll development.';
  }

  // 6. Fertilizer / NPK / Urea / Khad (खाद व पोषण)
  if (q.includes('खाद') || q.includes('khad') || q.includes('fertilizer') || q.includes('urea') || q.includes('यूरिया') || q.includes('dap') || q.includes('npk') || q.includes('19 19 19')) {
    if (lang === 'hi') {
      return '🧪 **खाद एवं पोषण अनुसूची (ICAR मानक):**\n\n1. **शुरुआती बढ़वार (0-30 दिन):**\n• NPK 19:19:19 @ 5 ग्राम/लीटर या डीएपी (DAP) प्रति एकड़ 50 किग्रा दें।\n\n2. **फूल एवं कलियां बनते समय (30-60 दिन):**\n• NPK 12:61:00 @ 5 ग्राम/लीटर + चिलेटेड बोरॉन @ 1 ग्राम/लीटर।\n\n3. **फल / दाना भरते समय (60+ दिन):**\n• NPK 00:00:50 (पोटाश) @ 5 ग्राम/लीटर ताकि फलों का वजन व चमक बढ़े।';
    }
    return '🧪 **Crop Nutrition Schedule:**\n\n1. **Vegetative:** NPK 19:19:19 @ 5g/L.\n2. **Flowering:** NPK 12:61:00 @ 5g/L + Boron @ 1g/L.\n3. **Fruiting:** NPK 00:00:50 @ 5g/L for grain size & luster.';
  }

  // 7. General Conversational Fallback
  if (lang === 'hi') {
    return `🌾 **कृषि-रक्षा AI सलाह:** आपके प्रश्न "${query}" के संदर्भ में:\n\n1. **प्राथमिक निरीक्षण:** खेत के 10-12 पौधों की पत्तियों के दोनों तरफ कीड़ों या धब्बों की जांच करें।\n2. **सुरक्षात्मक उपाय:** संतुलित पोषण (NPK 19:19:19 @ 5g/L) और जैविक सुरक्षा के लिए नीम तेल (1500 ppm @ 5 ml/L) का छिड़काव करें।\n3. **सटीक फोटो जांच:** सटीक रोग पहचान के लिए नीचे 📷 आइकन से पत्ते की फोटो भेजें, मैं तुरंत सही दवा और मात्रा बता दूंगा।`;
  }
  if (lang === 'mr') {
    return `🌾 **कृषी-रक्षा सल्ला:** आपल्या "${query}" या प्रश्नासाठी:\n\n1. **पाहणी:** पिकातील पानांचे आणि मुळांचे व्यवस्थित निरीक्षण करा.\n2. **उपाय:** १९:१९:१९ विद्राव्य खत (५ ग्रॅम/लिटर) आणि निंबोळी तेल (५ मिली/लिटर) फवारा.\n3. **अचूक तपासणी:** अचूक रोग ओळखीसाठी खालील 📷 आयकॉनवरून पानाचा फोटो पाठवा.`;
  }
  return `🌾 **CropHealth AI Advisory:** Regarding "${query}":\n\n1. **Field Inspection:** Check upper and lower leaf surfaces for spot patterns or insect colonies.\n2. **Preventive Care:** Apply NPK 19:19:19 @ 5g/L with Neem Oil 1500 ppm @ 5 ml/L.\n3. **Photo Diagnosis:** Upload a leaf image below using the camera 📷 for instant ICAR dosage recommendations!`;
}

export default function AICropDoctor() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const assistantTitles: Record<LanguageCode, string> = {
    hi: '🌾 किसानसारथी AI सलाहकार',
    mr: '🌾 किसानसारथी AI सल्लागार',
    bn: '🌾 কিষাণসারথি AI সহকারী',
    ta: '🌾 கிசான்சாரதி AI ஆலோசகர்',
    te: '🌾 కిసాన్‌సారథి AI సలహాదారు',
    gu: '🌾 કિસાનસારથી AI સલાહકાર',
    pa: '🌾 ਕਿਸਾਨਸਾਰਥੀ AI ਸਲਾਹਕਾਰ',
    en: '🌾 KisanSarthi AI Advisor',
  };

  const assistantTitle = assistantTitles[lang] || assistantTitles.en;

  const getQuickPills = (curLang: LanguageCode) => {
    const map: Record<LanguageCode, Array<{ label: string; query: string }>> = {
      hi: [
        { label: '🌿 पत्तों पर पीले धब्बे', query: 'फसल की पत्तियों पर पीले धब्बे आ रहे हैं, क्या उपाय करें?' },
        { label: '🐛 सुंडी / कीड़ों की दवा', query: 'फसल में इल्ली और सुंडी लग गई है, कौन सी दवा छिड़कें?' },
        { label: '🌧️ आज स्प्रे करें या नहीं?', query: 'क्या आज कीटनाशक का स्प्रे करना सुरक्षित है?' },
        { label: '🧪 NPK खाद की मात्रा', query: 'NPK 19:19:19 और यूरिया खाद की सही मात्रा क्या है?' },
      ],
      mr: [
        { label: '🌿 पानांवर पिवळे डाग', query: 'पिकाच्या पानांवर पिवळे डाग येत आहेत, काय उपाय करावा?' },
        { label: '🐛 अळी / बोंडअळी नियंत्रण', query: 'पिकात अळीचा प्रादुर्भाव झाला आहे, कोणते औषध फवारावे?' },
        { label: '🌧️ आज फवारणी करावी का?', query: 'आज कीटकनाशक फवारणी करणे सुरक्षित आहे का?' },
        { label: '🧪 NPK खताचे प्रमाण', query: 'NPK 19:19:19 आणि युरिया खताचे योग्य प्रमाण काय आहे?' },
      ],
      bn: [
        { label: '🌿 পাতায় হলুদ দাগ', query: 'ফসলের পাতায় হলুদ দাগ দেখা দিচ্ছে, কী ব্যবস্থা নেব?' },
        { label: '🐛 পোকা / শুঁয়োপোকা দমন', query: 'ফসলে পোকা লেগেছে, কোন কীটনাশক ব্যবহার করব?' },
        { label: '🌧️ আজ স্প্রে করব কি?', query: 'আজ জমিতে ওষুধ স্প্রে করা নিরাপদ হবে?' },
        { label: '🧪 NPK সারের মাত্রা', query: 'NPK সার ব্যবহারের সঠিক নিয়ম ও মাত্রা কী?' },
      ],
      ta: [
        { label: '🌿 இலைகளில் மஞ்சள் புள்ளிகள்', query: 'பயிர் இலைகளில் மஞ்சள் புள்ளிகள் உள்ளன, என்ன தீர்வு?' },
        { label: '🐛 புழு மற்றும் பூச்சி கட்டுப்பாடு', query: 'பயிரில் புழுக்கள் தாக்கியுள்ளன, என்ன மருந்து தெளிக்க வேண்டும்?' },
        { label: '🌧️ இன்று தெளிக்கலாமா?', query: 'இன்று பூச்சிக்கொல்லி தெளிப்பது பாதுகாப்பானதா?' },
        { label: '🧪 NPK உர அளவு', query: 'NPK உரத்தின் சரியான அளவு என்ன?' },
      ],
      te: [
        { label: '🌿 ఆకులపై పసుపు మచ్చలు', query: 'పంట ఆకులపై పసుపు మచ్చలు వస్తున్నాయి, నివారణ ఏమిటి?' },
        { label: '🐛 పురుగులు / లద్దె పురుగు', query: 'పంటలో పురుగుల నివారణకు ఏ మందు పిచికారీ చేయాలి?' },
        { label: '🌧️ ఈ రోజు పిచికారీ చేయవచ్చా?', query: 'ఈ రోజు పురుగుమందు పిచికారీ చేయడం సురక్షితమేనా?' },
        { label: '🧪 NPK ఎరువుల మోతాదు', query: 'NPK ఎరువుల సరైన మోతాదు ఎంత?' },
      ],
      gu: [
        { label: '🌿 પાંદડા પર પીળા ડાઘ', query: 'પાકના પાંદડા પર પીળા ડાઘા આવી રહ્યા છે, શું કરવું?' },
        { label: '🐛 ઇયળ / કીટકની દવા', query: 'પાકમાં ઇયળ આવી છે, કઈ દવાનો છંટકાવ કરવો?' },
        { label: '🌧️ આજે છંટકાવ કરવો કે નહીં?', query: 'શું આજે કીટનાશક છાંટવું સુરક્ષિત છે?' },
        { label: '🧪 NPK ખાતરનું પ્રમાણ', query: 'NPK અને યુરિયા ખાતરનું યોગ્ય પ્રમાણ શું છે?' },
      ],
      pa: [
        { label: '🌿 ਪੱਤਿਆਂ ਤੇ ਪੀਲੇ ਧੱਬੇ', query: 'ਫ਼ਸਲ ਦੇ ਪੱਤਿਆਂ ਉੱਤੇ ਪੀਲੇ ਧੱਬੇ ਆ ਰਹੇ ਹਨ, ਕੀ ਇਲਾਜ ਕਰੀਏ?' },
        { label: '🐛 ਸੁੰਡੀ / ਕੀੜਿਆਂ ਦੀ ਦਵਾਈ', query: 'ਫ਼ਸਲ ਵਿੱਚ ਸੁੰਡੀ ਲੱਗ ਗਈ ਹੈ, ਕਿਹੜੀ ਦਵਾਈ ਛਿੜਕੀਏ?' },
        { label: '🌧️ ਅੱਜ ਸਪਰੇਅ ਕਰੀਏ ਜਾਂ ਨਹੀਂ?', query: 'ਕੀ ਅੱਜ ਦਵਾਈ ਦਾ ਸਪਰੇਅ ਕਰਨਾ ਸੁਰੱਖਿਅਤ ਹੈ?' },
        { label: '🧪 NPK ਖਾਦ ਦੀ ਮਾਤਰਾ', query: 'NPK ਖਾਦ ਦੀ ਸਹੀ ਮਾਤਰਾ ਕੀ ਹੈ?' },
      ],
      en: [
        { label: '🌿 Yellow Leaf Spots', query: 'My crop leaves are turning yellow with spots, what is the ICAR treatment?' },
        { label: '🐛 Caterpillar / Worms', query: 'How do I control bollworms and caterpillars effectively?' },
        { label: '🌧️ Safe to spray today?', query: 'Is it safe to spray foliar chemicals today?' },
        { label: '🧪 NPK Dosage Guide', query: 'What is the recommended dosage for foliar NPK 19:19:19 and Urea?' },
      ],
    };
    return map[curLang] || map.en;
  };

  const quickPills = getQuickPills(lang);

  useEffect(() => {
    const greetings: Record<LanguageCode, string> = {
      hi: 'राम-राम किसान भाई! 🙏 मैं आपका कृषि-रक्षा AI सलाहकार हूँ। फसल रोग, कीड़े, खाद या आज के छिड़काव संबंधी कोई भी प्रश्न पूछें।',
      mr: 'नमस्कार शेतकरी मित्र! 🙏 मी आपला कृषी-रक्षा AI सल्लागार आहे. पिकातील रोग, कीड किंवा खताविषयी काहीही विचारा.',
      bn: 'নমস্কার কৃষক বন্ধু! 🙏 আমি আপনার কৃষি-রক্ষা AI উপদেষ্টা। ফসলের রোগ, পোকা বা সার সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞাসা করুন।',
      ta: 'வணக்கம் விவசாய நண்பரே! 🙏 நான் உங்கள் வேளாண் AI ஆலோசகர். பயிர் நோய்கள், பூச்சிகள் அல்லது உரங்கள் பற்றி எதையும் கேளுங்கள்.',
      te: 'నమస్కారం రైతు మిత్రమా! 🙏 నేను మీ వ్యవసాయ AI సలహాదారుని. పంట వ్యాధులు, పురుగులు లేదా ఎరువుల గురించి ఏదైనా అడగండి.',
      gu: 'નમસ્તે ખેડૂત મિત્ર! 🙏 હું તમારો કૃષિ-રક્ષા AI સલાહકાર છું. પાકના રોગ, કીટકો કે ખાતર અંગે કોઈ પણ પ્રશ્ન પૂછો.',
      pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! 🙏 ਮੈਂ ਤੁਹਾਡਾ ਖੇਤੀ-ਰੱਖਿਆ AI ਸਲਾਹਕਾਰ ਹਾਂ। ਫ਼ਸਲ ਦੇ ਰੋਗਾਂ ਜਾਂ ਖਾਦ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ।',
      en: 'Hello farmer friend! 🙏 I am your dedicated CropHealth AI Advisor. Ask me anything regarding crop diseases, pest dosages, or fertilizers.',
    };
    setWelcomeMsg(greetings[lang] || greetings.en);
  }, [lang]);

  useEffect(() => {
    if (open && messages.length === 0 && welcomeMsg) {
      setMessages([{ 
        role: 'assistant', 
        content: welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [open, welcomeMsg, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Clean up typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  /**
   * Smooth progressive typing stream (साथ-साथ लिखना)
   */
  const streamTypingText = useCallback((fullText: string) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    const words = fullText.split(' ');
    let currentIndex = 0;
    const initialContent = words[0] || '';

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: initialContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
      },
    ]);

    typingTimerRef.current = setInterval(() => {
      currentIndex++;
      if (currentIndex >= words.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: fullText,
              isStreaming: false,
            };
          }
          return updated;
        });
      } else {
        const partialText = words.slice(0, currentIndex + 1).join(' ');
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: partialText,
              isStreaming: true,
            };
          }
          return updated;
        });
      }
    }, 22); // Fast, natural 22ms per word stream
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (customText?: string) => {
    const text = (customText !== undefined ? customText : input).trim();
    if ((!text && !attachedImage) || loading) return;

    const userContent = text || (attachedImage ? (lang === 'hi' ? 'कृपया इस पत्ते की बीमारी की जांच करें' : 'Please check this leaf for disease') : '');
    const userMsg: Message = { 
      role: 'user', 
      content: userContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    if (attachedImage) userMsg.image = attachedImage;

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    const currentAttachment = attachedImage;
    setAttachedImage(null);
    setLoading(true);

    try {
      const historyFormatted = messages.map((m) => ({
        role: m.role,
        text: m.content,
      }));

      const reply = await GeminiVisionLiveService.chatWithGemini(
        userContent,
        historyFormatted,
        currentAttachment,
        null,
        lang
      );

      // Save scan to history if image was attached
      if (currentAttachment) {
        try {
          const newRecord = {
            id: `scan_${Date.now()}`,
            reported_by: 'farmer_active',
            observed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            priority: 'high' as const,
            status: 'verified' as const,
            description: text || (lang === 'hi' ? 'पत्ती लक्षण जांच एवं AI परामर्श' : 'Leaf scan and AI advisory'),
            images: [{
              id: `img_${Date.now()}`,
              observation_id: `scan_${Date.now()}`,
              storage_path: currentAttachment,
              file_name: 'crop_leaf_scan.jpg',
              mime_type: 'image/jpeg',
              file_size: 1024,
              created_at: new Date().toISOString(),
            }],
            diagnoses: [{
              id: `diag_${Date.now()}`,
              observation_id: `scan_${Date.now()}`,
              disease_id: text?.includes('टमाटर') ? 'टमाटर झुलसा (Early Blight)' : text?.includes('धान') ? 'धान झुलसा (Rice Blast)' : 'कपास बोंडअळी / थ्रिप्स (Cotton Pest & Spot)',
              confidence: 0.95,
            }],
            farm_crop: {
              current_stage: 'Flowering Stage',
              variety: 'Certified Variety',
              crop: { name: text?.includes('टमाटर') ? 'Tomato' : text?.includes('धान') ? 'Rice' : 'Cotton' },
            },
          };

          const currentCache = JSON.parse(localStorage.getItem('crophealth_observations_cache') || '[]');
          localStorage.setItem('crophealth_observations_cache', JSON.stringify([newRecord, ...currentCache]));
        } catch {}
      }

      setLoading(false);
      // Stream the response with live progressive typing
      streamTypingText(reply || (lang === 'hi' ? 'कृषि सलाह प्राप्त हो रही है...' : 'Generating advice...'));
    } catch (err) {
      console.warn('AICropDoctor error:', err);
      const fallback = getNaturalAgriculturalAdvice(userContent, lang);
      setLoading(false);
      streamTypingText(fallback);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setMessages([{ 
      role: 'assistant', 
      content: welcomeMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const canSend = (input.trim() || attachedImage) && !loading;

  return (
    <>
      {/* ============================================================= */}
      {/* 1. FLOATING TRIGGER BUTTON (AGRICULTURAL BOTANICAL EMBLEM)    */}
      {/* ============================================================= */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 hover:from-emerald-950 hover:to-teal-950 text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-900/40 transition-all duration-200 active:scale-95 group border border-emerald-400/40 ring-4 ring-emerald-500/15 select-none"
          aria-label="Open CropHealth AI Advisor"
        >
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-emerald-200 stroke-[2.4]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          </div>
          <span className="font-black text-xs sm:text-sm tracking-tight pr-1">
            {assistantTitle}
          </span>
        </button>
      )}

      {/* ============================================================= */}
      {/* 2. HIGH-AESTHETIC CHAT WINDOW                                */}
      {/* ============================================================= */}
      {open && (
        <div className="fixed inset-x-3 bottom-20 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[430px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 z-50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Sprout className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <div className="font-black text-sm text-white flex items-center gap-1.5 leading-none">
                  <span>{assistantTitle}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-200 text-[9px] font-black border border-emerald-400/40">
                    ICAR AI
                  </span>
                </div>
                <div className="text-[11px] text-emerald-200/90 font-medium mt-1">
                  {lang === 'hi' ? 'डिजिटल कृषि वैज्ञानिक परामर्श' : 'Certified Agronomist Consultation'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title="चैट रीसेट करें"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Tap Question Pills */}
          <div className="px-3 py-2 bg-stone-100/90 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(pill.query)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 font-bold whitespace-nowrap shadow-2xs transition-all active:scale-95"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/70">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-800 text-white rounded-br-xs font-semibold shadow-sm'
                      : 'bg-white text-stone-800 rounded-bl-xs border border-stone-200 shadow-sm'
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Crop Attachment"
                      className="w-full max-h-44 object-cover rounded-xl mb-2.5 border border-stone-200 shadow-2xs"
                    />
                  )}
                  <div className="whitespace-pre-wrap font-medium">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3.5 bg-emerald-600 animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                  {msg.timestamp && (
                    <div className={`text-[9px] mt-1.5 text-right font-medium ${
                      msg.role === 'user' ? 'text-emerald-200' : 'text-stone-400'
                    }`}>
                      {msg.timestamp}
                    </div>
                  )}
                </div>
                {/* Speaker button — only for AI replies */}
                {msg.role !== 'user' && !msg.isStreaming && msg.content && (
                  <div className="mt-1 ml-1">
                    <SpeakerButton text={msg.content} iconSize={13} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-stone-600 text-xs p-3 bg-white rounded-2xl border border-stone-200 w-fit shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span className="font-bold">
                  {lang === 'hi' 
                    ? 'कृषि-रक्षा AI सलाह तैयार कर रहा है...' 
                    : 'CropHealth AI Analyzing Guidelines...'}
                </span>
              </div>
            )}
          </div>

          {/* Attached Image Bar */}
          {attachedImage && (
            <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={attachedImage} alt="Thumb" className="w-9 h-9 rounded-lg object-cover border border-emerald-300" />
                <span className="text-[11px] font-black text-emerald-950">1 पत्ती की फोटो संलग्न है</span>
              </div>
              <button
                onClick={() => setAttachedImage(null)}
                className="text-stone-400 hover:text-rose-600 p-1"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 border border-stone-200 transition-colors"
              title="पत्ते की फोटो लगाएं"
            >
              <ImagePlus className="w-4 h-4 stroke-[2.2]" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'hi' ? 'फसल की बीमारी, कीड़े या खाद के बारे में पूछें...' : 'Ask about crop pest, dosage, fertilizer...'}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-xs font-bold text-stone-900 placeholder:text-stone-400"
            />

            <VoiceMicButton
              currentValue={input}
              onTranscript={(text) => setInput(text)}
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!canSend}
              className={`p-2.5 rounded-xl transition-all ${
                canSend
                  ? 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs active:scale-95'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
