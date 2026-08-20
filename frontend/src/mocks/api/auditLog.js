import { mockRequest } from '@/lib/api';
import { dateFromToday } from '../fixtures/business';

/**
 * GET /api/audit-log — PRD Section 6 `AuditEvent`.
 *
 * @typedef {Object} AuditEvent
 * @property {string} id
 * @property {string} event
 * @property {'owner'|'system'} actor
 * @property {string} timestamp  ISO
 * @property {string} [detail]
 */

/** Seeded history, newest last; the list is reversed on read. */
let events = [
  {
    id: 'evt-1',
    event: 'Consent granted: Allow invoice analysis',
    actor: 'owner',
    timestamp: `${dateFromToday(-21)}T09:04:00Z`,
    detail: 'Granted during initial onboarding.',
  },
  {
    id: 'evt-2',
    event: 'Consent granted: Allow forecasting',
    actor: 'owner',
    timestamp: `${dateFromToday(-21)}T09:04:12Z`,
  },
  {
    id: 'evt-3',
    event: 'Invoice batch imported',
    actor: 'system',
    timestamp: `${dateFromToday(-21)}T09:11:00Z`,
    detail: '7 invoices read via OCR. 1 field flagged low confidence.',
  },
  {
    id: 'evt-4',
    event: 'Forecast recalculated',
    actor: 'system',
    timestamp: `${dateFromToday(-14)}T06:00:00Z`,
    detail: 'Scheduled daily recalculation.',
  },
  {
    id: 'evt-5',
    event: 'Invoice value corrected',
    actor: 'owner',
    timestamp: `${dateFromToday(-3)}T10:22:00Z`,
    detail: 'INV-2296 changed from ₹2,85,000 to ₹2,64,000. Forecast recalculated.',
  },
  {
    id: 'evt-6',
    event: 'Liquidity warning raised',
    actor: 'system',
    timestamp: `${dateFromToday(-1)}T06:00:00Z`,
    detail: 'Projected cash falls below operating buffer inside the 30-day horizon.',
  },
];

let nextId = events.length + 1;

/** @returns {Promise<AuditEvent[]>} newest first */
export function getAuditLog() {
  return mockRequest(() => [...events].reverse());
}

/**
 * Append an entry. Called by the consent and correction paths rather than by
 * screens directly, so the log cannot drift from what actually happened.
 *
 * @param {{ event: string, actor: 'owner'|'system', detail?: string }} entry
 */
export function recordAuditEvent({ event, actor, detail }) {
  const record = {
    id: `evt-${nextId++}`,
    event,
    actor,
    detail,
    timestamp: new Date().toISOString(),
  };
  events = [...events, record];
  return record;
}
