import { mockRequest, request } from '@/lib/api';
import {
  INVOICES,
  RECURRING_EXPENSES,
  SUPPLIER_OBLIGATIONS,
  dateFromToday,
  getCustomer,
} from '../fixtures/business';

/**
 * GET /api/lineage/:figureId — PRD Section 6 `LineageResponse`.
 *
 * Every inspectable figure in the product resolves to one of these. The
 * `figureId` strings used by <Figure /> call sites are the keys below, so a
 * missing lineage is a build-time-visible mistake rather than a silent
 * un-clickable number.
 *
 * Current cash, expected receivables, and outstanding receivables are real —
 * pulled from the live backend (GET /api/dashboard, /api/dashboard/receivables),
 * same figures the Dashboard itself shows. Supplier payments / salaries /
 * recurring expenses stay illustrative fixture data: the real pipeline only
 * ever produces one flat daily_expense number (see backend/src/config.js),
 * no per-category breakdown exists anywhere to draw a real one from.
 *
 * @typedef {Object} LineageResponse
 * @property {number} total
 * @property {string} label
 * @property {string} [explanation]
 * @property {Array<{
 *   label: string, amount: number, sign: '+'|'-', source: string,
 *   confidence?: 'high'|'medium'|'low', correctedBy?: string, correctedAt?: string
 * }>} lineItems
 */

/**
 * @param {string} figureId
 * @returns {Promise<LineageResponse>}
 */
export function getLineage(figureId) {
  switch (figureId) {
    case 'current-cash':
      return currentCashLineage();
    case 'receivables':
      return receivablesLineage();
    case 'projected-cash':
    default:
      // An unknown id still resolves to the full projection rather than an
      // error state — the drawer is an explanation surface, never a dead end.
      return projectedCashLineage();
  }
}

const ILLUSTRATIVE_SOURCE =
  'Illustrative — this pipeline tracks one aggregate expense figure, not per-category data';

/** How the 30-day projected balance is built. */
async function projectedCashLineage() {
  const [dashboard, receivables] = await Promise.all([
    request('/api/dashboard?horizon=30'),
    request('/api/dashboard/receivables?horizon=30'),
  ]);

  const supplierTotal = SUPPLIER_OBLIGATIONS.filter((o) => o.dueOffset <= 30).reduce(
    (sum, o) => sum + o.amount,
    0,
  );
  const salaries = RECURRING_EXPENSES.find((e) => e.id === 'exp-salary').amount;
  const otherRecurring = RECURRING_EXPENSES.filter((e) => e.id !== 'exp-salary').reduce(
    (sum, e) => sum + e.amount,
    0,
  );

  return {
    label: 'Projected balance — 30 days',
    total: dashboard.projectedCashEndOfHorizon,
    explanation:
      'Current cash and expected receivables trace to your real imported invoices and payment-behaviour model. Supplier payments, salaries, and recurring expenses below are illustrative only — flagged as such — since this pipeline does not yet track named expense categories.',
    lineItems: [
      {
        label: 'Current cash',
        amount: dashboard.currentCash,
        sign: '+',
        source: 'Model 2 opening-cash assumption',
        confidence: 'high',
      },
      {
        label: 'Expected receivables',
        amount: receivables.expectedInWindow.total,
        sign: '+',
        source:
          receivables.expectedInWindow.items.map((i) => i.id).join(', ') || 'None inside horizon',
        confidence: 'medium',
      },
      {
        label: 'Supplier payments',
        amount: supplierTotal,
        sign: '-',
        source: ILLUSTRATIVE_SOURCE,
        confidence: 'low',
      },
      {
        label: 'Salaries',
        amount: salaries,
        sign: '-',
        source: ILLUSTRATIVE_SOURCE,
        confidence: 'low',
      },
      {
        label: 'Recurring expenses',
        amount: otherRecurring,
        sign: '-',
        source: ILLUSTRATIVE_SOURCE,
        confidence: 'low',
      },
    ],
  };
}

async function currentCashLineage() {
  const { currentCash } = await request('/api/dashboard/current-cash');
  return {
    label: 'Current cash',
    total: currentCash,
    explanation: 'The opening-cash figure Model 2\'s simulation starts every forecast from.',
    lineItems: [
      {
        label: 'Opening cash',
        amount: currentCash,
        sign: '+',
        source: 'Model 2 opening-cash assumption (backend/src/config.js)',
        confidence: 'high',
      },
    ],
  };
}

async function receivablesLineage() {
  const receivables = await request('/api/dashboard/receivables?horizon=30');
  const unpaid = receivables.outstanding.items;
  return {
    label: 'Outstanding receivables',
    total: receivables.outstanding.total,
    explanation: 'Every unpaid invoice currently in your book.',
    lineItems: unpaid.map((invoice) => ({
      label: `${invoice.id} — ${invoice.customer}`,
      amount: invoice.amount,
      sign: '+',
      source: `Due ${invoice.dueDate}`,
      confidence: 'high',
    })),
  };
}

/**
 * The imported-vs-corrected review table (PRD 3.3 / concept doc §11).
 */
export function getImportedFields() {
  return mockRequest(() =>
    INVOICES.map((invoice) => ({
      id: invoice.id,
      customer: getCustomer(invoice.customerId).name,
      amount: invoice.amount,
      importedAmount: invoice.importedAmount ?? invoice.amount,
      dueDate: dateFromToday(invoice.dueOffset),
      status: invoice.status,
      confidence: invoice.confidence,
      source: `${invoice.id}.pdf — OCR`,
      correctedBy: invoice.correctedBy,
      daysOverdue: invoice.dueOffset < 0 && invoice.status !== 'paid' ? -invoice.dueOffset : 0,
    })),
  );
}
