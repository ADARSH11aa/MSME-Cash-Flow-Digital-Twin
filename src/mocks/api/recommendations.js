import { mockRequest } from '@/lib/api';

/**
 * GET /api/recommendations — PRD Section 6 `Recommendation`.
 *
 * Ordered by the concept doc's §9 priority: internal and commercial actions
 * first, then invoice finance, then a working-capital facility. The
 * `isRecommended` flag drives the elevated card, and it is deliberately given
 * to a zero-cost non-debt action rather than to the fastest option.
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

/** @type {Recommendation[]} */
const RECOMMENDATIONS = [
  {
    id: 'rec-supplier',
    strategy: 'Supplier payment extension',
    category: 'commercial',
    illustrativeCost: 0,
    recoveryTimeDays: 3,
    liquidityImpact: 'Frees ₹1.86L across the breach window',
    isRecommended: true,
    goal: 'Ask your timber supplier for 21 extra days on PO-8842.',
    features: [
      'No financing cost at all',
      'Uses a supplier relationship you already have',
      'Reversible — nothing is committed',
    ],
    risk: 'Low — depends on supplier goodwill',
    shocks: { deferredObligations: ['po-8842'], deferDays: 21 },
  },
  {
    id: 'rec-discount',
    strategy: 'Early-payment discount',
    category: 'internal',
    illustrativeCost: 12500,
    recoveryTimeDays: 6,
    liquidityImpact: 'Pulls ₹4.18L forward by roughly 18 days',
    isRecommended: false,
    goal: 'Offer Sharma Traders 3% to settle INV-2291 immediately.',
    features: ['No debt taken on', 'You keep control of the offer', 'Can be withdrawn any time'],
    risk: 'Low — cost is capped and known upfront',
    shocks: { immediateInflow: 405000 },
  },
  {
    id: 'rec-invoice-finance',
    strategy: 'Invoice financing',
    category: 'invoice_finance',
    illustrativeCost: 38500,
    recoveryTimeDays: 7,
    liquidityImpact: 'Advances 80% of ₹6.82L in outstanding invoices',
    isRecommended: false,
    goal: 'Convert approved invoices into cash before they are due.',
    features: [
      'Requires lender data-sharing consent',
      'Cost rises the longer the customer takes',
      'Does not fix the underlying delay',
    ],
    risk: 'Medium — cost scales with customer behaviour',
    shocks: { immediateInflow: 545000 },
  },
  {
    id: 'rec-working-capital',
    strategy: 'Working-capital facility',
    category: 'working_capital',
    illustrativeCost: 64000,
    recoveryTimeDays: 14,
    liquidityImpact: 'Provides a ₹5L revolving buffer',
    isRecommended: false,
    goal: 'Open a standing facility to absorb future timing gaps.',
    features: [
      'Slowest to arrange of the four',
      'Ongoing interest whether drawn or not',
      'Requires lender data-sharing consent',
    ],
    risk: 'Higher — adds a recurring obligation',
    shocks: { immediateInflow: 500000 },
  },
];

/** @returns {Promise<Recommendation[]>} */
export function getRecommendations() {
  return mockRequest(() => RECOMMENDATIONS);
}

/** @param {string} id */
export function getRecommendation(id) {
  return RECOMMENDATIONS.find((r) => r.id === id);
}
