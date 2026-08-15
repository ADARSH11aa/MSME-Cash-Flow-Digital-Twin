import { ArrowRight } from 'lucide-react';
import cn from '@/lib/cn';
import Figure from '@/components/shared/Figure';
import useCountUp from '@/hooks/useCountUp';
import { riskToneForDays } from '@/lib/format';

/**
 * The before/after delta strip (PRD 3.5) — the product's key moment, so the
 * numbers tween rather than snap (PRD 2.4). `useCountUp` no-ops entirely under
 * prefers-reduced-motion.
 */
export default function ScenarioDeltaStrip({ result }) {
  const {
    daysToBreachBefore,
    daysToBreachAfter,
    projectedCashBefore,
    projectedCashAfter,
  } = result;

  const daysDelta =
    daysToBreachBefore != null && daysToBreachAfter != null
      ? daysToBreachAfter - daysToBreachBefore
      : null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <DeltaCard
        label="Days to breach"
        before={daysToBreachBefore}
        after={daysToBreachAfter}
        delta={daysDelta}
        unit="days"
        tone={riskToneForDays(daysToBreachAfter).tone}
        stateLabel={riskToneForDays(daysToBreachAfter).label}
      />

      <CashCard
        label="Projected cash"
        before={projectedCashBefore}
        after={projectedCashAfter}
      />

      <div className="flex flex-col justify-center gap-2 border border-edge-dark bg-surface p-5">
        <span className="text-label-xs uppercase text-chalk-lo">What this means</span>
        <p className="text-body-sm text-chalk-hi">
          {daysDelta == null
            ? 'This scenario does not push you below your buffer inside the horizon.'
            : daysDelta < 0
              ? `You lose ${Math.abs(daysDelta)} days of runway under these assumptions.`
              : daysDelta > 0
                ? `You gain ${daysDelta} days of runway under these assumptions.`
                : 'Runway is unchanged under these assumptions.'}
        </p>
      </div>
    </div>
  );
}

function DeltaCard({ label, before, after, delta, unit, tone, stateLabel }) {
  const animated = useCountUp(after ?? 0);

  const toneText = {
    healthy: 'text-lime',
    watch: 'text-caution',
    risk: 'text-risk',
  }[tone];

  return (
    <div
      className={cn(
        'min-w-0 border bg-surface p-5',
        tone === 'risk' ? 'border-risk/40' : tone === 'watch' ? 'border-caution/40' : 'border-edge-dark',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-label-xs uppercase text-chalk-lo">{label}</span>
        <span className={cn('text-label-xs uppercase', toneText)}>{stateLabel}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <span data-numeric className="tabular text-heading-md text-chalk-lo line-through">
          {before ?? '—'}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-chalk-lo" aria-hidden="true" />
        <span data-numeric className={cn('font-display text-display-lg tabular', toneText)}>
          {after == null ? '—' : Math.round(animated)}
        </span>
        <span className="text-body-sm text-chalk-lo">{unit}</span>
      </div>

      {delta != null && delta !== 0 ? (
        <p className={cn('mt-2 text-body-sm', delta < 0 ? 'text-risk' : 'text-lime')}>
          <span data-numeric className="tabular">
            {delta > 0 ? '+' : ''}
            {delta}
          </span>{' '}
          {unit} {delta < 0 ? 'sooner' : 'later'}
        </p>
      ) : null}
    </div>
  );
}

function CashCard({ label, before, after }) {
  const delta = after - before;

  return (
    <div className="min-w-0 border border-edge-dark bg-surface p-5">
      <span className="text-label-xs uppercase text-chalk-lo">{label}</span>

      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <span data-numeric className="tabular text-heading-md text-chalk-lo line-through">
          <Figure value={before} variant="currencyShort" />
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-chalk-lo" aria-hidden="true" />
        <span className={cn('font-display text-display-md', delta < 0 ? 'text-risk' : 'text-lime')}>
          <Figure value={after} variant="currencyShort" animate />
        </span>
      </div>

      <p className={cn('mt-2 text-body-sm', delta < 0 ? 'text-risk' : 'text-lime')}>
        <Figure value={delta} variant="delta" /> at end of horizon
      </p>
    </div>
  );
}
