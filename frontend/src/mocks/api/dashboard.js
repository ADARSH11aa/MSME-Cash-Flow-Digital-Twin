import { request } from '@/lib/api';
import { dateFromToday } from '../fixtures/business';

/**
 * GET /api/dashboard?horizon=30 — PRD Section 6 `DashboardResponse`.
 * Backed by backend/app/routers/dashboard.py (Models 1, 2 and 8).
 *
 * @typedef {Object} DashboardResponse
 * @property {string} businessName
 * @property {number} currentCash
 * @property {number|null} daysToBreach       null = no breach inside horizon
 * @property {string|null} breachDate         ISO date
 * @property {number} projectedCashEndOfHorizon
 * @property {number} topCustomerConcentrationPct
 * @property {Array<{ date: string, optimistic: number, expected: number, pessimistic: number }>} forecast
 * @property {number} minimumBuffer
 * @property {Array<{ id: string, label: string, amount: number, dueDate: string, isAtRisk: boolean }>} upcomingObligations
 * @property {{ nodes: Array<object>, edges: Array<object> }} riskGraph
 */

/**
 * @param {number} horizon
 * @returns {Promise<DashboardResponse>}
 */
export function getDashboard(horizon = 30) {
  return request(`/api/dashboard?horizon=${horizon}`);
}

/**
 * Payment-behaviour table for the risk breakdown row (concept doc §6.2).
 * @returns {Promise<Array<object>>}
 */
export function getPaymentBehaviour() {
  return request('/api/dashboard/payment-behaviour');
}

/**
 * Receivables split by customer, for the concentration bar (PRD 3.4.4).
 * @returns {Promise<Array<object>>}
 */
export function getConcentrationBreakdown() {
  return request('/api/dashboard/concentration-breakdown');
}

/** Cash-buffer pressure sparkline — closing balance per day (PRD 3.4.4). */
export function getBufferPressure(horizon = 30) {
  return request(`/api/dashboard/buffer-pressure?horizon=${horizon}`);
}

export { dateFromToday };
