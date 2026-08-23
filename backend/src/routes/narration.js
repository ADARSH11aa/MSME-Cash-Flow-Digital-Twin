/**
 * Model 6 - plain-language narration of a single invoice's prediction.
 *
 * Deliberately per-invoice and on demand. Every other route here is pure
 * local computation over Model 1/2/7/8 output, but this one reaches an
 * external LLM API (Groq) on each call, so it is never folded into the
 * dashboard payload or run across the whole invoice list.
 *
 * Narration is optional: if AI_models has no GROQ_API_KEY configured, the
 * upstream returns 503 and this route passes that through rather than
 * failing the page - the UI is expected to hide the panel, not error.
 */
import { Router } from 'express';
import * as bridge from '../aiModelsBridge.js';

const router = Router();

// Narrating the same invoice in the same language twice is a wasted external
// API call - the underlying SHAP explanation only changes when invoices.csv
// does, and a CSV upload restarts this process anyway.
const narrationCache = new Map();

router.get('/languages', async (req, res) => {
  try {
    res.json(await bridge.narrateLanguages());
  } catch (e) {
    // Not a 502: an unreachable narration service means "this feature is
    // off", which the UI handles, not "the request failed".
    res.json({ available: false, default: 'en', languages: {}, detail: e.message });
  }
});

router.get('/:invoiceId', async (req, res) => {
  const { invoiceId } = req.params;
  const language = req.query.language ?? 'en';
  const key = `${invoiceId}:${language}`;

  if (narrationCache.has(key)) {
    res.json(narrationCache.get(key));
    return;
  }

  try {
    const result = await bridge.narrateInvoice(invoiceId, language);
    narrationCache.set(key, result);
    res.json(result);
  } catch (e) {
    res.status(502).json({ detail: `Could not narrate ${invoiceId}: ${e.message}` });
  }
});

export function invalidateNarrationCache() {
  narrationCache.clear();
}

export default router;
