/**
 * Applies the frontend's ScenarioRequest shocks on top of Model 2's real
 * inputs, since Model 2 itself (AI_models/simulation/monte_carlo.py) has no
 * concept of "what-if" shocks at all - it only runs a Monte Carlo forecast
 * from opening_cash / daily_expense / a predictions array. Everything below
 * is new backend logic built on top of Model 2's primitives.
 *
 * deferredObligations / deferDays are NOT implemented: the real pipeline
 * only has a single flat daily_expense figure, no per-obligation dataset to
 * defer a specific one from. A request that sets these fields is accepted
 * but has no effect - see the "unhandled" list this returns, so the caller
 * can decide whether to warn the user rather than silently pretending it
 * worked.
 */

/**
 * predictions: loadPredictions()'s array (invoice_id, invoice_amount,
 * days_since_issue, p10/50/90_payment_days).
 * raw: invoices.csv rows, for the invoice_id -> cust_number join
 * customerDelay needs.
 * Returns { shocked, openingCash, dailyExpense, unhandled }.
 */
export function applyShocks(predictions, raw, openingCash, dailyExpense, shocks) {
  const shocked = predictions.map((row) => ({ ...row }));
  const unhandled = [];

  if (shocks.customerDelay) {
    const custMap = new Map(raw.map((r) => [r.invoice_id, r.cust_number]));
    const { customerId, days } = shocks.customerDelay;
    for (const row of shocked) {
      if (custMap.get(row.invoice_id) === customerId) {
        row.p10_payment_days += days;
        row.p50_payment_days += days;
        row.p90_payment_days += days;
      }
    }
  }

  if (shocks.revenueShockPct != null) {
    const factor = 1 + shocks.revenueShockPct / 100;
    for (const row of shocked) row.invoice_amount *= factor;
  }

  let shockedDailyExpense = dailyExpense;
  if (shocks.expenseShockPct != null) {
    shockedDailyExpense = dailyExpense * (1 + shocks.expenseShockPct / 100);
  }

  let shockedOpeningCash = openingCash;
  if (shocks.immediateInflow != null) {
    shockedOpeningCash = openingCash + shocks.immediateInflow;
  }

  // A statutory interest claim is money that does not exist in the invoice
  // book at all - it is never billed, so no prediction row carries it. It is
  // injected as a synthetic invoice rather than added to opening cash
  // because it does NOT arrive today: an MSEFC reference runs to 90 days, and
  // dropping it into opening cash would draw a forecast where the money is
  // already banked. Zero spread across p10/p50/p90 is deliberate - the amount
  // is fixed by statute, so the only uncertainty is whether it is paid at
  // all, which a cash-flow band cannot express honestly either way.
  if (shocks.statutoryClaim?.amount > 0) {
    const { amount, days = 90 } = shocks.statutoryClaim;
    shocked.push({
      invoice_id: 'STATUTORY-INTEREST-CLAIM',
      invoice_amount: amount,
      days_since_issue: 0,
      p10_payment_days: days,
      p50_payment_days: days,
      p90_payment_days: days,
    });
  }

  if (shocks.deferredObligations || shocks.deferDays) {
    unhandled.push('deferredObligations/deferDays: no per-obligation dataset in the real pipeline');
  }

  return { shocked, openingCash: shockedOpeningCash, dailyExpense: shockedDailyExpense, unhandled };
}
