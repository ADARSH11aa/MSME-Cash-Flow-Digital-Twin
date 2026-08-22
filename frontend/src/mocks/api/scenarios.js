import { request } from '@/lib/api';

/**
 * POST /api/scenarios/run — PRD Section 6 `ScenarioRequest` / `ScenarioResponse`.
 * Backed by backend/app/routers/scenarios.py (Model 2 with shocks layered on top —
 * see backend/app/adapters/scenario_shocks.py for which shock fields are and
 * aren't actually supported by the real pipeline; deferredObligations/deferDays
 * are accepted but currently no-ops, reported back via `unhandledShocks`).
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
 * @property {string[]} unhandledShocks
 */

/**
 * @param {ScenarioRequest} scenario
 * @param {number} horizon
 * @returns {Promise<ScenarioResponse>}
 */
export function runScenario(scenario = {}, horizon = 90) {
  return request(`/api/scenarios/run?horizon=${horizon}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario),
  });
}

/**
 * Preset shocks from the concept doc's §7 example table — one click applies a
 * whole named scenario.
 */
export function getScenarioPresets() {
  return request('/api/scenarios/presets');
}

export function getCustomerOptions() {
  return request('/api/scenarios/customers');
}
