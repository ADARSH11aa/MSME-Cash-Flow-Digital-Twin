import { AlertTriangle, CheckCircle2, Info, TrendingDown, TrendingUp } from 'lucide-react';
import cn from '@/lib/cn';
import Figure from './Figure';

/**
 * The big-number tile from the reference frames' stat strip, adapted for
 * financial state (PRD 2.3, 3.4.2).
 *
 * Section 7 rule enforced here: a card in a non-default risk state always
 * renders an icon plus a text state label, so the tone color is reinforcement
 * and never the sole carrier of meaning.
 *
 * @param {{
 *   label: string,
 *   value?: number,
 *   displayValue?: React.ReactNode,
 *   variant?: 'currency'|'currencyShort'|'delta'|'percent',
 *   figureId?: string,
 *   tone?: 'default'|'healthy'|'watch'|'risk',
 *   stateLabel?: string,
 *   caption?: React.ReactNode,
 *   delta?: number,
 *   size?: 'md'|'lg',
 *   animate?: boolean,
 *   className?: string,
 * }} props
 */
export default function StatCard({
  label,
  value,
  displayValue,
  variant = 'currencyShort',
  figureId,
  tone = 'default',
  stateLabel,
  caption,
  delta,
  size = 'md',
  animate = false,
  className,
}) {
  const StateIcon = { healthy: CheckCircle2, watch: AlertTriangle, risk: AlertTriangle, default: Info }[
    tone
  ];

  const toneText = {
    default: 'text-chalk-hi',
    healthy: 'text-lime-ink',
    watch: 'text-caution-ink',
    risk: 'text-risk-ink',
  }[tone];

  const toneBorder = {
    default: 'border-edge-dark',
    healthy: 'border-edge-dark',
    watch: 'border-caution/40',
    risk: 'border-risk/40',
  }[tone];

  return (
    <div
      className={cn(
        // min-w-0 so a long caption cannot widen the grid track it sits in.
        'group flex min-w-0 flex-col justify-between gap-4 rounded-card border bg-surface p-5 shadow-card',
        'transition-[box-shadow,border-color,transform] duration-hover ease-out',
        'hover:-translate-y-0.5 hover:border-chalk-lo/30 hover:shadow-card-hover',
        toneBorder,
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <span className="min-w-0 text-label-xs uppercase text-chalk-lo">{label}</span>
        {stateLabel ? (
          <span className={cn('flex shrink-0 items-center gap-1.5 whitespace-nowrap text-label-xs uppercase', toneText)}>
            <StateIcon className="h-3 w-3" aria-hidden="true" />
            {stateLabel}
          </span>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div
          className={cn(
            'font-display',
            size === 'lg' ? 'text-display-lg' : 'text-display-md',
            toneText,
          )}
        >
          {displayValue ?? (
            <Figure
              value={value}
              variant={variant}
              figureId={figureId}
              animate={animate}
              label={label}
            />
          )}
        </div>

        {delta != null ? (
          <div
            className={cn(
              'flex items-center gap-1.5 text-body-sm',
              delta >= 0 ? 'text-lime-ink' : 'text-risk-ink',
            )}
          >
            {delta >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <Figure value={delta} variant="delta" />
            <span className="text-chalk-lo">vs. today</span>
          </div>
        ) : null}

        {caption ? <p className="text-body-sm text-chalk-lo">{caption}</p> : null}
      </div>
    </div>
  );
}
