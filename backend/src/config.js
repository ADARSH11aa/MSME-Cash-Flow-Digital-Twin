/**
 * Backend gateway configuration.
 *
 * Every value here is overridable via environment variable, since none of
 * these numbers are "correct" in any absolute sense - AI_models/invoices.csv
 * is a large synthetic dataset (5,306 invoices, tens of millions in value)
 * with no associated opening_cash / daily_expense of its own. The frontend's
 * polished demo narrative (Shree Balaji Furniture Works, currentCash
 * 340000, minimumBuffer 200000 - see frontend/src/mocks/fixtures/business.js)
 * describes a DIFFERENT, much smaller, hand-authored business.
 *
 * Wiring the real models to the real dataset means the numbers on screen
 * will look nothing like that existing narrative (crores, not lakhs) unless
 * someone either re-scales the demo dataset or rewrites the UI copy. Picked
 * here as a reasonable placeholder scaled to this dataset - not a business
 * decision this file should be making silently forever.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AI_MODELS_ROOT =
  process.env.AI_MODELS_ROOT ?? path.resolve(__dirname, '..', '..', 'AI_models');

export const RAW_INVOICES_PATH = path.join(AI_MODELS_ROOT, 'invoices.csv');

// Model 1's own server (AI_models/main.py) defaults to reading a SEPARATE
// copy at data/raw/invoices.csv, not the root-level one this backend reads -
// the two happened to be identical when this was found, but are two
// distinct files on disk. A CSV upload has to overwrite both, or Model 1's
// server keeps scoring the old data while every other endpoint here uses
// the new one.
export const MODEL1_RAW_INVOICES_PATH = path.join(AI_MODELS_ROOT, 'data', 'raw', 'invoices.csv');

export const MODEL1_BASE_URL = process.env.MODEL1_BASE_URL ?? 'http://127.0.0.1:8000';
export const MODEL1_URL = process.env.MODEL1_URL ?? `${MODEL1_BASE_URL}/predict/open-invoices`;
export const MODEL1_RELOAD_URL = process.env.MODEL1_RELOAD_URL ?? `${MODEL1_BASE_URL}/reload-data`;

// Models 2, 7 and 8 - exposed as HTTP endpoints on the same Model 1 server
// (AI_models/main.py) instead of being called in-process, so this gateway
// never imports AI_models Python code directly.
export const SIMULATE_URL = process.env.SIMULATE_URL ?? `${MODEL1_BASE_URL}/simulate`;
export const RISK_GRAPH_URL = process.env.RISK_GRAPH_URL ?? `${MODEL1_BASE_URL}/risk-graph`;
export const RECOMMENDATIONS_URL =
  process.env.RECOMMENDATIONS_URL ?? `${MODEL1_BASE_URL}/recommendations`;

// Required for the pipeline to run at all - see routes/data.js's upload
// validation. Everything else in invoices.csv (actual_paid_date,
// days_to_payment, delay_vs_due_date, had_partial_payment_flag,
// is_big_ticket_spike) is only used for closed-invoice historical stats and
// degrades gracefully (as null) if missing, rather than breaking upload.
export const REQUIRED_INVOICE_COLUMNS = [
  'invoice_id', 'cust_number', 'customer_name', 'sector',
  'payment_term_days', 'invoice_amount', 'issue_date', 'due_date', 'status',
];

// Demo business parameters - see module docstring. Override with real
// figures once a real business's opening cash / daily burn is known.
export const DEFAULT_OPENING_CASH = Number(process.env.DEMO_OPENING_CASH ?? 2_000_000);
export const DEFAULT_DAILY_EXPENSE = Number(process.env.DEMO_DAILY_EXPENSE ?? 150_000);
export const DEFAULT_MIN_BUFFER = Number(process.env.DEMO_MIN_BUFFER ?? 1_000_000);
export const DEFAULT_N_SIMS = Number(process.env.DEMO_N_SIMS ?? 3000);

// Risk graph stays demo-legible instead of rendering the entire overdue
// backlog as one hairball - see AI_models/risk_graph/build_risk_graph.py.
export const RISK_GRAPH_MAX_FOCUS_INVOICES = Number(process.env.RISK_GRAPH_MAX_FOCUS_INVOICES ?? 12);

export const CORS_ORIGINS = (
  process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173'
).split(',');
