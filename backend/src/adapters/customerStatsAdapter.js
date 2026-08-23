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

function median(values) {
  const finite = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (finite.length === 0) return NaN;
  const mid = Math.floor(finite.length / 2);
  return finite.length % 2 ? finite[mid] : (finite[mid - 1] + finite[mid]) / 2;
}

/**
 * Days Sales Outstanding, benchmarked against the sectors this business
 * actually trades with.
 *
 * "Your customers take 68 days to pay" is a number without a verdict - the
 * owner has no way to know whether that is normal for who they sell to. The
 * comparison is what makes it actionable, and it costs nothing extra: the
 * sector medians come from the same closed invoices already loaded for
 * paymentBehaviour().
 *
 * Median rather than mean throughout - a single 200-day outlier in a small
 * MSME book would drag a mean somewhere unrepresentative.
 *
 * IMPORTANT CAVEAT for how this is presented: the "sector median" here is
 * computed from THIS business's own invoices within each sector, not from an
 * external industry benchmark. With one business's data it is a peer
 * comparison across that business's customer base. Real cross-business
 * benchmarking needs data this pipeline doesn't have, so the UI must not
 * imply an industry-wide figure.
 */
export function dsoBenchmark(raw) {
  const closed = raw.filter(
    (r) => r.status === 'closed' && Number.isFinite(Number(r.days_to_payment)),
  );
  if (closed.length === 0) return null;

  const overallDso = median(closed.map((r) => Number(r.days_to_payment)));

  const bySector = new Map();
  for (const row of closed) {
    if (!bySector.has(row.sector)) bySector.set(row.sector, []);
    bySector.get(row.sector).push(Number(row.days_to_payment));
  }

  const sectors = [...bySector.entries()]
    .map(([sector, days]) => ({
      sector,
      medianDays: roundHalfEven(median(days), 1),
      invoiceCount: days.length,
    }))
    // A "median" over one or two invoices is noise wearing a statistic's
    // name; leave those sectors out rather than publish a benchmark nobody
    // should act on.
    .filter((s) => s.invoiceCount >= 3)
    .sort((a, b) => b.medianDays - a.medianDays);

  return {
    overallDsoDays: roundHalfEven(overallDso, 1),
    sectors,
    basedOnInvoices: closed.length,
  };
}
