/** GET /api/recommendations - mirrors frontend/src/mocks/api/recommendations.js. */
import { Router } from 'express';
import * as bridge from '../aiModelsBridge.js';
import { adaptRecommendations, statutoryRecommendation } from '../adapters/recommendationsAdapter.js';
import { statutoryExposure } from '../adapters/msmedAdapter.js';
import { DEFAULT_OPENING_CASH, DEFAULT_DAILY_EXPENSE, DEFAULT_MIN_BUFFER, DEFAULT_N_SIMS } from '../config.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const predictions = await bridge.loadPredictions();
    const { summary } = await bridge.runForecast(
      predictions, DEFAULT_OPENING_CASH, DEFAULT_DAILY_EXPENSE, 90, DEFAULT_N_SIMS, DEFAULT_MIN_BUFFER,
    );
    const overdueInvoiceValue = summary.backlog_invoice_value;
    const ranked = await bridge.runRecommendations(overdueInvoiceValue);
    const options = adaptRecommendations(ranked, overdueInvoiceValue);

    // Prepended rather than ranked in: at zero cost it is unambiguously the
    // cheapest option on the page, and this screen orders by cost.
    const statutory = statutoryRecommendation(statutoryExposure(bridge.loadRaw()));
    res.json(statutory ? [statutory, ...options] : options);
  } catch (e) {
    res.status(502).json({ detail: `Could not build recommendations: ${e.message}` });
  }
});

export default router;
