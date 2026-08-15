import { mockRequest } from '@/lib/api';
import { CUSTOMERS } from '../fixtures/business';
import { buildForecast } from '../fixtures/forecastEngine';

/**
 * POST /api/scenarios/run — PRD Section 6 `ScenarioRequest` / `ScenarioResponse`.
 *
 * @typedef {Object} ScenarioRequest
 * @property {{ customerId: string, days: number }} [customerDelay]
 * @property {number} [revenueShockPct]
 * @property {number} [expenseShockPct]
 * @property {string[]} [deferredObligations]
 * @property {number} [deferDays]
 * @property {number} [immediateInflow]
 *
 * @typedef {Object} ScenarioResponse
 * @property {Array<object>} before
 * @property {Array<object>} after
 * @property {number|null} daysToBreachBefore
 * @property {number|null} daysToBreachAfter
 * @property {number} projectedCashBefore
 * @property {number} projectedCashAfter
 * @property {Array<{ band: string, closing: number, daysToBreach: number|null }>} bands
 */

/**
 * @param {ScenarioRequest} scenario
 * @param {number} horizon
 * @returns {Promise<ScenarioResponse>}
 */
export function runScenario(scenario = {}, horizon = 90) {
  return mockRequest(
    () => {
      const base = buildForecast({ horizon });
      const shocked = buildForecast({ horizon, shocks: scenario });

      return {
        before: base.forecast,
        after: shocked.forecast,
        daysToBreachBefore: base.daysToBreach,
        daysToBreachAfter: shocked.daysToBreach,
        projectedCashBefore: base.projectedCashEndOfHorizon,
        projectedCashAfter: shocked.projectedCashEndOfHorizon,
        // The optimistic/expected/pessimistic comparison table (concept doc §6.5).
        bands: ['optimistic', 'expected', 'pessimistic'].map((band) => ({
          band,
          closing: shocked.forecast.at(-1)[band],
          daysToBreach: firstBreachDay(shocked.forecast, band),
        })),
      };
    },
    // Kept short: the simulator updates live as sliders move, so a realistic
    // network delay here would read as lag rather than as loading.
    { latency: 120 },
  );
}

/**
 * @param {Array<object>} forecast
 * @param {string} band
 */
function firstBreachDay(forecast, band) {
  const BUFFER = 200000;
  const index = forecast.findIndex((point, i) => i > 0 && point[band] < BUFFER);
  return index === -1 ? null : index;
}

/**
 * Preset shocks from the concept doc's §7 example table — one click applies a
 * whole named scenario.
 */
export function getScenarioPresets() {
  const largest = CUSTOMERS.find((c) => c.id === 'cust-sharma');

  return [
    {
      id: 'preset-delay',
      label: 'Largest customer pays 30 days late',
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
  ];
}

export function getCustomerOptions() {
  return CUSTOMERS.map((c) => ({ value: c.id, label: c.name }));
}
