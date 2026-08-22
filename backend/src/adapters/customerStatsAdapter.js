/**
 * Payment-behaviour and concentration figures the frontend expects per
 * customer (frontend/src/mocks/api/dashboard.js getPaymentBehaviour /
 * getConcentrationBreakdown). Neither Model 1 nor Model 7 outputs this
 * narrative shape directly - it's a plain aggregation over invoices.csv's
 * closed invoices, following the same severity thresholds
 * (>20 days = high, >8 = medium) the original frontend fixture used, so the
 * "reliable / late" language stays consistent with what was already there.
 */
import { roundHalfEven } from '../lib/round.js';

function groupByCustNumber(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.cust_number)) groups.set(row.cust_number, []);
    groups.get(row.cust_number).push(row);
  }
  // pandas' groupby iterates in sorted key order by default.
  return new Map([...groups.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

function mean(values) {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return NaN;
  return finite.reduce((a, b) => a + b, 0) / finite.length;
}

export function paymentBehaviour(raw) {
  const closed = raw.filter((r) => r.status === 'closed');
  const groups = groupByCustNumber(closed);
  const rows = [];

  for (const [custNumber, group] of groups) {
    const term = parseInt(group[0].payment_term_days, 10);
    const avgDelay = mean(group.map((r) => Number(r.delay_vs_due_date)));
    const totalDays = group.map((r) => Number(r.payment_term_days) + Number(r.delay_vs_due_date));
    const minDays = Math.min(...totalDays);
    const maxDays = Math.max(...totalDays);
    const name = group[0].customer_name;

    let severity;
    let interpretation;
    if (avgDelay > 20) {
      severity = 'high';
      interpretation = 'Consistently late. Treat their invoices as slower money than stated terms.';
    } else if (avgDelay > 8) {
      severity = 'medium';
      interpretation = 'Slightly late, but predictable.';
    } else {
      severity = 'low';
      interpretation = 'Reliable. Pays close to terms.';
    }

    rows.push({
      id: custNumber,
      name,
      contractualTerm: `${term} days`,
      typicalRange: `${minDays}–${maxDays} days`,
      interpretation,
      severity,
    });
  }

  return rows
    .map((r, index) => ({ r, index }))
    .sort((a, b) => {
      const aKey = a.r.severity !== 'high';
      const bKey = b.r.severity !== 'high';
      if (aKey !== bKey) return aKey ? 1 : -1;
      return a.index - b.index;
    })
    .map(({ r }) => r);
}

export function concentrationBreakdown(raw) {
  const outstanding = raw.filter((r) => r.status !== 'closed');
  const total = outstanding.reduce((sum, r) => sum + Number(r.invoice_amount), 0);
  const groups = groupByCustNumber(outstanding);
  const rows = [];

  for (const [custNumber, group] of groups) {
    const amount = group.reduce((sum, r) => sum + Number(r.invoice_amount), 0);
    if (amount <= 0) continue;
    rows.push({
      id: custNumber,
      name: group[0].customer_name,
      amount,
      pct: total ? roundHalfEven((amount / total) * 100, 1) : 0.0,
    });
  }

  return rows.sort((a, b) => b.amount - a.amount);
}

export function topCustomerConcentrationPct(raw) {
  const breakdown = concentrationBreakdown(raw);
  return breakdown.length ? breakdown[0].pct : 0.0;
}
