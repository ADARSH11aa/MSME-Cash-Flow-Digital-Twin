/**
 * Currency and date formatting for an Indian MSME audience.
 *
 * Rupee figures use the Indian digit grouping (2,2,3 — e.g. ₹12,34,567) and
 * lakh/crore abbreviations, because that is how the owner reading this screen
 * thinks about the numbers. Anything rendered through these helpers should
 * carry `data-numeric` so it picks up tabular numerals (see index.css).
 */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const INR_PRECISE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Full rupee figure with Indian grouping. `₹3,24,500`
 * @param {number} value
 * @param {{ precise?: boolean }} [options]
 * @returns {string}
 */
export function formatCurrency(value, options = {}) {
  if (value == null || Number.isNaN(value)) return '—';
  return options.precise ? INR_PRECISE.format(value) : INR.format(value);
}

/**
 * Abbreviated rupee figure for headline stats and chart axes.
 * `₹3.2L`, `₹1.4Cr`, `₹8,500`. Negative values keep the sign outside the
 * symbol (`-₹1.2L`) so a cash shortfall reads unambiguously.
 * @param {number} value
 * @returns {string}
 */
export function formatCurrencyShort(value) {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (abs >= 1_00_00_000) return `${sign}₹${trimZero(abs / 1_00_00_000)}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${trimZero(abs / 1_00_000)}L`;
  if (abs >= 1_000) return `${sign}₹${trimZero(abs / 1_000)}K`;
  return `${sign}₹${Math.round(abs)}`;
}

/** @param {number} n */
function trimZero(n) {
  return n.toFixed(1).replace(/\.0$/, '');
}

/**
 * Signed delta for "vs. today" captions. `+₹42.0K` / `-₹1.2L`
 * @param {number} value
 * @returns {string}
 */
export function formatDelta(value) {
  if (value == null || Number.isNaN(value)) return '—';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${formatCurrencyShort(value)}`;
}

/**
 * @param {number} value 0-100
 * @param {number} [digits]
 * @returns {string}
 */
export function formatPercent(value, digits = 0) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(digits)}%`;
}

/**
 * `12 Aug` — compact axis/list label.
 * @param {string} iso
 * @returns {string}
 */
export function formatDateShort(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * `12 August 2026` — prose dates in body copy.
 * @param {string} iso
 * @returns {string}
 */
export function formatDateLong(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * `12 Aug 2026, 14:32` — audit-log timestamps.
 * @param {string} iso
 * @returns {string}
 */
export function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
}

/**
 * Whole days between two ISO dates (b - a).
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function daysBetween(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / MS);
}

/**
 * Map a days-to-breach figure onto the semantic risk palette.
 * PRD 3.4.2: lime >45 days, amber 15-45, red <15. `null` = no breach
 * projected within the horizon, which is the healthy case.
 *
 * Returned `label` exists so the caller can satisfy the Section 7 rule that
 * risk state is never signalled by color alone.
 *
 * @param {number|null} days
 * @returns {{ tone: 'healthy'|'watch'|'risk', label: string }}
 */
export function riskToneForDays(days) {
  if (days == null) return { tone: 'healthy', label: 'No breach projected' };
  if (days < 15) return { tone: 'risk', label: 'At risk' };
  if (days <= 45) return { tone: 'watch', label: 'Watch' };
  return { tone: 'healthy', label: 'Healthy' };
}
