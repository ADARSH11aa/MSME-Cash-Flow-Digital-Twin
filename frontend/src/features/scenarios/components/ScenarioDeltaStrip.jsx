import { ArrowRight, CalendarClock, Lightbulb, Wallet } from 'lucide-react';
import cn from '@/lib/cn';
import Figure from '@/components/shared/Figure';
import useCountUp from '@/hooks/useCountUp';
import { formatCurrencyShort, riskToneForDays } from '@/lib/format';

/**
 * The before/after delta strip (PRD 3.5) — the product's key moment, so the
 * numbers tween rather than snap (PRD 2.4). `useCountUp` no-ops entirely under
 * prefers-reduced-motion.
 *
 * The "before" figure only renders when the scenario actually moved it. Showing
 * `12 → 12` with the first value struck through read as a rendering fault
 * rather than as "nothing changed".
 */

const TONE = {
  healthy: { text: 'text-lime-ink', rule: 'bg-lime', wash: 'bg-lime-8 text-lime-ink', border: 'border-edge-dark' },
  watch: { text: 'text-caution-ink', rule: 'bg-caution', wash: 'bg-caution-8 text-caution-ink', border: 'border-caution/40' },
  risk: { text: 'text-risk-ink', rule: 'bg-risk', wash: 'bg-risk-8 text-risk-ink', border: 'border-risk/40' },
};

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
    <div className="grid gap-4 lg:grid-cols-3">
      <DaysCard
        before={daysToBreachBefore}
        after={daysToBreachAfter}
        delta={daysDelta}
        risk={riskToneForDays(daysToBreachAfter)}
      />

      <CashCard before={projectedCashBefore} after={projectedCashAfter} />

      <MeaningCard daysDelta={daysDelta} />
    </div>
  );
}

/** Shared card chrome: top rule in the card's tone, then a labelled header row. */
function DeltaCard({ tone, rule, icon: Icon, label, badge, children }) {
  return (
    <div
      className={cn(
        'relative min-w-0 overflow-hidden rounded-card border bg-surface p-5 pt-6',
        'transition-shadow duration-200 ease-out hover:shadow-card-light',
        tone.border,
      )}
    >
      {/* A 3px tone rule gives each card a read at a glance, which a hairline
          cream border on white cannot. */}
      <span className={cn('absolute inset-x-0 top-0 h-[3px]', rule)} aria-hidden="true" />

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className="flex min-w-0 items-center gap-2 text-label-xs uppercase text-chalk-lo">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {label}
        </span>
        {badge}
      </div>

      {children}
    </div>
  );
}

function DaysCard({ before, after, delta, risk }) {
  const tone = TONE[risk.tone];
  const animated = useCountUp(after ?? 0);
  const changed = delta != null && delta !== 0;

  return (
    <DeltaCard
      tone={tone}
      rule={tone.rule}
      icon={CalendarClock}
      label="Days to breach"
      badge={
        <span className={cn('shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-label-xs uppercase', tone.wash)}>
          {risk.label}
        </span>
      }
    >
      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        {changed ? (
          <>
            <span data-numeric className="tabular text-heading-md text-chalk-lo/70 line-through">
              {before}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 self-center text-chalk-lo/60" aria-hidden="true" />
          </>
        ) : null}
        <span
          data-numeric
          className={cn('font-display text-display-lg leading-none tabular', tone.text)}
        >
          {after == null ? 'None' : Math.round(animated)}
        </span>
        {/* No unit when there is no breach — "— days" read as a figure that
            had failed to load rather than as an absence of one. */}
        {after == null ? null : (
          <span className="font-sans text-heading-md font-medium text-chalk-lo">days</span>
        )}
      </div>

      {changed ? (
        <p
          className={cn(
            'mt-3 inline-flex items-center rounded-full px-2 py-0.5 text-body-sm font-medium',
            delta < 0 ? 'bg-risk-8 text-risk-ink' : 'bg-lime-8 text-lime-ink',
          )}
        >
          <span data-numeric className="tabular">
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
          <span className="ml-1">days {delta < 0 ? 'sooner' : 'later'}</span>
        </p>
      ) : (
        <p className="mt-3 text-body-sm text-chalk-lo">Unchanged by this scenario</p>
      )}
    </DeltaCard>
  );
}

function CashCard({ before, after }) {
  const delta = after - before;
  const changed = delta !== 0;
  const positive = delta >= 0;

  // Both figures render through formatCurrencyShort, precise to one decimal
  // of a crore - so a real ₹2L move on a ₹3.6Cr balance is `changed` but
  // draws "₹3.6Cr → ₹3.6Cr", the struck-through rendering fault this
  // component's docstring exists to prevent. The delta pill still carries the
  // move (and is the only place it is legible at this scale); only the
  // before/after transition is suppressed, since it would show two identical
  // figures either side of an arrow.
  const transitionVisible = changed && formatCurrencyShort(before) !== formatCurrencyShort(after);

  return (
    <DeltaCard
      tone={{ border: changed && !positive ? 'border-risk/40' : 'border-edge-dark' }}
      rule={changed ? (positive ? 'bg-lime' : 'bg-risk') : 'bg-edge-dark'}
      icon={Wallet}
      label="Projected cash"
    >
      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        {transitionVisible ? (
          <>
            <span data-numeric className="tabular text-heading-md text-chalk-lo/70 line-through">
              <Figure value={before} variant="currencyShort" />
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 self-center text-chalk-lo/60" aria-hidden="true" />
          </>
        ) : null}
        <span
          className={cn(
            'font-display text-display-lg',
            changed ? (positive ? 'text-lime-ink' : 'text-risk-ink') : 'text-chalk-hi',
          )}
        >
          <Figure value={after} variant="currencyShort" animate />
        </span>
      </div>

      {changed ? (
        <p
          className={cn(
            'mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-body-sm font-medium',
            positive ? 'bg-lime-8 text-lime-ink' : 'bg-risk-8 text-risk-ink',
          )}
        >
          <Figure value={delta} variant="delta" />
          <span>at end of horizon</span>
        </p>
      ) : (
        <p className="mt-3 text-body-sm text-chalk-lo">Unchanged at end of horizon</p>
      )}
    </DeltaCard>
  );
}

/**
 * The plain-language read-out. It sits on the same white surface as the two
 * number cards so the strip reads as one row; the gradient rule and the larger
 * display type carry the emphasis instead of a dark ground.
 */
function MeaningCard({ daysDelta }) {
  const sentence =
    daysDelta == null
      ? 'This scenario does not push you below your buffer inside the horizon.'
      : daysDelta < 0
        ? `You lose ${Math.abs(daysDelta)} days of runway under these assumptions.`
        : daysDelta > 0
          ? `You gain ${daysDelta} days of runway under these assumptions.`
          : 'Runway is unchanged under these assumptions.';

  return (
    <div
      className={cn(
        'relative min-w-0 overflow-hidden rounded-card border border-edge-dark bg-surface p-5 pt-6',
        'transition-shadow duration-200 ease-out hover:shadow-card-light',
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-lime via-cyan to-info"
        aria-hidden="true"
      />
      <span className="flex items-center gap-2 text-label-xs uppercase text-chalk-lo">
        <Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        What this means
      </span>
      <p className="mt-4 font-display text-heading-md leading-snug text-chalk-hi">{sentence}</p>
    </div>
  );
}
