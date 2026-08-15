/**
 * A plausible MSME dataset — a furniture workshop with the concentration and
 * payment-delay problems the product exists to surface (concept doc §6/§8).
 *
 * Everything is defined as an offset in days from today rather than a fixed
 * calendar date, so the demo never goes stale.
 *
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} name
 * @property {number} contractualTermDays  agreed payment terms
 * @property {number} typicalDelayDays     how late they actually pay
 * @property {number} worstDelayDays       worst observed delay
 * @property {string} interpretation       plain-language read on their behaviour
 */

/** Day 0 of the model. Derived once so every screen agrees on "today". */
export const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

/**
 * @param {number} offsetDays
 * @returns {string} ISO date (YYYY-MM-DD)
 */
export function dateFromToday(offsetDays) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const BUSINESS = {
  name: 'Shree Balaji Furniture Works',
  sector: 'Furniture manufacturing',
  currentCash: 340000,
  /** Below this, the business cannot meet payroll and rent — concept doc §5. */
  minimumBuffer: 200000,
};

/** @type {Customer[]} */
export const CUSTOMERS = [
  {
    id: 'cust-sharma',
    name: 'Sharma Traders',
    contractualTermDays: 30,
    typicalDelayDays: 28,
    worstDelayDays: 47,
    interpretation: 'Consistently late. Treat their invoices as 60-day money, not 30.',
  },
  {
    id: 'cust-verma',
    name: 'Verma Interiors',
    contractualTermDays: 30,
    typicalDelayDays: 6,
    worstDelayDays: 14,
    interpretation: 'Reliable. Pays close to terms.',
  },
  {
    id: 'cust-nova',
    name: 'Nova Electricals',
    contractualTermDays: 45,
    typicalDelayDays: 11,
    worstDelayDays: 25,
    interpretation: 'Slightly late, but predictable.',
  },
  {
    id: 'cust-patel',
    name: 'Patel & Sons',
    contractualTermDays: 15,
    typicalDelayDays: 2,
    worstDelayDays: 8,
    interpretation: 'Pays early. Your best-behaved account.',
  },
  {
    id: 'cust-kiran',
    name: 'Kiran Hospitality',
    contractualTermDays: 60,
    typicalDelayDays: 18,
    worstDelayDays: 38,
    interpretation: 'Long terms and late on top. Slowest cash in the book.',
  },
];

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} customerId
 * @property {number} amount
 * @property {number} issuedOffset   days from today (negative = past)
 * @property {number} dueOffset      days from today
 * @property {'pending'|'overdue'|'paid'} status
 * @property {'high'|'medium'|'low'} [confidence]  OCR read confidence
 * @property {number} [importedAmount]  pre-correction value, if corrected
 * @property {string} [correctedBy]
 * @property {number} [correctedOffset]
 */

/** @type {Invoice[]} */
export const INVOICES = [
  {
    id: 'INV-2291',
    customerId: 'cust-sharma',
    amount: 418000,
    issuedOffset: -42,
    dueOffset: -12,
    status: 'overdue',
    confidence: 'high',
  },
  {
    id: 'INV-2296',
    customerId: 'cust-sharma',
    amount: 264000,
    issuedOffset: -24,
    dueOffset: 6,
    status: 'pending',
    confidence: 'medium',
    importedAmount: 285000,
    correctedBy: 'Owner',
    correctedOffset: -3,
  },
  {
    id: 'INV-2304',
    customerId: 'cust-verma',
    amount: 126000,
    issuedOffset: -18,
    dueOffset: 12,
    status: 'pending',
    confidence: 'high',
  },
  {
    id: 'INV-2311',
    customerId: 'cust-nova',
    amount: 174000,
    issuedOffset: -11,
    dueOffset: 34,
    status: 'pending',
    confidence: 'low',
  },
  {
    id: 'INV-2288',
    customerId: 'cust-patel',
    amount: 92000,
    issuedOffset: -30,
    dueOffset: -15,
    status: 'paid',
    confidence: 'high',
  },
  {
    id: 'INV-2315',
    customerId: 'cust-kiran',
    amount: 208000,
    issuedOffset: -6,
    dueOffset: 54,
    status: 'pending',
    confidence: 'medium',
  },
  {
    id: 'INV-2318',
    customerId: 'cust-verma',
    amount: 86000,
    issuedOffset: -2,
    dueOffset: 28,
    status: 'pending',
    confidence: 'high',
  },
];

/**
 * Recurring outflows, expressed as a day-of-month so they repeat across the
 * 90-day horizon the way real obligations do.
 *
 * @typedef {Object} RecurringExpense
 * @property {string} id
 * @property {string} label
 * @property {number} amount
 * @property {number} dayOfMonth
 * @property {boolean} [critical]  cannot be delayed without consequence
 */

/** @type {RecurringExpense[]} */
export const RECURRING_EXPENSES = [
  { id: 'exp-salary', label: 'Salaries', amount: 268000, dayOfMonth: 1, critical: true },
  { id: 'exp-rent', label: 'Workshop rent', amount: 62000, dayOfMonth: 5, critical: true },
  { id: 'exp-utilities', label: 'Power & utilities', amount: 34000, dayOfMonth: 10 },
  { id: 'exp-gst', label: 'GST remittance', amount: 48000, dayOfMonth: 20, critical: true },
];

/**
 * One-off supplier obligations.
 *
 * @typedef {Object} SupplierObligation
 * @property {string} id
 * @property {string} label
 * @property {number} amount
 * @property {number} dueOffset
 * @property {boolean} negotiable  can terms realistically be extended?
 */

/** @type {SupplierObligation[]} */
export const SUPPLIER_OBLIGATIONS = [
  {
    id: 'po-8842',
    label: 'Timber supplier — PO-8842',
    amount: 186000,
    // Falls just after the salary run, which is what turns a tight month into
    // a projected breach — the case the whole product is built to catch.
    dueOffset: 28,
    negotiable: true,
  },
  {
    id: 'po-8851',
    label: 'Hardware & fittings — PO-8851',
    amount: 94000,
    dueOffset: 22,
    negotiable: true,
  },
  {
    id: 'po-8860',
    label: 'Upholstery fabric — PO-8860',
    amount: 118000,
    dueOffset: 41,
    negotiable: false,
  },
];

/** @param {string} id */
export function getCustomer(id) {
  return CUSTOMERS.find((c) => c.id === id);
}

/** Receivables still outstanding (everything not yet paid). */
export function outstandingInvoices() {
  return INVOICES.filter((i) => i.status !== 'paid');
}

/**
 * Share of outstanding receivables held by the single largest customer —
 * the concentration figure on the dashboard (PRD 3.4.2).
 * @returns {{ pct: number, customer: Customer, amount: number, total: number }}
 */
export function topCustomerConcentration() {
  const outstanding = outstandingInvoices();
  const total = outstanding.reduce((sum, i) => sum + i.amount, 0);

  const byCustomer = new Map();
  for (const invoice of outstanding) {
    byCustomer.set(invoice.customerId, (byCustomer.get(invoice.customerId) ?? 0) + invoice.amount);
  }

  let topId = null;
  let topAmount = 0;
  for (const [id, amount] of byCustomer) {
    if (amount > topAmount) {
      topAmount = amount;
      topId = id;
    }
  }

  return {
    pct: total ? (topAmount / total) * 100 : 0,
    customer: getCustomer(topId),
    amount: topAmount,
    total,
  };
}
