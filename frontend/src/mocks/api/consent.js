import { mockRequest } from '@/lib/api';
import { recordAuditEvent } from './auditLog';

/**
 * GET/PUT /api/consent — PRD Section 6 `ConsentState`.
 *
 * Held in module scope so a consent change made during onboarding is still in
 * effect when Settings is opened later in the same session.
 *
 * @typedef {Object} ConsentState
 * @property {boolean} allowInvoiceAnalysis
 * @property {boolean} allowPaymentHistoryAnalysis
 * @property {boolean} allowForecasting
 * @property {boolean} shareWithLenders  default false — the sensitive scope
 */

/** @type {ConsentState} */
let consentState = {
  allowInvoiceAnalysis: true,
  allowPaymentHistoryAnalysis: true,
  allowForecasting: true,
  shareWithLenders: false,
};

/**
 * Copy lives beside the state so onboarding (PRD 3.2) and settings (PRD 3.8)
 * render identical wording from one source.
 */
export const CONSENT_SCOPES = [
  {
    key: 'allowInvoiceAnalysis',
    title: 'Allow invoice analysis',
    description: 'Lets CashTwin read your uploaded invoices to calculate expected inflows.',
    sensitive: false,
  },
  {
    key: 'allowPaymentHistoryAnalysis',
    title: 'Allow payment-history analysis',
    description:
      'Lets CashTwin learn how late each customer actually pays, so forecasts match reality.',
    sensitive: false,
  },
  {
    key: 'allowForecasting',
    title: 'Allow forecasting',
    description: 'Lets CashTwin project your cash position forward and warn you before a shortfall.',
    sensitive: false,
  },
  {
    key: 'shareWithLenders',
    title: 'Share financial data with lenders',
    description: 'Lets you send a read-only summary to a lender or advisor you choose.',
    sensitive: true,
  },
];

/** @returns {Promise<ConsentState>} */
export function getConsent() {
  return mockRequest(() => ({ ...consentState }));
}

/**
 * Every consent change writes an audit entry (PRD 3.8) — the write happens
 * here rather than at the call site so no screen can update consent silently.
 *
 * @param {Partial<ConsentState>} changes
 * @returns {Promise<ConsentState>}
 */
export function updateConsent(changes) {
  return mockRequest(() => {
    for (const [key, value] of Object.entries(changes)) {
      if (consentState[key] === value) continue;

      const scope = CONSENT_SCOPES.find((s) => s.key === key);
      recordAuditEvent({
        event: value ? `Consent granted: ${scope?.title ?? key}` : `Consent revoked: ${scope?.title ?? key}`,
        actor: 'owner',
        detail: scope?.description,
      });
    }

    consentState = { ...consentState, ...changes };
    return { ...consentState };
  });
}
