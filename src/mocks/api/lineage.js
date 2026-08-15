import { mockRequest } from '@/lib/api';
import {
  BUSINESS,
  INVOICES,
  RECURRING_EXPENSES,
  SUPPLIER_OBLIGATIONS,
  dateFromToday,
  getCustomer,
  outstandingInvoices,
} from '../fixtures/business';
import { buildForecast } from '../fixtures/forecastEngine';

/**
 * GET /api/lineage/:figureId — PRD Section 6 `LineageResponse`.
 *
 * Every inspectable figure in the product resolves to one of these. The
 * `figureId` strings used by <Figure /> call sites are the keys below, so a
 * missing lineage is a build-time-visible mistake rather than a silent
 * un-clickable number.
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
  return mockRequest(() => buildLineage(figureId), { latency: 180 });
}

function buildLineage(figureId) {
  switch (figureId) {
    case 'projected-cash':
      return projectedCashLineage();
    case 'current-cash':
      return currentCashLineage();
    case 'receivables':
      return receivablesLineage();
    default:
      // An unknown id still resolves to the full projection rather than an
      // error state — the drawer is an explanation surface, never a dead end.
      return projectedCashLineage();
  }
}

/** The §12 worked example: how the 30-day projected balance is built. */
function projectedCashLineage() {
  const { projectedCashEndOfHorizon } = buildForecast({ horizon: 30 });
  const unpaid = outstandingInvoices();

  const receivablesInWindow = unpaid.filter((i) => {
    const customer = getCustomer(i.customerId);
    return i.dueOffset + customer.typicalDelayDays <= 30;
  });

  const receivableTotal = receivablesInWindow.reduce((sum, i) => sum + i.amount, 0);
  const supplierTotal = SUPPLIER_OBLIGATIONS.filter((o) => o.dueOffset <= 30).reduce(
    (sum, o) => sum + o.amount,
    0,
  );
  const salaries = RECURRING_EXPENSES.find((e) => e.id === 'exp-salary').amount;
  const otherRecurring = RECURRING_EXPENSES.filter((e) => e.id !== 'exp-salary').reduce(
    (sum, e) => sum + e.amount,
    0,
  );

  const corrected = unpaid.find((i) => i.correctedBy);

  return {
    label: 'Projected balance — 30 days',
    total: projectedCashEndOfHorizon,
    explanation:
      'Every figure below traces back to a source record. Correct any value and the forecast recalculates immediately.',
    lineItems: [
      {
        label: 'Current cash',
        amount: BUSINESS.currentCash,
        sign: '+',
        source: `Bank balance, ${dateFromToday(0)}`,
        confidence: 'high',
      },
      {
        label: 'Expected receivables',
        amount: receivableTotal,
        sign: '+',
        source: receivablesInWindow.map((i) => i.id).join(', ') || 'None inside horizon',
        confidence: 'medium',
        correctedBy: corrected ? corrected.correctedBy : undefined,
        correctedAt: corrected ? `${dateFromToday(corrected.correctedOffset)}T10:22:00Z` : undefined,
      },
      {
        label: 'Supplier payments',
        amount: supplierTotal,
        sign: '-',
        source: SUPPLIER_OBLIGATIONS.filter((o) => o.dueOffset <= 30)
          .map((o) => o.id.toUpperCase())
          .join(', '),
        confidence: 'high',
      },
      {
        label: 'Salaries',
        amount: salaries,
        sign: '-',
        source: 'Payroll schedule — recurring, 1st of month',
        confidence: 'high',
      },
      {
        label: 'Recurring expenses',
        amount: otherRecurring,
        sign: '-',
        source: 'Rent, utilities, GST remittance',
        confidence: 'high',
      },
    ],
  };
}

function currentCashLineage() {
  return {
    label: 'Current cash',
    total: BUSINESS.currentCash,
    explanation: 'Your cash position today, as imported from your bank statement.',
    lineItems: [
      {
        label: 'Operating account',
        amount: 286000,
        sign: '+',
        source: 'Bank statement upload',
        confidence: 'high',
      },
      {
        label: 'Cash on hand',
        amount: 54000,
        sign: '+',
        source: 'Manual entry by owner',
        confidence: 'medium',
        correctedBy: 'Owner',
        correctedAt: `${dateFromToday(-3)}T09:10:00Z`,
      },
    ],
  };
}

function receivablesLineage() {
  const unpaid = outstandingInvoices();
  return {
    label: 'Outstanding receivables',
    total: unpaid.reduce((sum, i) => sum + i.amount, 0),
    explanation: 'Every unpaid invoice currently in your book.',
    lineItems: unpaid.map((invoice) => ({
      label: `${invoice.id} — ${getCustomer(invoice.customerId).name}`,
      amount: invoice.amount,
      sign: '+',
      source: `Due ${dateFromToday(invoice.dueOffset)}`,
      confidence: invoice.confidence,
      correctedBy: invoice.correctedBy,
      correctedAt: invoice.correctedOffset
        ? `${dateFromToday(invoice.correctedOffset)}T10:22:00Z`
        : undefined,
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
