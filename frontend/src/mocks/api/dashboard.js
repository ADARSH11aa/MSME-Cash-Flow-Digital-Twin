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

/**
 * Statutory position under the MSMED Act 2006 — what the law says is owed on
 * invoices past their 45-day statutory due date, which is a different (and
 * earlier) date than the one printed on the invoice.
 *
 * `eligibility.isSupplier` gates everything else: a medium enterprise is not
 * a "supplier" under Section 2(n) and has no claim at all, in which case
 * `totals` and `historical` come back null rather than zeroed.
 *
 * @returns {Promise<{
 *   eligibility: { isSupplier: boolean, tier: string, basis: string, graceEndsOn?: string },
 *   statutoryTermDays: number,
 *   interestRateAnnualPct: number,
 *   clockStartsFrom: string,
 *   totals: {
 *     interestOwed: number, principalPastStatutoryDue: number,
 *     invoicesPastStatutoryDue: number, invoicesWithTermBeyondCap: number,
 *     msefcEligibleCustomers: number
 *   }|null,
 *   customers: Array<object>,
 *   invoices: Array<object>,
 *   historical: {
 *     interestForfeited: number, principal: number,
 *     invoiceCount: number, limitationYears: number
 *   }|null
 * }>}
 */
export function getStatutoryExposure() {
  return request('/api/dashboard/statutory-exposure');
}

/** Cash-buffer pressure sparkline — closing balance per day (PRD 3.4.4). */
export function getBufferPressure(horizon = 30) {
  return request(`/api/dashboard/buffer-pressure?horizon=${horizon}`);
}

export { dateFromToday };
