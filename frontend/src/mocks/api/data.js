import { request } from '@/lib/api';

/**
 * POST /api/data/upload-invoices — backend/app/routers/data.py.
 *
 * The only genuinely "live" data-source call in this file — everything in
 * mocks/api/auditLog.js, consent.js, and lineage.js is still in-memory mock
 * state, but this one really does replace AI_models/invoices.csv on disk
 * and reload Model 1, so every other wired screen reflects it afterward.
 *
 * @param {File} file
 * @returns {Promise<{ status: string, rowCount: number, customerCount: number, statusBreakdown: object }>}
 */
export function uploadInvoices(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('/api/data/upload-invoices', { method: 'POST', body: formData });
}
