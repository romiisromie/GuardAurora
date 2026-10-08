// Vercel serverless function: proxies GuardAurora help-chat messages to Groq (OpenAI-compatible API).
// The API key lives only in the Vercel environment (GROQ_API_KEY); conversations are not stored.

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 1000;
const RATE_LIMIT_PER_MINUTE = 8;
const UPSTREAM_TIMEOUT_MS = 20000;

const LANGUAGE_NAMES = { ru: 'Russian', kk: 'Kazakh', en: 'English' };

function systemPrompt(language) {
  const reply = LANGUAGE_NAMES[language] || 'the language the user writes in';
  return `You are the help assistant inside GuardAurora, a personal-safety mobile app. Reply in ${reply} unless the user clearly writes in another language.

Priorities:
1. If the user may be in immediate danger (threat, being followed, violence, medical emergency, fire), the FIRST line must tell them to call emergency services now: in Kazakhstan 112 (police 102, ambulance 103, fire 101); elsewhere their local emergency number. Then give 2-4 short, concrete steps (move to a busy lit place, go to a shop/pharmacy/cafe, call a trusted person, keep the phone charged).
2. Otherwise give calm, practical, specific advice for their situation. Ask one short clarifying question if the situation is unclear.
3. Keep answers short: at most about 120 words, plain text, short lines or a numbered list. No markdown headings.

What the app can and cannot do (never claim more):
- The SOS button starts a 3-second countdown and records an event in the on-device log. It does NOT call emergency services and does NOT message anyone automatically.
- With monitoring on and the app open, three quick shakes record a silent SOS event the same way.
- Trusted contacts are stored on the device; the user can call them or open a prepared SMS (with a map link if location is available) and must send it themselves.
- The Map tab shows the phone's coordinates on request and can open them in a maps app. There is no database of safe places and no route rating.

Rules:
- You are not a doctor, lawyer or the police; for medical or legal matters give general first steps and point to professionals.
- Never ask for or repeat full names, home addresses, phone numbers or other identifying details.
- Do not give advice that helps someone harm, stalk or track another person.
- If the user expresses thoughts of self-harm, respond with care and urge them to contact emergency services (112 in Kazakhstan) or someone they trust right now.`;
}

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT_PER_MINUTE;
}

function parseMessages(body) {
  if (!body || !Array.isArray(body.messages)) return null;
  const messages = body.messages.slice(-MAX_MESSAGES).map(m => ({
    role: m && m.role === 'assistant' ? 'assistant' : 'user',
    text: typeof m?.text === 'string' ? m.text.trim().slice(0, MAX_MESSAGE_CHARS) : '',
  })).filter(m => m.text);
  // The conversation must start with a user turn and end with one.
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') return null;
  return messages;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'not_configured' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ error: 'rate_limited' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const messages = parseMessages(body);
  if (!messages) return res.status(400).json({ error: 'bad_request' });
  const language = ['ru', 'kk', 'en'].includes(body.language) ? body.language : 'ru';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt(language) },
          ...messages.map(m => ({ role: m.role, content: m.text })),
        ],
        max_tokens: 700,
        temperature: 0.4,
      }),
    });
    if (upstream.status === 429) return res.status(429).json({ error: 'rate_limited' });
    if (!upstream.ok) {
      console.error('groq error', upstream.status, (await upstream.text()).slice(0, 300));
      return res.status(502).json({ error: 'upstream_error' });
    }
    const data = await upstream.json();
    const reply = String(data?.choices?.[0]?.message?.content || '').trim();
    if (!reply) return res.status(502).json({ error: 'empty_reply' });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('groq request failed', error?.name || error);
    return res.status(504).json({ error: 'upstream_unavailable' });
  } finally {
    clearTimeout(timer);
  }
}
