import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import https from 'node:https';

function geminiDevServerPlugin() {
  return {
    name: 'gemini-dev-server-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { messages, language } = JSON.parse(body || '{}');
              const key = (process.env.VITE_GEMINI_API_KEY || '').trim();

              const langMap: Record<string, string> = {
                en: 'English', hi: 'Hindi', mr: 'Marathi', bn: 'Bengali',
                ta: 'Tamil', te: 'Telugu', gu: 'Gujarati', pa: 'Punjabi',
              };
              const targetLang = langMap[language] || 'Hindi';

              const contents = (messages || []).map((m: any) => {
                const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
                const parts: any[] = [];
                if (m.image) {
                  const match = m.image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
                  if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
                }
                if (m.content) parts.push({ text: m.content });
                return { role, parts };
              });

              const systemPrompt = `You are CropHealth AI (कृषि-रक्षा AI), the Official Senior Agricultural Scientist & Crop Doctor for Indian farmers.
Language: Respond naturally, politely, and fluently in ${targetLang}.
Guidelines:
1. Greet the farmer warmly (e.g. "राम-राम किसान भाई! 🙏" or "नमस्ते किसान भाई!").
2. If the user asks general or conversational questions (e.g. "aur bhai kaise ho", "namaste", "kaun ho tum"), answer directly and warmly like a friendly agricultural expert.
3. For farming, crop, pest, disease, or fertilizer queries, provide exact ICAR recommended dosages (in ml/L or grams/L), water dilution ratios (200L/acre), application timing (after 4 PM), and organic remedies (Neem oil 1500ppm, Trichoderma, etc.).
4. If a leaf/plant photo is attached, visually inspect it and give precise diagnostic advice.
5. Format responses cleanly with bold headings and bullet points without raw asterisks.`;

              const payload = JSON.stringify({
                contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: 'नमस्ते' }] }],
                system_instruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.35, maxOutputTokens: 1000 }
              });

              const geminiReq = https.request({
                hostname: 'generativelanguage.googleapis.com',
                path: '/v1beta/models/gemini-flash-lite-latest:generateContent?key=' + encodeURIComponent(key),
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(payload)
                }
              }, (geminiRes) => {
                let geminiBody = '';
                geminiRes.on('data', (d) => { geminiBody += d; });
                geminiRes.on('end', () => {
                  try {
                    const data = JSON.parse(geminiBody);
                    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (replyText) {
                      res.setHeader('Content-Type', 'application/json');
                      res.statusCode = 200;
                      return res.end(JSON.stringify({ reply: replyText.trim() }));
                    } else {
                      console.warn('Gemini response notice:', geminiBody.slice(0, 150));
                      res.setHeader('Content-Type', 'application/json');
                      res.statusCode = 500;
                      return res.end(JSON.stringify({ error: 'No response generated' }));
                    }
                  } catch {
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ error: 'Parse failure' }));
                  }
                });
              });

              geminiReq.on('error', (err) => {
                console.error('Gemini dev server error:', err.message);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                return res.end(JSON.stringify({ error: err.message }));
              });

              geminiReq.write(payload);
              geminiReq.end();
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Server error' }));
            }
          });
          return;
        }

        if (req.url === '/api/diagnose' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { imageBase64, cropContext, language } = JSON.parse(body || '{}');
              const key = (process.env.VITE_GEMINI_API_KEY || '').trim();

              const langMap: Record<string, string> = {
                en: 'English', hi: 'Hindi', mr: 'Marathi', bn: 'Bengali',
                ta: 'Tamil', te: 'Telugu', gu: 'Gujarati', pa: 'Punjabi',
              };
              const targetLang = langMap[language] || 'Hindi';

              const match = imageBase64?.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
              const mimeType = match ? match[1] : 'image/jpeg';
              const base64Data = match ? match[2] : imageBase64?.replace(/^data:[^;]+;base64,/, '');

              if (!base64Data) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'No image data' }));
              }

              const promptText = `Examine this EXACT uploaded photograph visually as a Senior Agricultural Plant Pathologist and Agronomist.
Target Farmer Language: ${targetLang}
Context: ${cropContext?.cropName || 'General Crop/Fruit'} (${cropContext?.cropStage || 'Current Stage'})

CRITICAL INSTRUCTIONS:
1. Examine what is ACTUALLY in the image.
- If it is a plant, crop leaf, fruit, flower, or stem, identify the exact plant and any visible disease, pest, nutrient deficiency, or confirm if it is healthy.
- If it is NOT a plant or agricultural crop (e.g., a person, vehicle, building, electronics, or unrelated object), state clearly in disease_name: "गैर-कृषि वस्तु (Non-Agricultural Object)" and in visual_symptoms explain what is in the photo, advising the farmer to upload a clear leaf/plant photo.
2. Output MUST be a single valid JSON object with these exact keys (no markdown formatting, no backticks, pure JSON):
{
  "plant_name": "Identified Plant/Fruit in English & ${targetLang}",
  "disease_name": "Name of diagnosed issue or 'स्वस्थ फसल / Healthy Crop'",
  "scientific_name": "Scientific pathogen/pest name or 'N/A'",
  "category": "fungal",
  "confidence": 95,
  "is_healthy": false,
  "visual_symptoms": "Detailed visual description in ${targetLang} of the exact spots, lesions, discoloration or features seen in this specific photo",
  "ai_review": "Detailed agronomist explanation in ${targetLang} explaining the diagnosis and immediate action",
  "chemical_treatment": "ICAR/CIBRC approved chemical with active ingredient & concentration (e.g. Mancozeb 75% WP @ 2.5 g/L)",
  "chemical_dosage_instructions": "Dilution & application instructions in ${targetLang}",
  "biological_treatment": "Organic/biocontrol remedy (e.g. Neem Oil 1500ppm @ 3 ml/L or Trichoderma @ 5 g/L)",
  "biological_instructions": "Organic application instructions in ${targetLang}",
  "spray_timing_advice": "Safe spray timing & PHI advice in ${targetLang}"
}`;

              const payload = JSON.stringify({
                contents: [{
                  role: 'user',
                  parts: [
                    { inline_data: { mime_type: mimeType, data: base64Data } },
                    { text: promptText }
                  ]
                }],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 1200,
                  response_mime_type: 'application/json'
                }
              });

              const geminiReq = https.request({
                hostname: 'generativelanguage.googleapis.com',
                path: '/v1beta/models/gemini-flash-lite-latest:generateContent?key=' + encodeURIComponent(key),
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(payload)
                }
              }, (geminiRes) => {
                let geminiBody = '';
                geminiRes.on('data', (d) => { geminiBody += d; });
                geminiRes.on('end', () => {
                  try {
                    const data = JSON.parse(geminiBody);
                    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (replyText) {
                      const parsed = JSON.parse(replyText);
                      res.setHeader('Content-Type', 'application/json');
                      res.statusCode = 200;
                      return res.end(JSON.stringify(parsed));
                    } else {
                      res.setHeader('Content-Type', 'application/json');
                      res.statusCode = 500;
                      return res.end(JSON.stringify({ error: 'No analysis returned from Gemini' }));
                    }
                  } catch (parseErr) {
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ error: 'Failed to parse Gemini JSON' }));
                  }
                });
              });

              geminiReq.on('error', (err) => {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                return res.end(JSON.stringify({ error: err.message }));
              });

              geminiReq.write(payload);
              geminiReq.end();
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Server error' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.VITE_GEMINI_API_KEY) {
    process.env.VITE_GEMINI_API_KEY = env.VITE_GEMINI_API_KEY;
  }

  return {
    plugins: [react(), geminiDevServerPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 5173,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
