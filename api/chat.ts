export const config = {
  runtime: 'edge',
};

const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-1.5-flash',
];

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, language } = await req.json();
    const apiKey = (
      process.env.VITE_GEMINI_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_API_KEY || 
      ''
    ).trim();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'CropHealth AI service key is not configured.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const languageMap: Record<string, string> = {
      en: 'English', hi: 'Hindi', mr: 'Marathi', bn: 'Bengali',
      ta: 'Tamil', te: 'Telugu', gu: 'Gujarati', pa: 'Punjabi',
    };
    const languageName = languageMap[language] || 'Hindi';

    const systemPrompt = `You are CropHealth AI (कृषि-रक्षा AI), the official Senior Agricultural Scientist and Digital Crop Doctor for the CropHealth Indian Farming Platform.
Language: Respond naturally and fluently in ${languageName} (use clean markdown formatting with bullet points and bold text).
Core Mission:
1. Always address the farmer with warmth and respect (e.g. "नमस्ते किसान भाई! 🙏" or "राम-राम किसान भाई! 🙏").
2. Provide exact ICAR and KVK recommended dosages (in ml/L or grams/L), commercial active ingredients, and biological remedies (Neem oil, Beauveria, Trichoderma).
3. Always include safe spraying guidelines (afternoon 4 PM+ or morning, wind & rain considerations) and Pre-Harvest Interval (PHI) where applicable.
4. Keep answers crisp, highly actionable, well-spaced, and easy to read on a mobile phone screen.
5. You represent the CropHealth AI platform directly—never mention third-party AI models or external search engines.`;

    const contents = (messages || []).map((m: any) => {
      const role = m.role === 'assistant' ? 'model' : 'user';
      const parts: any[] = [];
      if (m.image) {
        const match = m.image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
      }
      if (m.content) {
        parts.push({ text: m.content });
      }
      return { role, parts };
    });

    const payload = {
      contents,
      system_instruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 800,
      },
    };

    let lastError: string | null = null;
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!geminiRes.ok) {
          const errData = await geminiRes.json().catch(() => null);
          lastError = errData?.error?.message || `HTTP ${geminiRes.status}`;
          continue;
        }

        const data = await geminiRes.json();
        const candidates = data?.candidates || [];
        for (const candidate of candidates) {
          const parts = candidate?.content?.parts || [];
          const text = parts.map((p: any) => p.text).filter(Boolean).join('\n');
          if (text) {
            return new Response(JSON.stringify({ reply: text }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (err: any) {
        lastError = err?.message || 'Network error';
      }
    }

    return new Response(
      JSON.stringify({ error: lastError || 'AI Service unavailable' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Server error processing request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
