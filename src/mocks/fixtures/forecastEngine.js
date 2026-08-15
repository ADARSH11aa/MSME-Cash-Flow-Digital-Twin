/**
 * The cash-flow model behind every screen.
 *
 * One engine serves both the dashboard forecast and the scenario simulator —
 * a scenario is just the same projection run with shocks applied, which is
 * what makes the before/after overlay in PRD 3.5 a like-for-like comparison
 * rather than two differently-derived curves.
 *
 * The three bands come from payment behaviour, not from an arbitrary +/- band:
 *   optimistic  — every customer pays on contractual terms
 *   expected    — every customer pays with their typical observed delay
 *   pessimistic — every customer pays at their worst observed delay
 * That is the concept doc's §6.5 framing, and it means the spread between the
 * bands is itself a readout of how unpredictable the customer book is.
 */

import {
  BUSINESS,
  INVOICES,
  RECURRING_EXPENSES,
  SUPPLIER_OBLIGATIONS,
  TODAY,
  dateFromToday,
  getCustomer,
} from './business.js';

/**
 * @typedef {Object} Shocks
 * @property {{ customerId: string, days: number }} [customerDelay]
 * @property {number} [revenueShockPct]   -50..+20
 * @property {number} [expenseShockPct]   -20..+50
 * @property {string[]} [deferredObligations]  obligation ids pushed out
 * @property {number} [deferDays]
 * @property {number} [immediateInflow]   e.g. an invoice-finance advance
 */

const BANDS = /** @type {const} */ (['optimistic', 'expected', 'pessimistic']);

/**
 * Day offset on which an invoice is expected to actually land, per band.
 * @param {object} invoice
 * @param {'optimistic'|'expected'|'pessimistic'} band
 * @param {Shocks} shocks
 */
function paymentOffset(invoice, band, shocks) {
  const customer = getCustomer(invoice.customerId);
  const delay = {
    optimistic: 0,
    expected: customer.typicalDelayDays,
    pessimistic: customer.worstDelayDays,
  }[band];

  let offset = invoice.dueOffset + delay;

  // A modelled delay applies on top of observed behaviour, for the named
  // customer only ("what if my biggest customer pays 30 days late?").
  if (shocks.customerDelay && shocks.customerDelay.customerId === invoice.customerId) {
    offset += shocks.customerDelay.days;
  }

  // Money already past due cannot arrive in the past.
  return Math.max(offset, 0);
}

/**
 * Every outflow inside the horizon, with recurring items expanded per month.
 * @param {number} horizon
 * @param {Shocks} shocks
 */
function buildOutflows(horizon, shocks) {
  const outflows = [];
  const expenseMultiplier = 1 + (shocks.expenseShockPct ?? 0) / 100;

  for (let day = 0; day <= horizon; day += 1) {
    const date = new Date(TODAY);
    date.setDate(date.getDate() + day);

    for (const expense of RECURRING_EXPENSES) {
      if (date.getDate() === expense.dayOfMonth) {
        outflows.push({
          offset: day,
          amount: expense.amount * expenseMultiplier,
          label: expense.label,
          id: expense.id,
          critical: Boolean(expense.critical),
        });
      }
    }
  }

  const deferred = new Set(shocks.deferredObligations ?? []);
  for (const obligation of SUPPLIER_OBLIGATIONS) {
    const offset = obligation.dueOffset + (deferred.has(obligation.id) ? (shocks.deferDays ?? 0) : 0);
    if (offset <= horizon) {
      outflows.push({
        offset,
        amount: obligation.amount * expenseMultiplier,
        label: obligation.label,
        id: obligation.id,
        critical: false,
      });
    }
  }

  return outflows;
}

/**
 * Project the daily closing cash balance across the horizon.
 *
 * @param {{ horizon?: number, shocks?: Shocks }} [options]
 * @returns {{
 *   forecast: Array<{ date: string, optimistic: number, expected: number, pessimistic: number }>,
 *   daysToBreach: number|null,
 *   breachDate: string|null,
 *   projectedCashEndOfHorizon: number,
 *   dailyDetail: Array<{ date: string, opening: number, inflow: number, outflow: number, closing: number, items: object[] }>,
 * }}
 */
export function buildForecast({ horizon = 30, shocks = {} } = {}) {
  const revenueMultiplier = 1 + (shocks.revenueShockPct ?? 0) / 100;
  const unpaid = INVOICES.filter((i) => i.status !== 'paid');
  const outflows = buildOutflows(horizon, shocks);

  // Running balance per band.
  const balance = {
    optimistic: BUSINESS.currentCash,
    expected: BUSINESS.currentCash,
    pessimistic: BUSINESS.currentCash,
  };

  // A financing advance lands on day 0 in every band.
  if (shocks.immediateInflow) {
    for (const band of BANDS) balance[band] += shocks.immediateInflow;
  }

  const forecast = [];
  const dailyDetail = [];
  let daysToBreach = null;
  let breachDate = null;

  for (let day = 0; day <= horizon; day += 1) {
    const date = dateFromToday(day);

    const dayOutflow = outflows
      .filter((o) => o.offset === day)
      .reduce((sum, o) => sum + o.amount, 0);
    const dayItems = outflows.filter((o) => o.offset === day);

    let expectedInflow = 0;

    for (const band of BANDS) {
      const inflow = unpaid
        .filter((invoice) => paymentOffset(invoice, band, shocks) === day)
        .reduce((sum, invoice) => sum + invoice.amount * revenueMultiplier, 0);

      if (band === 'expected') expectedInflow = inflow;

      balance[band] = balance[band] + inflow - dayOutflow;
    }

    forecast.push({
      date,
      optimistic: Math.round(balance.optimistic),
      expected: Math.round(balance.expected),
      pessimistic: Math.round(balance.pessimistic),
    });

    dailyDetail.push({
      date,
      inflow: Math.round(expectedInflow),
      outflow: Math.round(dayOutflow),
      closing: Math.round(balance.expected),
      items: dayItems,
    });

    // First day the expected line drops under the operating buffer.
    if (daysToBreach === null && balance.expected < BUSINESS.minimumBuffer && day > 0) {
      daysToBreach = day;
      breachDate = date;
    }
  }

  return {
    forecast,
    daysToBreach,
    breachDate,
    projectedCashEndOfHorizon: forecast.at(-1).expected,
    dailyDetail,
  };
}

/**
 * The upcoming obligations list on the dashboard (PRD 3.4.6), soonest first.
 * An obligation is flagged at-risk when the expected balance on its due date
 * is already under the buffer.
 *
 * @param {number} horizon
 */
export function upcomingObligations(horizon = 30) {
  const { dailyDetail } = buildForecast({ horizon });
  const byDate = new Map(dailyDetail.map((d) => [d.date, d.closing]));

  return buildOutflows(horizon, {})
    .sort((a, b) => a.offset - b.offset)
    .map((o) => {
      const dueDate = dateFromToday(o.offset);
      return {
        id: `${o.id}-${o.offset}`,
        label: o.label,
        amount: Math.round(o.amount),
        dueDate,
        isAtRisk: (byDate.get(dueDate) ?? Infinity) < BUSINESS.minimumBuffer,
        critical: o.critical,
      };
    });
}
