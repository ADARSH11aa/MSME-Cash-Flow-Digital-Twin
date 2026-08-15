import { AlertCircle, CheckCircle2, Clock, MinusCircle } from 'lucide-react';
import cn from '@/lib/cn';

/**
 * Status pill for invoice and obligation state (PRD 3.3).
 *
 * Per Section 7 a pill always carries its text label, never a bare colored
 * dot, and pairs the tone with an icon — so `Overdue` is legible to a
 * color-blind reader on a light table row.
 *
 * @param {{
 *   status: 'paid'|'on_track'|'pending'|'due_soon'|'overdue'|'high'|'medium'|'low',
 *   children?: React.ReactNode,
 *   onLight?: boolean,
 *   className?: string,
 * }} props
 */
export default function Pill({ status, children, onLight = false, className }) {
  const config = {
    paid: { label: 'Paid', tone: 'healthy', Icon: CheckCircle2 },
    on_track: { label: 'On track', tone: 'healthy', Icon: CheckCircle2 },
    pending: { label: 'Pending', tone: 'neutral', Icon: Clock },
    due_soon: { label: 'Due soon', tone: 'watch', Icon: Clock },
    overdue: { label: 'Overdue', tone: 'risk', Icon: AlertCircle },
    // OCR confidence reuses the same palette (PRD 3.3): a low-confidence read
    // is an amber caution, not a failure.
    high: { label: 'High', tone: 'healthy', Icon: CheckCircle2 },
    medium: { label: 'Medium', tone: 'neutral', Icon: MinusCircle },
    low: { label: 'Low', tone: 'watch', Icon: AlertCircle },
  }[status] ?? { label: status, tone: 'neutral', Icon: MinusCircle };

  const { label, tone, Icon } = config;

  const toneClass = {
    healthy: 'border-lime/40 bg-lime-8 text-lime',
    watch: 'border-caution/40 bg-caution-8 text-caution',
    risk: 'border-risk/40 bg-risk-8 text-risk',
    neutral: onLight
      ? 'border-edge-light bg-light text-ink-lo'
      : 'border-edge-dark bg-surface-2 text-chalk-lo',
  }[tone];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-control border px-2 py-0.5',
        'text-label-xs uppercase',
        toneClass,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {children ?? label}
    </span>
  );
}
