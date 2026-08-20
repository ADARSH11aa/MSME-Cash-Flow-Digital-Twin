import { ShieldCheck } from 'lucide-react';
import cn from '@/lib/cn';

/**
 * The recurring "decision support, not a lending decision" statement.
 *
 * PRD 3.1 requires this in the footer of every authenticated screen; PRD 3.6
 * escalates it to a persistent banner at the top of the Recommendations
 * screen, since that is where an owner is closest to acting on a financing
 * option. The `variant` prop covers both placements so the wording can never
 * drift between them.
 *
 * @param {{
 *   variant?: 'footer'|'banner',
 *   onLight?: boolean,
 *   children?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function DisclaimerBar({ variant = 'footer', onLight = false, children, className }) {
  const text =
    children ??
    (variant === 'banner'
      ? 'These are decision-support comparisons. CashTwin does not initiate or approve financing.'
      : 'CashTwin provides decision support only. It does not initiate, approve, or reject lending.');

  if (variant === 'banner') {
    return (
      <div
        role="note"
        className={cn(
          'flex items-start gap-3 border px-4 py-3',
          onLight ? 'border-edge-light bg-light-card' : 'border-info/30 bg-info-8',
          className,
        )}
      >
        <ShieldCheck
          className={cn('mt-0.5 h-4 w-4 shrink-0', onLight ? 'text-ink-lo' : 'text-info')}
          aria-hidden="true"
        />
        <p className={cn('text-body-sm', onLight ? 'text-ink-lo' : 'text-chalk-hi')}>{text}</p>
      </div>
    );
  }

  return (
    <p
      role="note"
      className={cn(
        'text-body-sm',
        onLight ? 'text-ink-lo' : 'text-chalk-lo',
        className,
      )}
    >
      {text}
    </p>
  );
}
