/**
 * The only file in this backend that knows about AI_models' HTTP surface.
 * Everything else (routes, adapters) calls the plain functions exported
 * here and never touches fetch()/URLs directly - if AI_models' endpoints
 * ever move, this is the one file that changes.
 *
 * Model 1's predictions and Model 5's SHAP explanations, and now Model 2
 * (Monte Carlo), Model 7 (recommendation ranker) and Model 8 (risk graph)
 * as well, are all reachable over HTTP on AI_models/main.py (port 8000) -
 * see that file's module docstring for the endpoint list. This gateway has
 * no Python dependency at all.
 */
import fs from 'node:fs';
import {
  MODEL1_URL, MODEL1_RELOAD_URL, SIMULATE_URL, RISK_GRAPH_URL,
  RECOMMENDATIONS_URL, RAW_INVOICES_PATH, NARRATE_URL, NARRATE_LANGUAGES_URL,
} from './config.js';
import { readInvoicesCsv } from './lib/csv.js';

function toUTCDay(dateLike) {
  if (dateLike instanceof Date) {
    return Date.UTC(dateLike.getFullYear(), dateLike.getMonth(), dateLike.getDate());
  }
  const [y, m, d] = String(dateLike).slice(0, 10).split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Request to ${url} failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Model 1's live per-invoice p10/p50/p90 payment-day predictions, joined
 * with invoice_amount / days_since_issue - exactly what /simulate and
 * /risk-graph both need.
 *
 * today: reference date for "days_since_issue". Defaults to now - pass an
 * explicit Date to pin the demo to a fixed day instead of whatever day you
 * happen to run this.
 */
export async function loadPredictions(today = new Date()) {
  const predictions = await fetchJson(MODEL1_URL);
  if (predictions.length === 0) {
    throw new Error(`Model 1's API at ${MODEL1_URL} returned zero predictions - check the server is running and its startup logs for errors.`);
  }

  const raw = readInvoicesCsv(RAW_INVOICES_PATH);
  const rawById = new Map(raw.map((row) => [row.invoice_id, row]));

  const todayDay = toUTCDay(today);

  return predictions.map((p) => {
    const rawRow = rawById.get(p.invoice_id);
    if (!rawRow) {
      throw new Error(`Invoice ${p.invoice_id} from Model 1's API response had no match in ${RAW_INVOICES_PATH} - check invoice_id formats line up.`);
    }
    const daysSinceIssue = Math.round((todayDay - toUTCDay(rawRow.issue_date)) / 86400000);
    if (daysSinceIssue < 0) {
      throw new Error(`Invoice ${p.invoice_id} has an issue_date after 'today' - check the reference date being used.`);
    }
    return {
      invoice_id: p.invoice_id,
      invoice_amount: Number(rawRow.invoice_amount),
      days_since_issue: daysSinceIssue,
      p10_payment_days: p.p10_payment_days,
      p50_payment_days: p.p50_payment_days,
      p90_payment_days: p.p90_payment_days,
    };
  });
}

/** Model 2: Monte Carlo cash-flow simulation from a predictions array - the
 * caller may pass a shocked copy of loadPredictions()'s output for what-if
 * scenarios (see adapters/scenarioShocks.js). Returns { forecast, summary }. */
export async function runForecast(predictions, openingCash, dailyExpense, horizonDays, nSims, minBuffer) {
  return fetchJson(SIMULATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      predictions,
      opening_cash: openingCash,
      daily_expense: dailyExpense,
      horizon_days: horizonDays,
      n_sims: nSims,
      min_buffer: minBuffer,
    }),
  });
}

/** Model 8: causal risk graph. Model 3 (anomaly) is fail-soft inside
 * build_risk_graph itself, so it's fine if that server isn't running. */
export async function runRiskGraph(openingCash, dailyExpense, horizonDays, minBuffer, maxFocusInvoices) {
  return fetchJson(RISK_GRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      opening_cash: openingCash,
      daily_expense: dailyExpense,
      horizon_days: horizonDays,
      min_buffer: minBuffer,
      max_focus_invoices: maxFocusInvoices,
    }),
  });
}

/** Model 7: non-debt-first recommendation ranker. */
export async function runRecommendations(overdueInvoiceValue) {
  return fetchJson(RECOMMENDATIONS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ overdue_invoice_value: overdueInvoiceValue }),
  });
}

/** Model 6: plain-language narration of ONE invoice's prediction, in the
 * requested language. Returns {invoice_id, confidence, text, source,
 * language} - `source` is "llm" or "fallback", and the UI is expected to
 * show which, rather than passing deterministic template text off as
 * model-generated prose. */
export async function narrateInvoice(invoiceId, language) {
  return fetchJson(NARRATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoice_id: invoiceId, language }),
  });
}

/** Model 6: which languages narration can be rendered in, and whether it's
 * configured at all (a missing GROQ_API_KEY makes it unavailable without
 * taking down any other endpoint). */
export async function narrateLanguages() {
  return fetchJson(NARRATE_LANGUAGES_URL);
}

/**
 * The raw invoices.csv itself - used by the customer-stats, MSMED and
 * scenario-shocks adapters, which need columns (customer_name, cust_number,
 * status, actual_paid_date) that Model 1's predictions don't carry.
 *
 * Cached on the file's mtime+size. Six endpoints call this, several of them
 * on every dashboard render, and each call was a synchronous readFileSync
 * plus a full CSV parse of 5,000+ rows on the event loop. Keying on stat()
 * rather than an explicit invalidate() means an upload (which rewrites the
 * file) invalidates this on its own, and so does anyone editing the CSV by
 * hand - there is no cache-clearing call anybody can forget to make.
 *
 * Returns the same array on a hit, so callers must treat it as read-only.
 * Every current caller filters/maps rather than mutating.
 */
let rawCache = null;

export function loadRaw() {
  const { mtimeMs, size } = fs.statSync(RAW_INVOICES_PATH);
  if (rawCache && rawCache.mtimeMs === mtimeMs && rawCache.size === size) {
    return rawCache.rows;
  }
  const rows = readInvoicesCsv(RAW_INVOICES_PATH);
  rawCache = { mtimeMs, size, rows };
  return rows;
}

/** Tells Model 1's server to re-read invoices.csv and rebuild its
 * customer-history features - required after a CSV upload, since that
 * data is otherwise cached at server startup. */
export async function reloadModel1() {
  return fetchJson(MODEL1_RELOAD_URL, { method: 'POST' });
}
