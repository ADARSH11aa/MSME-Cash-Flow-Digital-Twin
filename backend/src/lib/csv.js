/**
 * Thin CSV read/write helpers so the rest of the codebase deals in plain
 * arrays of row objects, never a CSV library directly. Numeric-looking
 * columns are left as strings on read except where a caller explicitly
 * needs a number (pandas auto-infers dtypes; this doesn't, so callers must
 * coerce the specific fields they use - see adapters for where that happens).
 */
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export function parseInvoicesCsv(csvText) {
  return parse(csvText, { columns: true, skip_empty_lines: true });
}

export function readInvoicesCsv(filePath) {
  return parseInvoicesCsv(fs.readFileSync(filePath, 'utf-8'));
}

export function writeInvoicesCsv(filePath, rows) {
  const csvText = stringify(rows, { header: true });
  fs.writeFileSync(filePath, csvText);
}
