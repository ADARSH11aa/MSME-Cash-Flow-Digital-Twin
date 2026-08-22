/**
 * POST /api/data/upload-invoices - lets someone replace the demo dataset
 * (AI_models/invoices.csv) with their own CSV, so every already-wired
 * endpoint (dashboard, scenarios, recommendations) starts reflecting real
 * data instead of the synthetic 5,306-invoice dataset.
 *
 * Two copies of invoices.csv exist on disk - AI_models/invoices.csv (what
 * this backend reads directly) and AI_models/data/raw/invoices.csv (what
 * Model 1's own server reads, both at request time for the open-invoice
 * list AND, more importantly, at server-startup time for the per-customer
 * history features it bakes into every prediction). An upload has to
 * overwrite both and then tell Model 1's server to reload, or Model 1 keeps
 * scoring invoices against the OLD customer history while everything else
 * on screen has already moved on to the new data - a confusing, silent
 * inconsistency rather than an error.
 */
import fs from 'node:fs';
import { Router } from 'express';
import multer from 'multer';
import * as bridge from '../aiModelsBridge.js';
import { parseInvoicesCsv, writeInvoicesCsv } from '../lib/csv.js';
import { RAW_INVOICES_PATH, MODEL1_RAW_INVOICES_PATH, REQUIRED_INVOICE_COLUMNS } from '../config.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function isParseableDate(value) {
  return !Number.isNaN(Date.parse(value));
}

router.post('/upload-invoices', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file || !file.originalname.toLowerCase().endsWith('.csv')) {
    res.status(400).json({ detail: 'File must be a .csv' });
    return;
  }

  let rows;
  try {
    rows = parseInvoicesCsv(file.buffer.toString('utf-8'));
  } catch (e) {
    res.status(400).json({ detail: `Could not parse CSV: ${e.message}` });
    return;
  }

  if (rows.length === 0) {
    res.status(400).json({ detail: 'CSV has no rows' });
    return;
  }

  const columns = Object.keys(rows[0]);
  const missing = REQUIRED_INVOICE_COLUMNS.filter((c) => !columns.includes(c));
  if (missing.length > 0) {
    res.status(400).json({
      detail: `CSV is missing required columns: ${JSON.stringify(missing)}. Required: ${JSON.stringify(REQUIRED_INVOICE_COLUMNS)}`,
    });
    return;
  }

  const badDates = rows.some((r) => !isParseableDate(r.issue_date) || !isParseableDate(r.due_date));
  if (badDates) {
    res.status(400).json({ detail: 'issue_date/due_date must be parseable dates' });
    return;
  }

  for (const path of [RAW_INVOICES_PATH, MODEL1_RAW_INVOICES_PATH]) {
    fs.copyFileSync(path, `${path}.backup`);
  }
  writeInvoicesCsv(RAW_INVOICES_PATH, rows);
  writeInvoicesCsv(MODEL1_RAW_INVOICES_PATH, rows);

  bridge.reloadModel1()
    .then((reloadResult) => {
      const statusBreakdown = {};
      const customerIds = new Set();
      for (const r of rows) {
        statusBreakdown[r.status] = (statusBreakdown[r.status] ?? 0) + 1;
        customerIds.add(r.cust_number);
      }

      res.json({
        status: 'ok',
        rowCount: rows.length,
        customerCount: customerIds.size,
        statusBreakdown,
        model1Reload: reloadResult,
      });
    })
    .catch((e) => {
      res.status(502).json({
        detail: `CSV saved, but Model 1's server could not reload it (is it running on port 8000?): ${e.message}`,
      });
    });
});

export default router;
