/**
 * MSMED Act 2006 exposure, derived from invoices.csv.
 *
 * Nothing here is a model output - it is arithmetic over columns the CSV
 * already carries (issue_date, payment_term_days, invoice_amount, status,
 * actual_paid_date), applying statutory rules the rest of the pipeline has
 * no concept of:
 *
 *   Section 2(n) - only a MICRO or SMALL enterprise is a "supplier". A
 *   medium enterprise has no Chapter V rights at all, so eligibility is
 *   checked first and everything below is withheld when it fails.
 *
 *   Section 15 - the enforceable payment term is capped at 45 days, so an
 *   invoice written "net 60" is legally late from day 46, not day 61. Every
 *   delay figure elsewhere in this backend measures against the contractual
 *   due_date and therefore reads later than the law does.
 *
 *   Section 16 - past that date the buyer owes interest at three times the
 *   RBI bank rate with monthly rests, automatically. This is money the
 *   supplier is already entitled to and typically never invoices for, which
 *   is why it is surfaced as its own figure rather than folded into the
 *   forecast.
 *
 *   Section 18 - an unresolved delayed payment is referable to the MSEFC.
 *   Referral is filed against a BUYER, not an invoice, which is why the
 *   customer rollup below exists alongside the invoice list.
 *
 * DISPUTED INVOICES ARE HELD SEPARATE. Section 15 runs its clock from
 * acceptance or DEEMED acceptance, and deemed acceptance turns on whether
 * the buyer objected in writing within fifteen days. On a disputed invoice
 * that objection is exactly what is in play, so the interest is contingent
 * on the dispute resolving in the supplier's favour - it is not settled
 * money owed. On this dataset that distinction is not academic: disputed
 * invoices carry roughly five times the interest of the undisputed ones, so
 * folding them into one headline would overstate the claim several-fold.
 *
 * KNOWN APPROXIMATION: the Act runs its clock from the day of acceptance (or
 * deemed acceptance) of the goods, which is a delivery event this dataset
 * does not record. issue_date is used as the proxy and every figure here
 * inherits that assumption - reported to the UI as `clockStartsFrom` so the
 * screen can say so rather than implying a precision the data lacks.
 *
 * Deliberately kept separate from the cash-flow forecast: statutory interest
 * is an entitlement, not a receivable anyone has agreed to pay, and treating
 * it as projected inflow would overstate cash the business cannot count on.
 */
import { roundHalfEven } from '../lib/round.js';
import {
  STATUTORY_TERM_DAYS,
  RBI_BANK_RATE,
  STATUTORY_INTEREST_MULTIPLE,
  ENTERPRISE_TIER,
  UPGRADED_TO_MEDIUM_ON,
  CLAIM_LIMITATION_YEARS,
} from '../config.js';

const MS_PER_DAY = 86_400_000;
const DAYS_PER_MONTH = 30;

// Section 15's fallback where no written agreement fixes a term. Kept
// distinct from STATUTORY_TERM_DAYS because they are different rules that
// happen to be expressed in the same unit.
const NO_AGREEMENT_TERM_DAYS = 15;

// A claim inside this many days of being time-barred is worth surfacing on
// its own - three years is long enough that nothing feels urgent until it
// abruptly isn't.
const EXPIRY_WARNING_DAYS = 180;

/** Indian fiscal year ends 31 March. */
function nextFiscalYearEnd(todayDay) {
  const d = new Date(todayDay);
  const year = d.getUTCFullYear();
  const thisYearEnd = Date.UTC(year, 2, 31);
  return todayDay <= thisYearEnd ? thisYearEnd : Date.UTC(year + 1, 2, 31);
}

function toUTCDay(dateLike) {
  const [y, m, d] = String(dateLike).slice(0, 10).split('-').map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return Date.UTC(y, m - 1, d);
}

function addDays(utcDay, days) {
  return utcDay + days * MS_PER_DAY;
}

function isoDate(utcDay) {
  return new Date(utcDay).toISOString().slice(0, 10);
}

/**
 * Whether this business can claim any of Chapter V at all.
 *
 * Returns the reasoning too, not just the verdict - a business told it has
 * no statutory claim is owed an explanation of why, and "you are a medium
 * enterprise" is an answer its owner can act on (or dispute).
 */
export function supplierEligibility(today = new Date()) {
  const tier = String(ENTERPRISE_TIER).toLowerCase();

  if (tier === 'micro' || tier === 'small') {
    return {
      isSupplier: true,
      tier,
      basis: `A ${tier} enterprise is a "supplier" under Section 2(n), so Sections 15, 16 and 18 apply to your invoices.`,
    };
  }

  if (tier === 'medium' && UPGRADED_TO_MEDIUM_ON) {
    const upgradedDay = toUTCDay(UPGRADED_TO_MEDIUM_ON);
    if (upgradedDay != null) {
      const graceEndsDay = addDays(upgradedDay, 3 * 365);
      const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      if (todayDay < graceEndsDay) {
        return {
          isSupplier: true,
          tier,
          basis: `You were upgraded to medium on ${UPGRADED_TO_MEDIUM_ON}, and a small enterprise keeps its Chapter V rights for three years after upgrading — until ${isoDate(graceEndsDay)}.`,
          graceEndsOn: isoDate(graceEndsDay),
        };
      }
      return {
        isSupplier: false,
        tier,
        basis: `Your three-year protection after upgrading to medium ended on ${isoDate(graceEndsDay)}. A medium enterprise is not a "supplier" under Section 2(n), so no statutory interest accrues on your invoices.`,
      };
    }
  }

  if (tier === 'medium') {
    return {
      isSupplier: false,
      tier,
      basis:
        'A medium enterprise is not a "supplier" under Section 2(n). The 45-day cap, Section 16 interest and MSEFC referral are available to micro and small enterprises only.',
    };
  }

  // An unrecognised tier is a configuration mistake, not a legal finding -
  // say so rather than silently granting or denying an entitlement.
  return {
    isSupplier: false,
    tier,
    basis: `Enterprise tier "${ENTERPRISE_TIER}" is not one of micro/small/medium, so supplier status under Section 2(n) cannot be established.`,
  };
}

/**
 * Section 15's statutory term: the agreed term, capped at 45 days - or 15
 * days where no written term exists at all.
 */
function statutoryTermFor(contractualTerm) {
  if (!Number.isFinite(contractualTerm) || contractualTerm <= 0) return NO_AGREEMENT_TERM_DAYS;
  return Math.min(contractualTerm, STATUTORY_TERM_DAYS);
}

/**
 * Section 16 interest: principal x ((1 + monthly rate)^months - 1).
 *
 * "Monthly rests" means compounding, so a simple-interest reading understates
 * a long delay - and this dataset has invoices over a year past due, where
 * the two diverge substantially.
 */
export function statutoryInterest(principal, daysLate) {
  if (!(principal > 0) || !(daysLate > 0)) return 0;
  const monthlyRate = (STATUTORY_INTEREST_MULTIPLE * RBI_BANK_RATE) / 12;
  const months = daysLate / DAYS_PER_MONTH;
  return principal * ((1 + monthlyRate) ** months - 1);
}

/** Groups past-due invoices by buyer, since an MSEFC referral names a buyer. */
function rollUpByCustomer(invoices) {
  const byCustomer = new Map();

  for (const invoice of invoices) {
    let entry = byCustomer.get(invoice.customerId);
    if (!entry) {
      entry = {
        id: invoice.customerId,
        name: invoice.customer,
        invoiceCount: 0,
        principal: 0,
        interestOwed: 0,
        maxDaysPastStatutoryDue: 0,
        soonestClaimExpiryDays: Infinity,
        anyTermBeyondCap: false,
      };
      byCustomer.set(invoice.customerId, entry);
    }
    entry.invoiceCount += 1;
    entry.principal += invoice.amount;
    entry.interestOwed += invoice.interestOwed;
    entry.maxDaysPastStatutoryDue = Math.max(
      entry.maxDaysPastStatutoryDue,
      invoice.daysPastStatutoryDue,
    );
    entry.soonestClaimExpiryDays = Math.min(
      entry.soonestClaimExpiryDays,
      invoice.daysUntilClaimExpires,
    );
    entry.anyTermBeyondCap = entry.anyTermBeyondCap || invoice.termExceedsCap;
  }

  return [...byCustomer.values()]
    .map((c) => ({
      ...c,
      principal: roundHalfEven(c.principal, 2),
      interestOwed: roundHalfEven(c.interestOwed, 2),
    }))
    .sort((a, b) => b.interestOwed - a.interestOwed);
}

/**
 * raw: invoices.csv rows. today: reference date, defaulted to now so the
 * figures move with the calendar the same way the risk graph's do.
 */
export function statutoryExposure(raw, today = new Date()) {
  const eligibility = supplierEligibility(today);

  const base = {
    eligibility,
    statutoryTermDays: STATUTORY_TERM_DAYS,
    interestRateAnnualPct: roundHalfEven(STATUTORY_INTEREST_MULTIPLE * RBI_BANK_RATE * 100, 2),
    clockStartsFrom: 'issue_date',
  };

  // No supplier status, no entitlement - and nothing below would mean
  // anything, so it is not computed rather than computed and hidden.
  if (!eligibility.isSupplier) {
    return {
      ...base,
      totals: null,
      contingent: null,
      limitation: null,
      taxLeverage: null,
      customers: [],
      invoices: [],
      disputed: [],
      historical: null,
    };
  }

  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const limitationCutoffDay = addDays(todayDay, -CLAIM_LIMITATION_YEARS * 365);

  const invoices = [];
  const disputed = [];
  let termsBeyondCap = 0;

  // Interest that already accrued on invoices since settled late. The
  // entitlement survived the payment - Section 16 interest is owed on the
  // delay, not on the outstanding balance - so this is money forfeited by
  // never having claimed it, not money still outstanding. Kept in its own
  // bucket for exactly that reason.
  let forfeitedInterest = 0;
  let forfeitedPrincipal = 0;
  let forfeitedCount = 0;

  for (const row of raw) {
    const issueDay = toUTCDay(row.issue_date);
    const contractualTerm = Number(row.payment_term_days);
    const amount = Number(row.invoice_amount);
    if (issueDay == null || !Number.isFinite(amount)) continue;

    const termExceedsCap = contractualTerm > STATUTORY_TERM_DAYS;
    const statutoryDueDay = addDays(issueDay, statutoryTermFor(contractualTerm));

    if (row.status === 'closed') {
      const paidDay = toUTCDay(row.actual_paid_date);
      if (paidDay == null) continue;
      const daysLate = Math.floor((paidDay - statutoryDueDay) / MS_PER_DAY);
      // Settled before it was ever statutorily late, or settled so long ago
      // the claim is time-barred either way.
      if (daysLate <= 0 || paidDay < limitationCutoffDay) continue;
      forfeitedInterest += statutoryInterest(amount, daysLate);
      forfeitedPrincipal += amount;
      forfeitedCount += 1;
      continue;
    }

    // Counted only over open invoices, so it sits on the same population as
    // the two figures shown beside it.
    if (termExceedsCap) termsBeyondCap += 1;

    const daysPastStatutoryDue = Math.floor((todayDay - statutoryDueDay) / MS_PER_DAY);
    if (daysPastStatutoryDue <= 0) continue;

    // Limitation runs from when the cause of action arose - the day the
    // payment became statutorily overdue - so a long-overdue invoice is
    // simultaneously the largest claim and the closest to being unclaimable.
    const claimExpiresDay = addDays(statutoryDueDay, CLAIM_LIMITATION_YEARS * 365);

    const entry = {
      id: row.invoice_id,
      customer: row.customer_name,
      customerId: row.cust_number,
      amount,
      contractualTermDays: Number.isFinite(contractualTerm) ? contractualTerm : null,
      contractualDueDate: row.due_date,
      statutoryDueDate: isoDate(statutoryDueDay),
      daysPastStatutoryDue,
      interestOwed: roundHalfEven(statutoryInterest(amount, daysPastStatutoryDue), 2),
      termExceedsCap,
      claimExpiresOn: isoDate(claimExpiresDay),
      daysUntilClaimExpires: Math.floor((claimExpiresDay - todayDay) / MS_PER_DAY),
    };

    // A contested invoice is still referable to the MSEFC - resolving the
    // dispute is what the council is for - but its interest is contingent,
    // so it never joins the figure the owner is told they are owed.
    if (String(row.status).startsWith('disputed')) disputed.push(entry);
    else invoices.push(entry);
  }

  invoices.sort((a, b) => b.interestOwed - a.interestOwed);
  disputed.sort((a, b) => b.interestOwed - a.interestOwed);
  const customers = rollUpByCustomer(invoices);
  const fiscalYearEndDay = nextFiscalYearEnd(todayDay);

  const expiringSoon = invoices
    .filter((i) => i.daysUntilClaimExpires <= EXPIRY_WARNING_DAYS)
    .sort((a, b) => a.daysUntilClaimExpires - b.daysUntilClaimExpires);

  return {
    ...base,
    totals: {
      interestOwed: roundHalfEven(
        invoices.reduce((sum, i) => sum + i.interestOwed, 0),
        2,
      ),
      principalPastStatutoryDue: roundHalfEven(
        invoices.reduce((sum, i) => sum + i.amount, 0),
        2,
      ),
      invoicesPastStatutoryDue: invoices.length,
      invoicesWithTermBeyondCap: termsBeyondCap,
      msefcEligibleCustomers: customers.length,
    },
    limitation: {
      years: CLAIM_LIMITATION_YEARS,
      warningWindowDays: EXPIRY_WARNING_DAYS,
      expiringSoonCount: expiringSoon.length,
      expiringSoonInterest: roundHalfEven(
        expiringSoon.reduce((sum, i) => sum + i.interestOwed, 0),
        2,
      ),
      // The single most urgent claim, so the UI has a concrete deadline to
      // name rather than only a count.
      soonest: expiringSoon.length
        ? {
            id: expiringSoon[0].id,
            customer: expiringSoon[0].customer,
            expiresOn: expiringSoon[0].claimExpiresOn,
            daysLeft: expiringSoon[0].daysUntilClaimExpires,
          }
        : null,
    },
    // Section 43B(h) of the Income Tax Act: a buyer cannot deduct the expense
    // until it actually pays an MSE supplier. That makes an unpaid MSME due a
    // live tax problem for the buyer at year end - usually a far sharper
    // lever than interest they have already decided to ignore, and one with a
    // real deadline attached.
    taxLeverage: {
      fiscalYearEndsOn: isoDate(fiscalYearEndDay),
      daysUntilFiscalYearEnd: Math.floor((fiscalYearEndDay - todayDay) / MS_PER_DAY),
      principalAtStake: roundHalfEven(
        invoices.reduce((sum, i) => sum + i.amount, 0),
        2,
      ),
      buyerCount: customers.length,
    },
    contingent: {
      interestOwed: roundHalfEven(
        disputed.reduce((sum, i) => sum + i.interestOwed, 0),
        2,
      ),
      principal: roundHalfEven(
        disputed.reduce((sum, i) => sum + i.amount, 0),
        2,
      ),
      invoiceCount: disputed.length,
    },
    customers,
    invoices,
    disputed,
    historical: {
      interestForfeited: roundHalfEven(forfeitedInterest, 2),
      principal: roundHalfEven(forfeitedPrincipal, 2),
      invoiceCount: forfeitedCount,
      limitationYears: CLAIM_LIMITATION_YEARS,
    },
  };
}
