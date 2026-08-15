import { forwardRef } from 'react';
import cn from '@/lib/cn';
import { formatCurrency, formatCurrencyShort, formatDelta, formatPercent } from '@/lib/format';
import useCountUp from '@/hooks/useCountUp';
import useLineage from '@/hooks/useLineage';

/**
 * The single component through which every currency, percentage and delta in
 * the product is rendered.
 *
 * Three product rules are enforced here once, rather than being re-remembered
 * at each of the ~40 places a number appears:
 *
 *  1. `data-numeric` is always set, so tabular numerals apply even when the
 *     figure is rendered outside a table cell (index.css keys off it).
 *  2. Passing `figureId` makes the number a real <button> that opens the
 *     lineage drawer (PRD 3.7) — keyboard-reachable, not a click handler on a
 *     <span>.
 *  3. `animate` routes the value through the count-up tween from PRD 2.4,
 *     which no-ops under prefers-reduced-motion.
 *
 * @param {{
 *   value: number,
 *   variant?: 'currency'|'currencyShort'|'delta'|'percent',
 *   figureId?: string,
 *   animate?: boolean,
 *   tone?: 'default'|'healthy'|'watch'|'risk'|'muted',
 *   precise?: boolean,
 *   digits?: number,
 *   className?: string,
 *   label?: string,
 * }} props
 */
const Figure = forwardRef(function Figure(
  {
    value,
    variant = 'currency',
    figureId,
    animate = false,
    tone = 'default',
    precise = false,
    digits = 0,
    className,
    label,
    ...rest
  },
  ref,
) {
  const { openLineage, available } = useLineage();
  const animated = useCountUp(value, { enabled: animate });
  const shown = animate ? animated : value;

  const text = {
    currency: () => formatCurrency(Math.round(shown), { precise }),
    currencyShort: () => formatCurrencyShort(shown),
    delta: () => formatDelta(Math.round(shown)),
    percent: () => formatPercent(shown, digits),
  }[variant]();

  const toneClass = {
    default: '',
    healthy: 'text-lime',
    watch: 'text-caution',
    risk: 'text-risk',
    muted: 'text-chalk-lo',
  }[tone];

  const interactive = Boolean(figureId) && available;

  if (!interactive) {
    return (
      <span ref={ref} data-numeric className={cn('tabular', toneClass, className)} {...rest}>
        {text}
      </span>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      data-numeric
      onClick={() => openLineage(figureId)}
      // Dotted underline is the affordance that this figure can be opened up.
      // It is a border rather than text-decoration so it sits clear of the
      // descenders on large display numerals.
      className={cn(
        'tabular border-b border-dashed border-current/40 transition-colors',
        'hover:border-current hover:text-lime',
        toneClass,
        className,
      )}
      aria-label={label ? `${label}: ${text}. Show how this was calculated` : undefined}
      title="Show how this was calculated"
      {...rest}
    >
      {text}
    </button>
  );
});

export default Figure;
