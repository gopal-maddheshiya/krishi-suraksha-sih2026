import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ImagePlus, XCircle, Sparkles } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

type Message = { role: 'user' | 'assistant'; content: string; image?: string };

type GeminiPart = { text?: string; inline_data?: { mime_type: string; data: string } };

const GEMINI_MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];

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

async function callGeminiWithFallback(apiKey: string, payload: unknown) {
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
      const text = await response.text();
      if (!response.ok) {
        lastError = text.slice(0, 240);
        continue;
      }
      return JSON.parse(text);
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown Gemini error';
    }
  }
  throw new Error(lastError || 'Gemini request failed');
}

function buildGeminiRequest(messages: Message[], language: string) {
  const languageName = getLanguageName(language);
  const systemPrompt = `You are an AI crop health assistant for Indian farmers. Respond only in ${languageName}.

Your role is to identify crop diseases, pests, nutrient deficiencies, recommend practical treatments, and give safe usage guidance. Use simple, concise, farmer-friendly language. If the image or description is unclear, ask for the crop type, growth stage, symptoms, and weather conditions. Include treatment timing, dosage where relevant, and safety precautions. Keep every answer in ${languageName} only.`;

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
    setWelcomeMsg(t('chat_welcome'));
  }, [lang, t]);

  useEffect(() => {
    if (open && messages.length === 0) {
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
      let reply = t('chat_error');

      if (directApiKey) {
        const directBody = buildGeminiRequest(newMessages, lang);
        const directData = await callGeminiWithFallback(directApiKey, directBody);
        reply = extractGeminiReply(directData) || t('chat_error');
      } else {
        const apiMessages = newMessages.map((m) => {
          if (m.image) {
            return {
              role: m.role,
              content: [
                { type: 'input_text', text: m.content || 'Please analyze this crop image and identify any disease or pest problem.' },
                { type: 'input_image', image_url: m.image },
              ],
            };
          }
          return { role: m.role, content: m.content };
        });

        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ language: lang, messages: apiMessages }),
        });

        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        reply = data.reply || t('chat_error');
      }

      const cleanedReply = formatAssistantReply(reply);
      setMessages((prev) => [...prev, { role: 'assistant', content: cleanedReply }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : t('chat_error');
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
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
      <button
        onClick={() => setOpen(!open)}
        aria-label={t('chat_open')}
        className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 ${
          open
            ? 'bg-gray-700 rotate-90 scale-90'
            : 'bg-gradient-to-br from-teal-500 to-emerald-600 hover:shadow-2xl hover:scale-105 animate-pulse-slow'
        }`}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {open && (
        <div className="fixed bottom-36 right-3 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[24rem] md:w-[28rem] h-[70vh] max-h-[600px] bg-white rounded-3xl shadow-2xl ring-1 ring-gray-200/60 flex flex-col overflow-hidden animate-slide-up">
          <div className="relative bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ring-1 ring-white/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm truncate">{t('chat_title')}</h3>
              <p className="text-[11px] text-white/80 truncate">{t('chat_subtitle')}</p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-[10px] text-white font-semibold">Online</span>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50 to-white scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.image && (
                  <div className="mb-1.5 max-w-[80%] rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
                    <img src={msg.image} alt="upload" className="w-full max-h-40 object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-6 whitespace-pre-wrap break-words shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md ring-1 ring-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white ring-1 ring-gray-100 rounded-2xl rounded-bl-md shadow-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                  <span className="text-xs text-gray-500">{t('chat_thinking')}</span>
                </div>
              </div>
            )}
          </div>

          {attachedImage && (
            <div className="px-4 pt-3 pb-1 bg-white border-t border-gray-100">
              <div className="relative inline-block">
                <img src={attachedImage} alt="preview" className="w-16 h-16 rounded-xl object-cover ring-1 ring-gray-200" />
                <button
                  onClick={() => setAttachedImage(null)}
                  aria-label={t('chat_remove_image')}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-md"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="px-3 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-label={t('chat_attach')}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all flex-shrink-0"
              >
                <ImagePlus className="w-4 h-4" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat_placeholder')}
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300 max-h-28 transition-all"
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={handleSend}
                disabled={!canSend}
                aria-label={t('chat_send')}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
