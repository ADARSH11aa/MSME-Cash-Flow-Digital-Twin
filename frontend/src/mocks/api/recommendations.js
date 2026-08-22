import { request } from '@/lib/api';

/**
 * GET /api/recommendations — PRD Section 6 `Recommendation`.
 * Backed by backend/app/routers/recommendations.py (Model 7 — see
 * backend/app/adapters/recommendations_adapter.py for the narrative-copy
 * lookup table Model 7's numeric output alone doesn't provide).
 *
 * `isRecommended` now follows Model 7's actual top-ranked result rather
 * than a hardcoded card.
 *
 * @typedef {Object} Recommendation
 * @property {string} id
 * @property {string} strategy
 * @property {'internal'|'commercial'|'invoice_finance'|'working_capital'} category
 * @property {number} illustrativeCost
 * @property {number} recoveryTimeDays
 * @property {string} liquidityImpact
 * @property {boolean} isRecommended
 * @property {string} goal
 * @property {string[]} features
 * @property {string} risk
 * @property {object} shocks   applied when the owner simulates this option
 */

/** @returns {Promise<Recommendation[]>} */
export function getRecommendations() {
  return request('/api/recommendations');
}

/**
 * No single-recommendation endpoint exists server-side — fetches the full
 * ranked list and finds by id, same cost as the list view since Model 7
 * always ranks every strategy at once.
 * @param {string} id
 * @returns {Promise<Recommendation|undefined>}
 */
export async function getRecommendation(id) {
  const recommendations = await getRecommendations();
  return recommendations.find((r) => r.id === id);
}
