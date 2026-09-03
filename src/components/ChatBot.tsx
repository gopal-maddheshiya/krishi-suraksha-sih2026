import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ImagePlus, XCircle, Sparkles, Leaf, Bot } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

type Message = { role: 'user' | 'assistant'; content: string; image?: string };
type GeminiPart = { text?: string; inline_data?: { mime_type: string; data: string } };

const GEMINI_MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

function getLanguageName(language: string): string {
  const map: Record<string, string> = {
    en: 'English', hi: 'Hindi', bn: 'Bengali', ta: 'Tamil',
    te: 'Telugu', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi',
  };
  return map[language] || 'English';
}

type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };

function extractGeminiReply(data: unknown): string | null {
  const candidates = (data as GeminiResponse)?.candidates ?? [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts ?? [];
    const textChunks = parts
      .filter((p) => typeof p?.text === 'string')
      .map((p) => p.text as string)
      .filter(Boolean);
    if (textChunks.length > 0) return textChunks.join('\n');
  }
  return null;
}

function formatAssistantReply(content: string): string {
  return content
    .replace(/\*\*+/g, '')
    .replace(/\s*\n\s*\n\s*/g, '\n\n')
    .trim();
}

/**
 * Smart Agricultural Knowledge Base Responder (ICAR + Advisory Guidelines)
 */
function getLocalAgriculturalAdvice(query: string, lang: string): string {
  const q = query.toLowerCase();

  // Greetings
  if (q.includes('hello') || q.includes('hi') || q.includes('namaste') || q.includes('kaise ho') || q.includes('kem cho')) {
    if (lang === 'hi') {
      return 'नमस्ते किसान भाई! मैं CropHealth AI का कृषि सलाहकार हूँ। मैं बिल्कुल ठीक हूँ। आपकी फसल (जैसे कपास, सोयाबीन, धान, टमाटर) में क्या समस्या आ रही है? मुझे बताएं, मैं ICAR प्रमाणित समाधान और स्प्रे की मात्रा बताऊंगा।';
    }
    if (lang === 'mr') {
      return 'नमस्कार शेतकरी मित्र! मी CropHealth AI पीक आरोग्य सल्लागार आहे. मी छान आहे. आपल्या पिकात (कापूस, सोयाबीन, भात, टोमॅटो) कोणती समस्या आहे? सांगा, मी योग्य औषध व फवारणीचे प्रमाण सांगतो.';
    }
    return 'Hello farmer friend! I am your CropHealth AI Assistant. How can I assist you with your crops (Cotton, Rice, Tomato, Soybean) today? Ask me about pest diagnosis, fungicide dosage, or weather risk management.';
  }

  // Cotton / Pink Bollworm / Whitefly
  if (q.includes('cotton') || q.includes('कपास') || q.includes('कापूस') || q.includes('bollworm') || q.includes('इल्ली') || q.includes('whitefly')) {
    if (lang === 'hi') {
      return '🌾 **कपास (Cotton) सुरक्षा सलाह:**\n1. **गुलाबी इल्ली (Pink Bollworm):** फेरोमोन ट्रैप लगाएं (5 प्रति एकड़)। अत्यधिक प्रकोप होने पर प्रोफेनोफॉस 50% EC (2 मिली/लीटर) या एमामेक्टिन बेंजोएट 5% SG (4 ग्राम/10 लीटर) का छिड़काव करें।\n2. **सफेद मक्खी (Whitefly):** नीम तेल (1500 ppm) 5 मिली/लीटर या डायफेंथियूरॉन 50% WP (1.2 ग्राम/लीटर) का स्प्रे करें।';
    }
    if (lang === 'mr') {
      return '🌾 **कापूस पीक सल्ला:**\n1. **बोंडअळी नियंत्रण:** हेक्टरी ५ कामगंध सापळे लावा. प्रादुर्भाव जास्त असल्यास प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) फवारा.\n2. **पांढरी माशी:** निंबोळी तेल ५ मिली/लिटर किंवा डायफेन्थ्यूरॉन ५०% WP फवारा.';
    }
    return '🌾 **Cotton Protection Guide:**\n1. **Pink Bollworm:** Install 5 pheromone traps per acre. For threshold crossing, spray Profenofos 50% EC (2 ml/L) or Emamectin Benzoate 5% SG (4g/10L).\n2. **Whitefly:** Spray Neem Oil (1500 ppm) at 5 ml/L or Diafenthiuron 50% WP (1.2 g/L).';
  }

  // Tomato / Blight
  if (q.includes('tomato') || q.includes('टमाटर') || q.includes('टोमॅटो') || q.includes('blight') || q.includes('झुलसा')) {
    if (lang === 'hi') {
      return '🍅 **टमाटर (Tomato) अगेती/पछेती झुलसा (Blight):**\n- **लक्षण:** पत्तियों पर भूरे-काले छल्लेदार धब्बे।\n- **उपचार:** कॉपर ऑक्सीक्लोराइड 50% WP (2.5 ग्राम/लीटर) या मैन्कोजेब 75% WP (2 ग्राम/लीटर) का छिड़काव करें। गंभीर अवस्था में एमिस्टार टॉप (1 मिली/लीटर) का स्प्रे करें।';
    }
    return '🍅 **Tomato Blight Management:**\n- **Symptoms:** Concentric dark brown rings on lower leaves.\n- **Treatment:** Spray Copper Oxychloride 50% WP (2.5 g/L) or Mancozeb 75% WP (2 g/L). For severe blight, use Azoxystrobin + Difenoconazole (1 ml/L).';
  }

  // Rice / Paddy Blast
  if (q.includes('rice') || q.includes('धान') || q.includes('चावल') || q.includes('भात') || q.includes('blast')) {
    if (lang === 'hi') {
      return '🌾 **धान (Rice) झुलसा रोग (Blast):**\n- **लक्षण:** पत्तियों पर नाव के आकार के धब्बे।\n- **उपचार:** ट्राइसाइक्लाजोल 75% WP (0.6 ग्राम/लीटर) या आइसोप्रोथियोलेन 40% EC (1.5 मिली/लीटर) का छिड़काव करें। खेत में अत्यधिक यूरिया डालने से बचें।';
    }
    return '🌾 **Rice Blast Treatment:**\n- **Symptoms:** Spindle-shaped lesions with greyish center.\n- **Treatment:** Spray Tricyclazole 75% WP (0.6 g/L) or Isoprothiolane 40% EC (1.5 ml/L). Avoid excessive nitrogen fertilizer.';
  }

  // General Farmer Guidance
  if (lang === 'hi') {
    return `🌱 **कृषि सलाह:** आपके प्रश्न "${query}" के संदर्भ में:\n- फसल की स्वस्थ बढ़वार के लिए संतुलित NPK (19:19:19) का पर्णीय छिड़काव करें।\n- खेत में नियमित नमी बनाए रखें और सुबह 10 बजे से पहले या शाम 4 बजे के बाद ही कीटनाशक का स्प्रे करें।\n- अधिक सटीक जानकारी के लिए ऊपर कैमरा आइकन 📷 से पत्ते की फोटो अपलोड करें।`;
  }
  if (lang === 'mr') {
    return `🌱 **कृषी सल्ला:** आपल्या "${query}" या प्रश्नासाठी:\n- पिकाच्या चांगल्या वाढीसाठी १९:१९:१९ विद्राव्य खताची फवारणी करा.\n- सकाळी १० च्या आधी किंवा संध्याकाळी ४ नंतरच औषध फवारा.\n- अचूक तपासणीसाठी पानाचा फोटो अपलोड करा.`;
  }
  return `🌱 **Agri Recommendation:** Regarding "${query}":\n- Apply balanced NPK water-soluble fertilizer for vegetative vigor.\n- Always spray pesticides during early morning or late afternoon with a hollow cone nozzle.\n- You can also upload a clear leaf photo via the camera icon 📷 for instant visual AI diagnosis.`;
}

async function callGeminiWithFallback(apiKey: string, payload: unknown) {
  // Only attempt if key looks like standard Google API key (starts with AIzaSy)
  if (!apiKey || !apiKey.startsWith('AIzaSy')) {
    throw new Error('Invalid Gemini API Key format (must start with AIzaSy)');
  }

  let lastError: string | null = null;
  for (const model of GEMINI_MODEL_CANDIDATES) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        continue;
      }
      const data = await response.json();
      const reply = extractGeminiReply(data);
      if (reply) return data;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Network error';
    }
  }
  throw new Error(lastError || 'All Gemini model candidates exhausted');
}

function buildGeminiRequest(messages: Message[], language: string) {
  const languageName = getLanguageName(language);
  const systemPrompt = `You are CropHealth AI, an expert agricultural scientist and crop doctor for Indian farmers. Respond warmly and concisely in ${languageName}.
Provide practical ICAR-recommended chemical doses (ml or grams per liter), biological pest controls, and disease prevention tips. Always use farmer-friendly tone.`;

  const contents = messages.map((m) => {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts: GeminiPart[] = [];
    if (m.image) {
      const match = m.image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
    }
    const text = m.content || (m.image ? 'Please analyze this crop image and identify any disease or pest problem.' : '');
    if (text) parts.push({ text });
    return { role, parts: parts.length > 0 ? parts : [{ text: 'Please help with this crop health question.' }] };
  });

  return {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };
}

export default function ChatBot() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const greeting = lang === 'hi'
      ? 'नमस्ते किसान मित्र! मैं आपका AI फसल डॉक्टर हूँ। अपनी फसल का कोई भी रोग, कीट या खाद संबंधी प्रश्न पूछें।'
      : lang === 'mr'
      ? 'नमस्कार शेतकरी मित्र! मी आपला AI पीक डॉक्टर आहे. पिकातील रोग, किडी किंवा खताविषयी काहीही विचारा.'
      : 'Hello! I am your AI crop health assistant. Tell me about any disease, pest, or crop issue you are facing, and I will recommend an ICAR treatment.';
    setWelcomeMsg(greeting);
  }, [lang]);

  useEffect(() => {
    if (open && messages.length === 0 && welcomeMsg) {
      setMessages([{ role: 'assistant', content: welcomeMsg }]);
    }
  }, [open, welcomeMsg, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !attachedImage) || loading) return;

    const userContent = text || (attachedImage ? t('chat_image_added') : '');
    const userMsg: Message = { role: 'user', content: userContent };
    if (attachedImage) userMsg.image = attachedImage;

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const directApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      let reply: string | null = null;

      // 1. If valid AI Studio key exists, call Gemini
      if (directApiKey && directApiKey.startsWith('AIzaSy')) {
        try {
          const directBody = buildGeminiRequest(newMessages, lang);
          const directData = await callGeminiWithFallback(directApiKey, directBody);
          reply = extractGeminiReply(directData);
        } catch (apiErr) {
          console.warn('Gemini direct API call notice:', apiErr);
        }
      }

      // 2. Fallback to Local Agricultural Expert Knowledge Engine
      if (!reply) {
        reply = getLocalAgriculturalAdvice(userContent, lang);
      }

      const cleanedReply = formatAssistantReply(reply);
      setMessages((prev) => [...prev, { role: 'assistant', content: cleanedReply }]);
    } catch (err) {
      console.warn('ChatBot error:', err);
      const fallback = getLocalAgriculturalAdvice(userContent, lang);
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (input.trim() || attachedImage) && !loading;

  return (
    <>
      {/* Floating Trigger Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 group border border-emerald-400/30"
          aria-label="Ask AI Crop Doctor"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-wide pr-1">
            {lang === 'hi' ? 'AI फसल डॉक्टर' : lang === 'mr' ? 'AI पीक डॉक्टर' : 'AI Crop Doctor'}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed inset-x-3 bottom-20 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 h-[500px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-gray-200/90 z-50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Leaf className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  <span>CropHealth AI Doctor</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-emerald-200 font-medium">
                  {lang === 'hi' ? 'ICAR गाइडलाइन्स अनुसार परामर्श' : 'ICAR-certified Crop Health Advisory'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-xs font-semibold shadow-2xs'
                      : 'bg-white text-gray-800 rounded-bl-xs border border-gray-200/90 shadow-2xs'
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Crop Attachment"
                      className="w-full max-h-40 object-cover rounded-xl mb-2 border border-gray-200"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs p-2 bg-white rounded-2xl border border-gray-100 w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>{lang === 'hi' ? 'AI विश्लेषण कर रहा है...' : 'Analyzing crop health...'}</span>
              </div>
            )}
          </div>

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="px-4 py-2 bg-emerald-50/80 border-t border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={attachedImage} alt="Thumb" className="w-8 h-8 rounded-lg object-cover border" />
                <span className="text-[11px] font-bold text-emerald-900">1 Image attached</span>
              </div>
              <button
                onClick={() => setAttachedImage(null)}
                className="text-gray-400 hover:text-rose-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
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
              className="p-2 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-gray-100 transition-colors"
              title="Attach Leaf Photo"
            >
              <ImagePlus className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'hi' ? 'फसल की समस्या पूछें (जैसे कपास, धान, टमाटर)...' : 'Ask about crop disease, dose, or pest...'}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-bold text-gray-900"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className={`p-2.5 rounded-xl transition-all ${
                canSend
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
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
