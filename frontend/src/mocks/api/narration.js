import { request } from '@/lib/api';

/**
 * Model 6 — plain-language narration of a single invoice's prediction.
 *
 * Fully real: there is no mock behind this one. It reaches the backend
 * gateway, which reaches AI_models, which chains Model 5's SHAP output into
 * an LLM. Nothing here is fixture data.
 *
 * Narration is optional infrastructure — it needs a GROQ_API_KEY that other
 * models don't — so callers should treat "unavailable" as a normal state and
 * hide the panel, not as an error worth showing.
 *
 * @typedef {Object} NarrationResponse
 * @property {string} invoice_id
 * @property {'low'|'normal'} confidence
 * @property {string} text
 * @property {'llm'|'fallback'} source  which produced `text` — see below
 * @property {string} language
 */

/**
 * `source` matters and should stay visible in the UI: "fallback" means the
 * LLM was unreachable, too slow, or returned a number it wasn't given, and
 * the text came from a deterministic template instead. Presenting that as
 * model-generated prose would misrepresent what the system just did.
 *
 * @param {string} invoiceId
 * @param {string} [language] ISO-ish code from getNarrationLanguages()
 * @returns {Promise<NarrationResponse>}
 */
export function getInvoiceNarration(invoiceId, language = 'en') {
  return request(
    `/api/narration/${encodeURIComponent(invoiceId)}?language=${encodeURIComponent(language)}`,
  );
}

/**
 * @returns {Promise<{ available: boolean, default: string, languages: Record<string,string> }>}
 */
export function getNarrationLanguages() {
  return request('/api/narration/languages');
}
