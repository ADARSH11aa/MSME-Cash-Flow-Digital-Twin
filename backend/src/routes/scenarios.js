/**
 * POST /api/scenarios/run and friends - mirrors frontend/src/mocks/api/scenarios.js.
 * See adapters/scenarioShocks.js for what shock fields are and aren't
 * actually supported by the real pipeline.
 */
import { Router } from 'express';
import * as bridge from '../aiModelsBridge.js';
import * as forecastAdapter from '../adapters/forecastAdapter.js';
import { applyShocks } from '../adapters/scenarioShocks.js';
import * as customerStatsAdapter from '../adapters/customerStatsAdapter.js';
import { DEFAULT_OPENING_CASH, DEFAULT_DAILY_EXPENSE, DEFAULT_MIN_BUFFER, DEFAULT_N_SIMS } from '../config.js';

const router = Router();

function firstBreachDay(points, band) {
  for (let i = 0; i < points.length; i += 1) {
    if (i > 0 && points[i][band] < DEFAULT_MIN_BUFFER) return i;
  }
  return null;
}

/** Only the fields the frontend's ScenarioRequest defines are read; anything
 * else in the body is ignored, mirroring pydantic's model shape. */
function pickScenarioFields(body = {}) {
  const scenario = {};
  if (body.customerDelay != null) scenario.customerDelay = body.customerDelay;
  if (body.revenueShockPct != null) scenario.revenueShockPct = body.revenueShockPct;
  if (body.expenseShockPct != null) scenario.expenseShockPct = body.expenseShockPct;
  if (body.deferredObligations != null) scenario.deferredObligations = body.deferredObligations;
  if (body.deferDays != null) scenario.deferDays = body.deferDays;
  if (body.immediateInflow != null) scenario.immediateInflow = body.immediateInflow;
  if (body.statutoryClaim != null) scenario.statutoryClaim = body.statutoryClaim;
  return scenario;
}

router.post('/run', async (req, res) => {
  const horizon = Number(req.query.horizon ?? 90);
  const scenario = pickScenarioFields(req.body);

  let basePoints;
  let afterPoints;
  let baseSummary;
  let shockedSummary;
  let baseForecast;
  let shockedForecast;
  let unhandled;
  try {
    const predictions = await bridge.loadPredictions();
    const raw = bridge.loadRaw();

    ({ forecast: baseForecast, summary: baseSummary } = await bridge.runForecast(
      predictions, DEFAULT_OPENING_CASH, DEFAULT_DAILY_EXPENSE, horizon, DEFAULT_N_SIMS, DEFAULT_MIN_BUFFER,
    ));

    const shockResult = applyShocks(predictions, raw, DEFAULT_OPENING_CASH, DEFAULT_DAILY_EXPENSE, scenario);
    unhandled = shockResult.unhandled;

    ({ forecast: shockedForecast, summary: shockedSummary } = await bridge.runForecast(
      shockResult.shocked, shockResult.openingCash, shockResult.dailyExpense, horizon, DEFAULT_N_SIMS, DEFAULT_MIN_BUFFER,
    ));
  } catch (e) {
    res.status(502).json({ detail: `Could not run scenario: ${e.message}` });
    return;
  }

  basePoints = forecastAdapter.forecastPoints(baseForecast);
  afterPoints = forecastAdapter.forecastPoints(shockedForecast);

  res.json({
    before: basePoints,
    after: afterPoints,
    daysToBreachBefore: baseSummary.days_to_likely_breach,
    daysToBreachAfter: shockedSummary.days_to_likely_breach,
    projectedCashBefore: forecastAdapter.projectedCashEndOfHorizon(baseForecast),
    projectedCashAfter: forecastAdapter.projectedCashEndOfHorizon(shockedForecast),
    // The buffer the breach figures above were actually measured against.
    // Without it the chart drew its threshold line from a demo fixture while
    // these numbers came from here - two different buffers on one screen.
    minimumBuffer: DEFAULT_MIN_BUFFER,
    bands: ['optimistic', 'expected', 'pessimistic'].map((band) => ({
      band,
      closing: afterPoints[afterPoints.length - 1][band],
      daysToBreach: firstBreachDay(afterPoints, band),
    })),
    unhandledShocks: unhandled,
  });
});

router.get('/presets', (req, res) => {
  const raw = bridge.loadRaw();
  const largest = customerStatsAdapter.concentrationBreakdown(raw)[0];

  res.json([
    {
      id: 'preset-delay',
      label: `Largest customer (${largest.name}) pays 30 days late`,
      shocks: { customerDelay: { customerId: largest.id, days: 30 } },
    },
    { id: 'preset-revenue', label: 'Sales fall 20%', shocks: { revenueShockPct: -20 } },
    { id: 'preset-expense', label: 'Supplier prices rise 15%', shocks: { expenseShockPct: 15 } },
    {
      id: 'preset-combined',
      label: 'Combined shock',
      shocks: {
        customerDelay: { customerId: largest.id, days: 30 },
        revenueShockPct: -20,
        expenseShockPct: 15,
      },
    },
  ]);
});

router.get('/customers', (req, res) => {
  const raw = bridge.loadRaw();
  res.json(customerStatsAdapter.concentrationBreakdown(raw).map((row) => ({ value: row.id, label: row.name })));
});

export default router;
