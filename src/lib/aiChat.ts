import { Config } from '../config';
import type { Language } from '../i18n';

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

const TIMEOUT_MS = 25000;

/** Sends the recent conversation to the GuardAurora /api/chat proxy; throws on any failure so callers can fall back. */
export async function fetchAiReply(history: ChatTurn[], language: Language): Promise<string> {
  if (!Config.chatApiUrl) throw new Error('chat_api_not_configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(Config.chatApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, messages: history.slice(-12) }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || typeof data?.reply !== 'string' || !data.reply.trim()) {
      throw new Error(data?.error || `http_${response.status}`);
    }
    return data.reply.trim();
  } finally {
    clearTimeout(timer);
  }
}
