import { mockRequest } from '@/lib/api';
import {
  BUSINESS,
  CUSTOMERS,
  dateFromToday,
  outstandingInvoices,
  topCustomerConcentration,
} from '../fixtures/business';
import { buildForecast, upcomingObligations } from '../fixtures/forecastEngine';

/**
 * GET /api/dashboard?horizon=30 — PRD Section 6 `DashboardResponse`.
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
  return mockRequest(() => {
    const { forecast, daysToBreach, breachDate, projectedCashEndOfHorizon } = buildForecast({
      horizon,
    });
    const concentration = topCustomerConcentration();

    return {
      businessName: BUSINESS.name,
      currentCash: BUSINESS.currentCash,
      daysToBreach,
      breachDate,
      projectedCashEndOfHorizon,
      topCustomerConcentrationPct: Number(concentration.pct.toFixed(1)),
      forecast,
      minimumBuffer: BUSINESS.minimumBuffer,
      upcomingObligations: upcomingObligations(horizon).slice(0, 6),
      riskGraph: buildRiskGraph(),
    };
  });
}

/**
 * The causal chain behind the projected breach (concept doc §8): customer →
 * payment delay → late cash → buffer breach, with the fixed obligations that
 * make the gap unavoidable feeding into the same outcome node.
 */
function buildRiskGraph() {
  const { customer, pct } = topCustomerConcentration();

  return {
    nodes: [
      {
        id: 'customer',
        label: `${customer.name} — ${pct.toFixed(0)}% of receivables`,
        type: 'customer',
        severity: 'high',
      },
      {
        id: 'delay',
        label: `Pays ~${customer.typicalDelayDays} days beyond ${customer.contractualTermDays}-day terms`,
        type: 'event',
        severity: 'high',
      },
      { id: 'late-cash', label: '₹6.8L of inflow arrives late', type: 'event', severity: 'medium' },
      { id: 'salary', label: 'Salaries due — cannot be delayed', type: 'event', severity: 'medium' },
      { id: 'supplier', label: 'Timber supplier PO-8842 falls due', type: 'event', severity: 'medium' },
      { id: 'breach', label: 'Cash falls below operating buffer', type: 'outcome', severity: 'high' },
    ],
    edges: [
      { from: 'customer', to: 'delay' },
      { from: 'delay', to: 'late-cash', label: 'delays' },
      { from: 'late-cash', to: 'breach' },
      { from: 'salary', to: 'breach' },
      { from: 'supplier', to: 'breach' },
    ],
  };
}

/**
 * Payment-behaviour table for the risk breakdown row (concept doc §6.2).
 * @returns {Promise<Array<object>>}
 */
export function getPaymentBehaviour() {
  return mockRequest(() =>
    CUSTOMERS.map((c) => ({
      id: c.id,
      name: c.name,
      contractualTerm: `${c.contractualTermDays} days`,
      typicalRange: `${c.contractualTermDays + c.typicalDelayDays}–${c.contractualTermDays + c.worstDelayDays} days`,
      interpretation: c.interpretation,
      // Anything drifting more than three weeks past terms is the behaviour
      // that actually breaks a forecast.
      severity: c.typicalDelayDays > 20 ? 'high' : c.typicalDelayDays > 8 ? 'medium' : 'low',
    })),
  );
}

/**
 * Receivables split by customer, for the concentration bar (PRD 3.4.4).
 * @returns {Promise<Array<object>>}
 */
export function getConcentrationBreakdown() {
  return mockRequest(() => {
    const outstanding = outstandingInvoices();
    const total = outstanding.reduce((sum, i) => sum + i.amount, 0);

    return CUSTOMERS.map((customer) => {
      const amount = outstanding
        .filter((i) => i.customerId === customer.id)
        .reduce((sum, i) => sum + i.amount, 0);
      return { id: customer.id, name: customer.name, amount, pct: total ? (amount / total) * 100 : 0 };
    })
      .filter((row) => row.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  });
}

/** Cash-buffer pressure sparkline — closing balance per day (PRD 3.4.4). */
export function getBufferPressure(horizon = 30) {
  return mockRequest(() =>
    buildForecast({ horizon }).forecast.map((p) => ({ date: p.date, value: p.expected })),
  );
}

export { dateFromToday };
