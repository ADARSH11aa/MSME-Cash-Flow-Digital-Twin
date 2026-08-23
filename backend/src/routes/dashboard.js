/**
 * GET /api/dashboard and friends - mirrors frontend/src/mocks/api/dashboard.js's
 * exported function names and shapes exactly, so swapping the frontend's mock
 * module for a request() call is the only change needed on that side.
 *
 * upcomingObligations is intentionally returned empty: the real dataset has
 * one flat daily_expense figure, not discrete named obligations (payroll,
 * rent, a specific supplier PO) the way the frontend's fixture data does.
 * businessName is a placeholder for the same reason - see config.js.
 */
import { Router } from 'express';
import * as bridge from '../aiModelsBridge.js';
import * as forecastAdapter from '../adapters/forecastAdapter.js';
import * as riskGraphAdapter from '../adapters/riskGraphAdapter.js';
import * as customerStatsAdapter from '../adapters/customerStatsAdapter.js';
import {
  DEFAULT_OPENING_CASH, DEFAULT_DAILY_EXPENSE, DEFAULT_MIN_BUFFER,
  DEFAULT_N_SIMS, RISK_GRAPH_MAX_FOCUS_INVOICES,
} from '../config.js';

const router = Router();

const BUSINESS_NAME = 'Demo Business (AI_models/invoices.csv)';

// GET / and GET /receivables both re-run Model 1's predictions, and GET /
// additionally re-runs the Monte Carlo simulation and rebuilds the full
// risk graph (which itself calls Model 1, Model 3 and Model 5 again) - a
// multi-second round trip through Python every time, for data that only
// actually changes on a CSV upload/reload. Cached per horizon and cleared
// by invalidateCache() below, called from routes/data.js after a reload.
const CACHE_TTL_MS = 60_000;
const dashboardCache = new Map();
const receivablesCache = new Map();

export function invalidateCache() {
  dashboardCache.clear();
  receivablesCache.clear();
}

async function cached(cache, key, compute) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < CACHE_TTL_MS) return hit.value;
  const value = await compute();
  cache.set(key, { value, time: Date.now() });
  return value;
}

async function runForecast(horizon) {
  const predictions = await bridge.loadPredictions();
  const { forecast, summary } = await bridge.runForecast(
    predictions, DEFAULT_OPENING_CASH, DEFAULT_DAILY_EXPENSE, horizon, DEFAULT_N_SIMS, DEFAULT_MIN_BUFFER,
  );
  return { forecast, summary };
}

router.get('/', async (req, res) => {
  const horizon = Number(req.query.horizon ?? 30);
  try {
    const body = await cached(dashboardCache, horizon, async () => {
      const { forecast, summary } = await runForecast(horizon);
      const raw = bridge.loadRaw();
      const graph = await bridge.runRiskGraph(
        DEFAULT_OPENING_CASH, DEFAULT_DAILY_EXPENSE, horizon, DEFAULT_MIN_BUFFER, RISK_GRAPH_MAX_FOCUS_INVOICES,
      );
      return buildDashboardBody(forecast, summary, raw, graph);
    });
    res.json(body);
  } catch (e) {
    res.status(502).json({ detail: `Could not build dashboard: ${e.message}` });
  }
});

function buildDashboardBody(forecast, summary, raw, graph) {
  return {
    businessName: BUSINESS_NAME,
    currentCash: DEFAULT_OPENING_CASH,
    daysToBreach: summary.days_to_likely_breach,
    breachDate: forecastAdapter.breachDate(summary.days_to_likely_breach),
    projectedCashEndOfHorizon: forecastAdapter.projectedCashEndOfHorizon(forecast),
    topCustomerConcentrationPct: customerStatsAdapter.topCustomerConcentrationPct(raw),
    forecast: forecastAdapter.forecastPoints(forecast),
    minimumBuffer: DEFAULT_MIN_BUFFER,
    upcomingObligations: [],
    riskGraph: riskGraphAdapter.adaptRiskGraph(graph),
    // forwardInvoiceCount === 0 means every currently open invoice is
    // already past its own predicted payment window (Model 2 excludes
    // those from day-by-day simulation entirely - see
    // AI_models/simulation/monte_carlo.py's backlog split), so the
    // forecast becomes a flat, zero-variance cash burn. That's a real
    // reading of the data, not a bug - the frontend should say so
    // instead of rendering a single flat line with no explanation.
    forwardInvoiceCount: summary.forward_invoice_count,
    backlogInvoiceCount: summary.backlog_invoice_count,
    backlogInvoiceValue: summary.backlog_invoice_value,
  };
}

router.get('/payment-behaviour', (req, res) => {
  const raw = bridge.loadRaw();
  res.json(customerStatsAdapter.paymentBehaviour(raw));
});

router.get('/concentration-breakdown', (req, res) => {
  const raw = bridge.loadRaw();
  res.json(customerStatsAdapter.concentrationBreakdown(raw));
});

/**
 * DSO benchmarked by sector. Pure aggregation over closed invoices - no
 * model call - so it needs neither the cache nor an await.
 */
router.get('/dso-benchmark', (req, res) => {
  const raw = bridge.loadRaw();
  const benchmark = customerStatsAdapter.dsoBenchmark(raw);
  if (!benchmark) {
    res.status(404).json({ detail: 'No closed invoices to benchmark against yet.' });
    return;
  }
  res.json(benchmark);
});

/**
 * Real invoice-level data behind the Explainability page's "Expected
 * receivables" and "Outstanding receivables" figures - both used to be
 * fixture data (frontend/src/mocks/api/lineage.js). "Supplier payments" /
 * "Salaries" / "Recurring expenses" have no equivalent here on purpose:
 * the pipeline only ever produces one flat daily_expense number, no
 * per-category split exists to draw a real one from.
 */
router.get('/receivables', async (req, res) => {
  const horizon = Number(req.query.horizon ?? 30);
  try {
    const body = await cached(receivablesCache, horizon, async () => {
      const predictions = await bridge.loadPredictions();
      const raw = bridge.loadRaw();
      const rawById = new Map(raw.map((r) => [r.invoice_id, r]));

      const outstanding = raw
        .filter((r) => r.status !== 'closed')
        .map((r) => ({
          id: r.invoice_id,
          customer: r.customer_name,
          amount: Number(r.invoice_amount),
          dueDate: r.due_date,
        }));

      const expectedInWindow = predictions
        .map((p) => {
          const daysFromToday = p.p50_payment_days - p.days_since_issue;
          return { p, daysFromToday };
        })
        .filter(({ daysFromToday }) => daysFromToday >= 0 && daysFromToday <= horizon)
        .map(({ p, daysFromToday }) => {
          const rawRow = rawById.get(p.invoice_id);
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() + daysFromToday);
          return {
            id: p.invoice_id,
            customer: rawRow?.customer_name ?? p.invoice_id,
            amount: p.invoice_amount,
            expectedDate: expectedDate.toISOString().slice(0, 10),
          };
        });

      return {
        outstanding: {
          total: outstanding.reduce((sum, r) => sum + r.amount, 0),
          items: outstanding,
        },
        expectedInWindow: {
          total: expectedInWindow.reduce((sum, r) => sum + r.amount, 0),
          items: expectedInWindow,
        },
      };
    });
    res.json(body);
  } catch (e) {
    res.status(502).json({ detail: `Could not build receivables: ${e.message}` });
  }
});

/**
 * Current cash is a fixed demo parameter (DEFAULT_OPENING_CASH), not a
 * computed figure - the Explainability page's "Current cash" line item
 * used to fetch the full GET / pipeline (Monte Carlo simulation + risk
 * graph) just to read this one constant back out of it.
 */
router.get('/current-cash', (req, res) => {
  res.json({ currentCash: DEFAULT_OPENING_CASH });
});

router.get('/buffer-pressure', async (req, res) => {
  const horizon = Number(req.query.horizon ?? 30);
  try {
    const { forecast } = await runForecast(horizon);
    res.json(forecastAdapter.forecastPoints(forecast).map((p) => ({ date: p.date, value: p.expected })));
  } catch (e) {
    res.status(502).json({ detail: `Could not build buffer pressure: ${e.message}` });
  }
});

export default router;
