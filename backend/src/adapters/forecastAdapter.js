/**
 * Reshapes Model 2's statistical quantile output into the frontend's
 * behavioral-scenario shape.
 *
 * Model 2 (AI_models/simulation/monte_carlo.py) returns p10/p50/p90 - Monte
 * Carlo percentiles across thousands of simulated draws. The frontend
 * (frontend/src/mocks/api/dashboard.js, scenarios.js) expects
 * optimistic/expected/pessimistic - named scenarios, not quantiles.
 *
 * p90 (high percentile = more cash) is mapped to "optimistic" and p10 to
 * "pessimistic" because more cash is the better outcome here - this is an
 * approximation the team should sign off on, not a proven equivalence.
 */
import { roundHalfEven } from '../lib/round.js';

function isoDatePlusDays(today, days) {
  const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** forecastRows: Model 2's per-day rows ({day, cash_p10, cash_p50, cash_p90, prob_breach}).
 * Returns frontend's Array<{date, optimistic, expected, pessimistic}>. */
export function forecastPoints(forecastRows, today = new Date()) {
  return forecastRows.map((row) => ({
    date: isoDatePlusDays(today, Math.trunc(row.day)),
    optimistic: roundHalfEven(row.cash_p90, 2),
    expected: roundHalfEven(row.cash_p50, 2),
    pessimistic: roundHalfEven(row.cash_p10, 2),
  }));
}

export function breachDate(daysToBreach, today = new Date()) {
  if (daysToBreach == null) return null;
  return isoDatePlusDays(today, Math.trunc(daysToBreach));
}

export function projectedCashEndOfHorizon(forecastRows) {
  return roundHalfEven(forecastRows[forecastRows.length - 1].cash_p50, 2);
}
