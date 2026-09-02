import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  pa: "Punjabi",
};

function buildSystemPrompt(language: string): string {
  const languageName = LANGUAGE_NAMES[language] || "English";
  return `You are an AI crop health assistant for Indian farmers. Respond only in ${languageName}.

Your role is to:
1. Identify crop diseases, pests, and nutrient deficiencies from descriptions or images.
2. Recommend practical organic and chemical treatments.
3. Suggest preventive measures and integrated pest management practices.
4. Provide pesticide and fertilizer dosage guidance when asked.
5. Explain safe pesticide usage and pre-harvest intervals.

When analyzing an uploaded crop image, explain the visible symptoms, likely diagnosis, confidence, and treatment plan. If the image or description is not enough, ask about crop type, growth stage, symptoms, and recent weather.

Use simple, concise language. For chemicals, include the active ingredient, dose per acre or liter, application timing, pre-harvest interval, and safety precautions. Never claim certainty when the image is unclear.`;
}

async function getGeminiApiKey(): Promise<string | null> {
  const directKey = Deno.env.get("GEMINI_API_KEY");
  if (directKey && directKey.trim()) {
    return directKey.trim();
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "gemini_api_key")
      .maybeSingle();

    if (error && error.code !== "42P01") {
      console.error("Gemini app_settings lookup failed:", error);
      return null;
    }

    if (!data?.value) return null;
    return String(data.value).trim();
  } catch (error) {
    console.error("Gemini config lookup crashed:", error);
    return null;
  }
}

function toGeminiContent(message: { role: string; content: unknown }) {
  const role = message.role === "assistant" ? "model" : "user";
  if (typeof message.content === "string") {
    return { role, parts: [{ text: message.content }] };
  }

  if (!Array.isArray(message.content)) {
    return { role, parts: [{ text: "Please help with this crop health question." }] };
  }

  const parts = message.content.flatMap((part: Record<string, unknown>) => {
    if (part.type === "input_text" && typeof part.text === "string") {
      return [{ text: part.text }];
    }

    if (part.type === "input_image" && typeof part.image_url === "string") {
      const match = part.image_url.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return [];
      return [{ inline_data: { mime_type: match[1], data: match[2] } }];
    }

    return [];
  });

  return {
    role,
    parts: parts.length > 0 ? parts : [{ text: "Please analyze this crop health request." }],
  };
}

const GEMINI_MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };

function extractGeminiReply(data: unknown): string | null {
  const candidates = (data as GeminiResponse)?.candidates ?? [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts ?? [];
    const textChunks = parts
      .filter((part) => typeof part?.text === "string")
      .map((part) => part.text as string)
      .filter(Boolean);

    if (textChunks.length > 0) {
      return textChunks.join("\n");
    }
  }

  return null;
}

async function callGeminiWithFallback(apiKey: string, payload: unknown) {
  let lastError: string | null = null;

  for (const model of GEMINI_MODEL_CANDIDATES) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      if (!response.ok) {
        lastError = text.slice(0, 240);
        continue;
      }

      return JSON.parse(text);
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Gemini request failed";
    }
  }

  throw new Error(lastError || "Gemini request failed");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, language } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini is not configured yet." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contents = messages
      .filter((message: { role?: string; content?: unknown }) => message.role === "user" || message.role === "assistant")
      .map(toGeminiContent);

    const payload = {
      systemInstruction: { parts: [{ text: buildSystemPrompt(language || "en") }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    let data;
    try {
      data = await callGeminiWithFallback(apiKey, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gemini request failed";
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${message.slice(0, 240)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reply = extractGeminiReply(data);
    if (typeof reply !== "string" || !reply.trim()) {
      return new Response(
        JSON.stringify({ error: "Gemini returned an empty response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
