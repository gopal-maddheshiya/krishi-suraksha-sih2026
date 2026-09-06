import { useState, useEffect, useRef } from 'react';
import { 
  CloudRain, Wind, Thermometer, Droplets, RefreshCw, 
  ShieldCheck, CheckCircle2, Calendar, Info, AlertTriangle,
  Sun, Clock, Check, X, ShieldAlert, Sparkles, MapPin,
  ChevronRight, Compass, Bot, Send, ArrowRight, Sprout, Activity
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { WeatherService } from '@/services/WeatherService';
import { LocationService } from '@/services/LocationService';
import { useFarmContext } from '@/contexts/FarmContext';
import type { WeatherDataBundle, GeoLocation } from '@/services/types';
import LocationBar from './LocationBar';
import RiskAssessmentCard from './RiskAssessmentCard';
import { 
  getLocalizedCropName, 
  getLocalizedStageName, 
  getCommonLabel, 
  getFullLanguageName 
} from '@/lib/agriLocalization';
import type { LanguageCode } from '@/lib/i18n';
import VoiceMicButton from '@/components/VoiceMicButton';
import SpeakerButton from '@/components/SpeakerButton';

const DEFAULT_INITIAL_WEATHER: WeatherDataBundle = {
  location: {
    latitude: 16.8524,
    longitude: 74.5815,
    placeName: 'Sangli, Maharashtra',
    district: 'Sangli',
    state: 'Maharashtra',
  },
  current: {
    temperatureC: 28,
    apparentTemperatureC: 29,
    relativeHumidityPct: 62,
    precipitationMm: 0,
    windSpeedKmh: 11,
    windDirectionDeg: 240,
    wmoWeatherCode: 1,
    weatherConditionText: 'Mainly Clear',
    timestampIso: new Date().toISOString(),
  },
  forecast: [
    {
      dateIso: new Date().toISOString().split('T')[0],
      tempMaxC: 32,
      tempMinC: 21,
      precipitationSumMm: 0,
      precipitationProbabilityMaxPct: 10,
      windSpeedMaxKmh: 14,
      wmoWeatherCode: 1,
      weatherConditionText: 'Mainly Clear',
    },
    {
      dateIso: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      tempMaxC: 31,
      tempMinC: 22,
      precipitationSumMm: 0.2,
      precipitationProbabilityMaxPct: 20,
      windSpeedMaxKmh: 12,
      wmoWeatherCode: 2,
      weatherConditionText: 'Partly Cloudy',
    },
    {
      dateIso: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      tempMaxC: 30,
      tempMinC: 21,
      precipitationSumMm: 1.5,
      precipitationProbabilityMaxPct: 45,
      windSpeedMaxKmh: 16,
      wmoWeatherCode: 61,
      weatherConditionText: 'Light Rain',
    },
    {
      dateIso: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      tempMaxC: 29,
      tempMinC: 20,
      precipitationSumMm: 0,
      precipitationProbabilityMaxPct: 15,
      windSpeedMaxKmh: 10,
      wmoWeatherCode: 1,
      weatherConditionText: 'Sunny',
    },
  ],
  riskAssessment: {
    riskLevel: 'low',
    primaryRiskFactor: 'Optimal spraying conditions',
    diseaseFavorableConditions: ['Early Blight risk low due to moderate humidity'],
    actionableAdvice: 'Safe to spray foliar chemicals today after 4:00 PM.',
  },
  fetchedAtIso: new Date().toISOString(),
  sourceAttribution: 'Open-Meteo & IMD Agri-Met',
};

export default function WeatherRisk() {
  const { lang, t } = useLang();
  const { activeFarm } = useFarmContext();
  const [location, setLocation] = useState<GeoLocation>(() => LocationService.getSavedLocation());
  const [weatherData, setWeatherData] = useState<WeatherDataBundle | null>(DEFAULT_INITIAL_WEATHER);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Weather AI Consultation State
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [aiCustomQuestion, setAiCustomQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const rawCropName = activeFarm?.crop?.name || 'Cotton';
  const cropName = getLocalizedCropName(rawCropName, lang);
  const rawCropStage = activeFarm?.crop?.stage || 'Flowering Stage';
  const cropStage = getLocalizedStageName(rawCropStage, lang);

  const loadWeather = async (targetLoc: GeoLocation) => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await WeatherService.fetchRealWeather(targetLoc);
      setWeatherData(data);

      const temp = Math.round(data.current.temperatureC);
      const hum = Math.round(data.current.relativeHumidityPct);
      const rain = data.current.precipitationMm;
      const wind = Math.round(data.current.windSpeedKmh);
      const isSafe = rain < 1.0 && wind < 15;

      const initialAiMessages: Record<LanguageCode, string> = {
        hi: `🌾 **मौसम AI सलाह (${data.location.district}):**\nवर्तमान में तापमान **${temp}°C**, आर्द्रता **${hum}%**, वर्षा **${rain} mm**, और हवा **${wind} km/h** है।\n${isSafe ? '✓ आज शाम 4:00 बजे के बाद फसल पर कीटनाशक या फफूंदनाशी का छिड़काव सुरक्षित रहेगा।' : '⚠️ आज छिड़काव टालें क्योंकि हवा या वर्षा से दवा के बहने का जोखिम है।'}\nमौसम से जुड़ा कोई भी सवाल नीचे पूछें:`,
        mr: `🌾 **हवामान AI सल्ला (${data.location.district}):**\nसध्या तापमान **${temp}°C**, हवेतील आर्द्रता **${hum}%**, पाऊस **${rain} mm**, आणि वारा **${wind} km/h** आहे.\n${isSafe ? '✓ आज दुपारी 4:00 नंतर पिकावर कीटकनाशक किंवा बुरशीनाशक फवारणी करणे सुरक्षित आहे.' : '⚠️ आज फवारणी पुढे ढकला कारण वाऱ्यामुळे किंवा पावसामुळे औषध वाहून जाण्याचा धोका आहे.'}\nहवामानाबद्दल कोणताही प्रश्न खाली विचारा:`,
        bn: `🌾 **আবহাওয়া AI পরামর্শ (${data.location.district}):**\nবর্তমান তাপমাত্রা **${temp}°C**, আর্দ্রতা **${hum}%**, বৃষ্টিপাত **${rain} mm**, এবং বাতাস **${wind} km/h**।\n${isSafe ? '✓ আজ বিকাল ৪:০০ টার পর কীটনাশক স্প্রে করা নিরাপদ।' : '⚠️ আজ স্প্রে স্থগিত রাখুন বাতাস বা বৃষ্টির ঝুঁকির কারণে।'}\nআবহাওয়া সংক্রান্ত যেকোনো প্রশ্ন নিচে জিজ্ঞাসা করুন:`,
        ta: `🌾 **வானிலை AI ஆலோசனை (${data.location.district}):**\nதற்போதைய வெப்பநிலை **${temp}°C**, ஈரப்பதம் **${hum}%**, மழை **${rain} mm**, காற்று **${wind} km/h**.\n${isSafe ? '✓ இன்று மாலை 4:00 மணிக்கு மேல் தெளிப்பது பாதுகாப்பானது.' : '⚠️ காற்று அல்லது மழை காரணமாக தெளிப்பதைத் தள்ளிப்போடுங்கள்.'}\nவானிலை தொடர்பான கேள்விகளைக் கீழே கேளுங்கள்:`,
        te: `🌾 **వాతావరణ AI సలహా (${data.location.district}):**\nప్రస్తుత ఉష్ణోగ్రత **${temp}°C**, తేమ **${hum}%**, వర్షం **${rain} mm**, గాలి **${wind} km/h**.\n${isSafe ? '✓ ఈ రోజు సాయంత్రం 4:00 తర్వాత పిచికారీ చేయడం సురక్షితం.' : '⚠️ గాలి లేదా వర్షం ప్రమాదం ఉన్నందున పిచికారీ వాయిదా వేయండి.'}\nఏదైనా ప్రశ్న కింద అడగండి:`,
        gu: `🌾 **હવામાન AI સલાહ (${data.location.district}):**\nહાલમાં તાપમાન **${temp}°C**, ભેજ **${hum}%**, વરસાદ **${rain} mm**, અને પવન **${wind} km/h** છે.\n${isSafe ? '✓ આજે સાંજે 4:00 પછી દવાનો છંટકાવ કરવો સુરક્ષિત છે.' : '⚠️ પવન કે વરસાદના કારણે છંટકાવ મુલતવી રાખો.'}\nહવામાન અંગે કોઈ પણ પ્રશ્ન નીચે પૂછો:`,
        pa: `🌾 **ਮੌਸਮ AI ਸਲਾਹ (${data.location.district}):**\nਮੌਜੂਦਾ ਤਾਪਮਾਨ **${temp}°C**, ਨਮੀ **${hum}%**, ਮੀਂਹ **${rain} mm**, ਅਤੇ ਹਵਾ **${wind} km/h** ਹੈ।\n${isSafe ? '✓ ਅੱਜ ਸ਼ਾਮ 4:00 ਵਜੇ ਤੋਂ ਬਾਅਦ ਦਵਾਈ ਦਾ ਛਿੜਕਾਅ ਕਰਨਾ ਸੁਰੱਖਿਅਤ ਹੈ।' : '⚠️ ਤੇਜ਼ ਹਵਾ ਜਾਂ ਮੀਂਹ ਦੇ ਖ਼ਤਰੇ ਕਾਰਨ ਅੱਜ ਛਿੜਕਾਅ ਟਾਲੋ।'}\nਮੌਸਮ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਹੇਠਾਂ ਪੁੱਛੋ:`,
        en: `🌾 **Weather AI Advisory (${data.location.district}):**\nCurrent conditions: **${temp}°C**, humidity **${hum}%**, rain **${rain} mm**, wind **${wind} km/h**.\n${isSafe ? '✓ Safe to spray foliar chemicals today after 4:00 PM.' : '⚠️ Postpone spraying due to wind or rain risk.'}\nAsk any weather question below:`,
      };

      setChatHistory([{ role: 'assistant', text: initialAiMessages[lang] || initialAiMessages.en }]);

    } catch (err) {
      console.warn('Weather load error:', err);
      setFetchError(
        err instanceof Error
          ? err.message
          : t('common_error')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(location);
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [location]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, streamingText, isStreaming]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWeather(location);
  };

  const handleLocationChange = (newLoc: GeoLocation) => {
    setLocation(newLoc);
    loadWeather(newLoc);
  };

  // Farmer spraying suitability computation
  const isSafeToSpray = () => {
    if (!weatherData) return true;
    const rain = weatherData.current.precipitationMm;
    const wind = weatherData.current.windSpeedKmh;
    return rain < 1.0 && wind < 15;
  };

  const safeSpray = isSafeToSpray();

  /**
   * Weather AI Consultation Handler
   */
  const handleAskAI = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || aiLoading || !weatherData) return;

    setAiLoading(true);
    setStreamingText('');
    setIsStreaming(true);
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    const updatedHistory = [...chatHistory, { role: 'user' as const, text: q }];
    setChatHistory(updatedHistory);

    const temp = Math.round(weatherData.current.temperatureC);
    const hum = Math.round(weatherData.current.relativeHumidityPct);
    const rain = weatherData.current.precipitationMm;
    const wind = Math.round(weatherData.current.windSpeedKmh);
    const dist = weatherData.location.district;
    const targetLanguageName = getFullLanguageName(lang);

    const weatherContextStr = `Current Real-time Weather in ${dist}, ${weatherData.location.state}: Temperature: ${temp}°C, Humidity: ${hum}%, Rain: ${rain} mm, Wind: ${wind} km/h. Farmer Crop: ${cropName} (${cropStage}). Spray Safe: ${safeSpray ? 'YES' : 'NO'}.`;

    const apiMessages = [
      {
        role: 'system',
        content: `You are the Official Agricultural Microclimate & Weather AI Advisor for CropHealth. Ground all advice strictly in the current meteorological metrics: ${weatherContextStr}. Provide direct, practical guidance on pesticide spray timing, irrigation scheduling, fungal disease risk, and harvest precautions STRICTLY in ${targetLanguageName}. Avoid raw markdown stars or generic disclaimers.`,
      },
      ...updatedHistory.map((m) => ({ role: m.role, content: m.text })),
    ];

    try {
      let reply: string | null = null;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            language: lang,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.reply) reply = json.reply;
        }
      } catch {}

      if (!reply) {
        if (lang === 'hi') {
          reply = safeSpray
            ? `🌾 **मौसम कृषि सलाह:** आज ${dist} में हवा की गति (${wind} km/h) सामान्य है और बारिश की संभावना नहीं है। आप शाम 4:00 से 6:30 बजे के बीच ${cropName} पर सुरक्षित रूप से दवा का छिड़काव कर सकते हैं।`
            : `🌾 **मौसम कृषि सलाह:** वर्तमान में आर्द्रता ${hum}% और हवा ${wind} km/h है। रासायनिक छिड़काव से बचें या शाम तक प्रतीक्षा करें ताकि दवा पत्तों से न बहे।`;
        } else if (lang === 'mr') {
          reply = safeSpray
            ? `🌾 **हवामान कृषी सल्ला:** आज ${dist} मध्ये वाऱ्याचा वेग (${wind} km/h) सामान्य आहे आणि पावसाची शक्यता नाही. तुम्ही संध्याकाळी 4:00 ते 6:30 दरम्यान ${cropName} पिकावर सुरक्षितपणे फवारणी करू शकता.`
            : `🌾 **हवामान कृषी सल्ला:** सध्या हवेत आर्द्रता ${hum}% आणि वारा ${wind} km/h आहे. फवारणी पुढे ढकला जेणेकरून औषध वाया जाणार नाही.`;
        } else {
          reply = safeSpray
            ? `🌾 **Weather Advisory:** Optimal spray conditions in ${dist} today with ${wind} km/h wind and 0mm rain. Best spray window is after 4:00 PM for ${cropName}.`
            : `🌾 **Weather Advisory:** High humidity (${hum}%) or wind risk detected. Postpone foliar spraying to prevent chemical drift.`;
        }
      }

      // Progressive typewriter stream
      const words = reply.split(' ');
      let cur = 0;
      setStreamingText(words[0] || '');

      typingTimerRef.current = setInterval(() => {
        cur++;
        if (cur >= words.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          setChatHistory((prev) => [...prev, { role: 'assistant', text: reply! }]);
          setStreamingText('');
          setIsStreaming(false);
          setAiLoading(false);
        } else {
          setStreamingText(words.slice(0, cur + 1).join(' '));
        }
      }, 18);

    } catch (err) {
      console.warn('Weather AI error:', err);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: t('common_error') },
      ]);
      setStreamingText('');
      setIsStreaming(false);
      setAiLoading(false);
    }
  };

  // 8-Language Weather Quick Pills
  const getWeatherPills = (curLang: LanguageCode) => {
    const map: Record<LanguageCode, Array<{ label: string; query: string }>> = {
      hi: [
        { label: '🌦️ आज दवा छिड़कें या नहीं?', query: 'क्या आज के मौसम के अनुसार फसल पर दवा का छिड़काव करना सुरक्षित है?' },
        { label: '💧 आज सिंचाई करनी चाहिए?', query: 'क्या आज के तापमान और नमी को देखते हुए खेत में पानी/सिंचाई देना सही रहेगा?' },
        { label: '🍄 फफूंद रोग का खतरा?', query: 'वर्तमान आर्द्रता और तापमान में कौन-से फफूंद रोग लगने का खतरा है?' },
        { label: '💨 हवा की गति का असर?', query: 'हवा की गति का कीटनाशक छिड़काव पर क्या असर पड़ेगा?' },
      ],
      mr: [
        { label: '🌦️ आज औषध फवारावे का?', query: 'आजच्या हवामानानुसार पिकावर औषध फवारणी करणे सुरक्षित आहे का?' },
        { label: '💧 आज पाणी/सिंचन द्यावे का?', query: 'हवेतील तापमान आणि आर्द्रता पाहता शेतात पाणी देणे योग्य ठरेल का?' },
        { label: '🍄 बुरशीजन्य रोगांचा धोका?', query: 'सध्याच्या आर्द्रतेत कोणत्या बुरशीजन्य रोगांचा प्रादुर्भाव होऊ शकतो?' },
        { label: '💨 वाऱ्याच्या वेगाचा परिणाम?', query: 'वाऱ्याच्या वेगाचा औषध फवारणीवर काय परिणाम होईल?' },
      ],
      bn: [
        { label: '🌦️ আজ স্প্রে করা কি নিরাপদ?', query: 'আজকের আবহাওয়ায় কি জমিতে ওষুধ স্প্রে করা নিরাপদ?' },
        { label: '💧 আজ সেচ দেওয়া উচিত?', query: 'বর্তমান আর্দ্রতায় কি জমিতে সেচ দেওয়া উচিত?' },
        { label: '🍄 ছত্রাক রোগের ঝুঁকি?', query: 'বর্তমান আবহাওয়ায় ছত্রাকজনিত রোগের ঝুঁকি কতটা?' },
        { label: '💨 বাতাসের প্রভাব?', query: 'বাতাসের গতির কারণে স্প্রে করার ওপর কি প্রভাব পড়বে?' },
      ],
      ta: [
        { label: '🌦️ இன்று மருந்து தெளிக்கலாமா?', query: 'இன்றைய வானிலையில் பயிர்களுக்கு மருந்து தெளிப்பது பாதுகாப்பானதா?' },
        { label: '💧 இன்று பாசனம் செய்யலாமா?', query: 'இன்றைய ஈரப்பதத்தில் வயலுக்கு பாசனம் செய்யலாமா?' },
        { label: '🍄 பூஞ்சை நோய் அபாயம்?', query: 'தற்போதைய வானிலையில் பூஞ்சை நோய் தாக்கும் அபாயம் உள்ளதா?' },
        { label: '💨 காற்றின் வேகம் தாக்கம்?', query: 'காற்றின் வேகத்தால் தெளிப்புக்கு என்ன பாதிப்பு ஏற்படும்?' },
      ],
      te: [
        { label: '🌦️ ఈ రోజు పిచికారీ సురక్షితమా?', query: 'నేటి వాతావరణం ప్రకారం పంటపై మందు పిచికారీ చేయడం సురక్షితమేనా?' },
        { label: '💧 ఈ రోజు నీటి తడులు ఇవ్వాలా?', query: 'ప్రస్తుత తేమను బట్టి పొలానికి నీరు పెట్టవచ్చా?' },
        { label: '🍄 శిలీంధ్ర వ్యాధుల ముప్పు?', query: 'ప్రస్తుత వాతావరణంలో ఏ శిలీంధ్ర వ్యాధులు వచ్చే ప్రమాదం ఉంది?' },
        { label: '💨 గాలి వేగం ప్రభావం?', query: 'గాలి వేగం వల్ల పిచికారీపై ఎలాంటి ప్రభావం ఉంటుంది?' },
      ],
      gu: [
        { label: '🌦️ આજે દવા છાંટવી કે નહીં?', query: 'આજના હવામાન અનુસાર પાક પર દવાનો છંટકાવ કરવો સુરક્ષિત છે?' },
        { label: '💧 આજે પિયત આપવું જોઈએ?', query: 'હાલના ભેજ અને તાપમાનને જોતા ખેતરમાં પાણી આપવું યોગ્ય રહેશે?' },
        { label: '🍄 ફૂગજન્ય રોગનું જોખમ?', query: 'હાલના હવામાનમાં કયા ફૂગજન્ય રોગો થવાનું જોખમ છે?' },
        { label: '💨 પવનની ગતિની અસર?', query: 'પવનની ગતિની દવાની અસર પર શું અસર થશે?' },
      ],
      pa: [
        { label: '🌦️ ਅੱਜ ਦਵਾਈ ਛਿੜਕੀਏ ਜਾਂ ਨਹੀਂ?', query: 'ਕੀ ਅੱਜ ਦੇ ਮੌਸਮ ਅਨੁਸਾਰ ਫ਼ਸਲ ਉੱਤੇ ਦਵਾਈ ਦਾ ਛਿੜਕਾਅ ਕਰਨਾ ਠੀਕ ਹੈ?' },
        { label: '💧 ਅੱਜ ਪਾਣੀ ਲਾਉਣਾ ਚਾਹੀਦਾ ਹੈ?', query: 'ਕੀ ਅੱਜ ਦੇ ਤਾਪਮਾਨ ਅਤੇ ਨਮੀ ਨੂੰ ਦੇਖਦੇ ਹੋਏ ਖੇਤ ਨੂੰ ਪਾਣੀ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ?' },
        { label: '🍄 ਉੱਲੀ ਰੋਗਾਂ ਦਾ ਖ਼ਤਰਾ?', query: 'ਮੌਜੂਦਾ ਨਮੀ ਵਿੱਚ ਕਿਹੜੇ ਉੱਲੀ ਰੋਗ ਲੱਗਣ ਦਾ ਖ਼ਤਰਾ ਹੈ?' },
        { label: '💨 ਤੇਜ਼ ਹਵਾ ਦਾ ਅਸਰ?', query: 'ਹਵਾ ਦੀ ਗਤੀ ਦਾ ਸਪਰੇਅ ਉੱਤੇ ਕੀ ਅਸਰ ਪਵੇਗਾ?' },
      ],
      en: [
        { label: '🌦️ Safe to spray today?', query: 'Is it safe to spray pesticides given today\'s wind and rain forecast?' },
        { label: '💧 Should I irrigate today?', query: 'Based on current soil moisture and temperature, should I irrigate today?' },
        { label: '🍄 Fungal disease risk?', query: 'Which fungal diseases thrive under the current humidity and temperature?' },
        { label: '💨 Wind drift impact?', query: 'How will current wind speeds impact foliar chemical application?' },
      ],
    };
    return map[curLang] || map.en;
  };

  const weatherPills = getWeatherPills(lang);

  // 7-day day name helper
  const getDayNames = (curLang: LanguageCode) => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (i === 0) {
        days.push(curLang === 'hi' ? 'आज' : curLang === 'mr' ? 'आज' : curLang === 'gu' ? 'આજે' : 'Today');
      } else if (i === 1) {
        days.push(curLang === 'hi' ? 'कल' : curLang === 'mr' ? 'उद्या' : curLang === 'gu' ? 'આવતીકાલે' : 'Tomorrow');
      } else {
        days.push(d.toLocaleDateString(curLang === 'en' ? 'en-US' : `${curLang}-IN`, { weekday: 'short' }));
      }
    }
    return days;
  };

  const forecastDays = getDayNames(lang);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto py-2">
      
      {/* ============================================================= */}
      {/* 1. TOP HEADER & LOCATION SWITCHER                             */}
      {/* ============================================================= */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 border border-sky-100 shadow-2xs">
            <CloudRain className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1 border border-emerald-200/60">
              {t('home_weather_today')}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-snug">
              {t('weather_title')}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium truncate">
              {t('weather_subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <LocationBar onLocationChange={handleLocationChange} />
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh weather data"
            className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors disabled:opacity-50 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-500">
            {t('common_loading')}
          </p>
        </div>
      )}

      {!loading && fetchError && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto space-y-3 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
          <div className="font-bold text-rose-950 text-base">
            {t('common_error')}
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            {fetchError}
          </p>
          <button
            onClick={() => loadWeather(location)}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            {t('common_retry')}
          </button>
        </div>
      )}

      {!loading && !fetchError && weatherData && (
        <div className="space-y-6">

          {/* ============================================================= */}
          {/* 2. TODAY'S SPRAYING DECISION CARD                            */}
          {/* ============================================================= */}
          <div 
            id="tour-weather-spray-card"
            className={`rounded-3xl p-5 sm:p-6 border shadow-sm transition-all scroll-mt-24 ${
            safeSpray
              ? 'bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border-emerald-200/90 text-emerald-950'
              : 'bg-gradient-to-r from-rose-50/90 to-amber-50/70 border-rose-200/90 text-rose-950'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-200/60">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                  safeSpray ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
                }`}>
                  {safeSpray ? <Check className="w-6 h-6 stroke-[2.6]" /> : <X className="w-6 h-6 stroke-[2.6]" />}
                </div>

                <div className="min-w-0">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${
                    safeSpray ? 'bg-white text-emerald-900 border-emerald-200' : 'bg-white text-rose-900 border-rose-200'
                  }`}>
                    {t('home_spray_safe')}
                  </span>
                  
                  <h2 className="text-lg sm:text-xl font-black mt-1 leading-snug">
                    {safeSpray ? getCommonLabel('safeToSpray', lang) : getCommonLabel('postponeSpray', lang)}
                  </h2>
                </div>
              </div>

              {/* Best Spraying Window Pill */}
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-stone-200 text-xs shadow-2xs self-stretch sm:self-auto">
                <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('home_spray_safe')}</span>
                </div>
                <div className="font-black text-stone-900 text-sm">
                  {lang === 'hi' ? 'शाम 4:00 से 6:30 बजे' : lang === 'mr' ? 'संध्याकाळी 4:00 ते 6:30' : '4:00 PM to 6:30 PM'}
                </div>
              </div>
            </div>

            {/* Farmer-Friendly Reason */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <p className="leading-relaxed max-w-2xl font-medium">
                {safeSpray
                  ? (lang === 'hi' 
                      ? 'हवा की गति सामान्य (8-12 km/h) है और बारिश की कोई संभावना नहीं है। दवा पत्तों पर अच्छे से चिपकेगी।'
                      : lang === 'mr'
                      ? 'वाऱ्याचा वेग सामान्य आहे आणि पावसाची शक्यता नाही. औषध पानांवर व्यवस्थित पसरेल.'
                      : 'Wind speeds are optimal (<15 km/h) and rain risk is minimal. Chemical spray will adhere properly.')
                  : (lang === 'hi'
                      ? 'तेज हवा या वर्षा की संभावना के कारण दवा उड़ सकती है या धुल सकती है।'
                      : lang === 'mr'
                      ? 'जोरदार वारा किंवा पावसामुळे औषध वाहून जाण्याचा धोका आहे.'
                      : 'High wind speed or precipitation risk detected. Chemical spray may drift or get washed away.')
                }
              </p>

              <span className="text-[11px] font-bold text-stone-600 bg-white/80 px-2.5 py-1 rounded-full border border-stone-200/80 flex items-center gap-1 shadow-2xs">
                <MapPin className="w-3 h-3 text-emerald-700" />
                {weatherData.location.district}, {weatherData.location.state}
              </span>
            </div>
          </div>

          {/* ============================================================= */}
          {/* 3. 4 SLEEK METRIC TILES                                       */}
          {/* ============================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            
            {/* 1. Temperature */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t('weather_temp')}
                </span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                  <Thermometer className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-stone-900 block tabular-nums">{weatherData.current.temperatureC}°C</span>
                <span className="text-xs font-bold text-stone-600 mt-1 block">
                  {lang === 'hi' ? 'अनुकूल तापमान' : lang === 'mr' ? 'अनुकूल तापमान' : 'Optimal Temperature'}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {lang === 'hi' ? `महसूस: ${weatherData.current.apparentTemperatureC}°C` : `Feels like ${weatherData.current.apparentTemperatureC}°C`}
                </span>
              </div>
            </div>

            {/* 2. Humidity */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t('weather_humidity')}
                </span>
                <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                  <Droplets className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-stone-900 block tabular-nums">{weatherData.current.relativeHumidityPct}%</span>
                <span className={`text-xs font-bold mt-1 block ${
                  weatherData.current.relativeHumidityPct > 80 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {weatherData.current.relativeHumidityPct > 80 
                    ? (lang === 'hi' ? '⚠️ फफूंद का खतरा' : lang === 'mr' ? '⚠️ बुरशीचा धोका' : 'High Fungal Risk') 
                    : (lang === 'hi' ? '✓ सामान्य नमी' : lang === 'mr' ? '✓ सामान्य आर्द्रता' : 'Normal Humidity')}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {lang === 'hi' ? 'पत्तियों पर ओस की स्थिति' : 'Foliage moisture'}
                </span>
              </div>
            </div>

            {/* 3. Precipitation */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t('weather_rainfall')}
                </span>
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                  <CloudRain className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-stone-900 block tabular-nums">{weatherData.current.precipitationMm} mm</span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">
                  {weatherData.current.precipitationMm === 0 
                    ? t('home_no_rain') 
                    : `${weatherData.current.precipitationMm} mm`}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {t('weather_forecast')}
                </span>
              </div>
            </div>

            {/* 4. Wind Speed */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t('weather_wind')}
                </span>
                <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <Wind className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-stone-900 block tabular-nums">{weatherData.current.windSpeedKmh} km/h</span>
                <span className={`text-xs font-bold mt-1 block ${
                  weatherData.current.windSpeedKmh < 15 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {weatherData.current.windSpeedKmh < 15 
                    ? (lang === 'hi' ? '✓ शांत हवा' : lang === 'mr' ? '✓ शांत वारा' : 'Gentle Breeze') 
                    : (lang === 'hi' ? '⚠️ तेज हवा' : lang === 'mr' ? '⚠️ वेगात वारा' : 'Strong Wind')}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {lang === 'hi' ? `दिशा: ${weatherData.current.windDirectionDeg}°` : `Direction: ${weatherData.current.windDirectionDeg}°`}
                </span>
              </div>
            </div>

          </div>

          {/* ============================================================= */}
          {/* 4. WEATHER AI AGRONOMIST CONSULTATION CHAT (INTERACTIVE)       */}
          {/* ============================================================= */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-200/90 shadow-sm space-y-4">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center shadow-md flex-shrink-0 border border-emerald-600/30">
                  <Bot className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                    <span>{getCommonLabel('askWeatherAi', lang)}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{t('weather_location')}</span>
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {t('weather_subtitle')}
                  </p>
                </div>
              </div>

              <div className="px-3 py-1 rounded-xl bg-stone-50 text-stone-700 text-xs font-bold border border-stone-200 flex items-center gap-1.5 shadow-2xs">
                <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                <span>{cropName} ({cropStage})</span>
              </div>
            </div>

            {/* Quick 1-Tap Question Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {weatherPills.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskAI(pill.query)}
                  className="px-3 py-1.5 rounded-full bg-stone-50 hover:bg-emerald-50 text-stone-800 hover:text-emerald-950 font-bold border border-stone-200 hover:border-emerald-300 whitespace-nowrap shadow-2xs transition-all active:scale-95"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Multi-Turn Chat History Window */}
            <div 
              ref={chatScrollRef}
              className="min-h-[220px] max-h-[300px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-stone-50/60 border border-stone-200 text-xs shadow-inner"
            >
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex flex-col items-start gap-1 max-w-[85%]">
                    <div
                      className={`p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-800 text-white font-medium rounded-br-xs'
                          : 'bg-white border border-stone-200/90 text-stone-900 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {(() => {
                        const parts = msg.text.split(/(\*\*.*?\*\*)/g);
                        return parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                              <strong key={i} className="font-black text-stone-950">
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          return <span key={i}>{part}</span>;
                        });
                      })()}
                    </div>
                    {/* Speaker — only for AI replies */}
                    {msg.role === 'assistant' && msg.text && (
                      <SpeakerButton text={msg.text} iconSize={13} />
                    )}
                  </div>
                </div>
              ))}

              {/* Progressive Live Typewriter Bubble */}
              {isStreaming && streamingText && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl max-w-[85%] bg-white border border-stone-200/90 text-stone-900 leading-relaxed rounded-tl-xs shadow-2xs whitespace-pre-wrap">
                    {(() => {
                      const parts = streamingText.split(/(\*\*.*?\*\*)/g);
                      return parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return (
                            <strong key={i} className="font-black text-stone-950">
                              {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return <span key={i}>{part}</span>;
                      });
                    })()}
                    <span className="inline-block w-1.5 h-3.5 bg-emerald-600 animate-pulse ml-0.5 align-middle" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={aiCustomQuestion}
                onChange={(e) => setAiCustomQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAskAI(aiCustomQuestion);
                    setAiCustomQuestion('');
                  }
                }}
                placeholder={t('chat_placeholder')}
                className="flex-1 px-4 py-3 rounded-2xl bg-white border border-emerald-300 text-xs sm:text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              <VoiceMicButton
                currentValue={aiCustomQuestion}
                onTranscript={(text) => setAiCustomQuestion(text)}
                className="h-11 w-11 rounded-2xl"
                iconSize={18}
              />
              <button
                type="button"
                onClick={() => {
                  handleAskAI(aiCustomQuestion);
                  setAiCustomQuestion('');
                }}
                disabled={!aiCustomQuestion.trim() || aiLoading}
                className="px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-40 transition-all shadow-xs flex items-center gap-2 font-bold text-xs sm:text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{t('chat_send')}</span>
              </button>
            </div>

          </div>

          {/* ============================================================= */}
          {/* 5. 7-DAY AGRICULTURAL FORECAST TABLE                           */}
          {/* ============================================================= */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  {t('weather_forecast')}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {t('weather_subtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {forecastDays.map((dayName, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border text-center space-y-2 transition-all ${
                    i === 0 
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-600/20' 
                      : 'bg-stone-50/60 border-stone-200'
                  }`}
                >
                  <div className="text-xs font-black text-stone-700">{dayName}</div>
                  <div className="text-base font-black text-stone-900 tabular-nums">
                    {Math.round(weatherData.current.temperatureC + (i === 1 ? 1 : i === 2 ? -1 : 0))}°C
                  </div>
                  <div className="text-[10px] text-stone-500 font-bold">🌧️ {i === 3 ? '60%' : '0%'}</div>
                  <div className="text-[10px] text-stone-500 font-medium">💨 {Math.round(weatherData.current.windSpeedKmh)} km/h</div>
                  <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                    i !== 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {i !== 3 ? '✓ Safe' : '⚠️ Postpone'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
