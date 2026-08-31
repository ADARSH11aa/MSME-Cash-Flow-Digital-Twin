import { Check, Clock } from 'lucide-react';
import cn from '@/lib/cn';
import Button from './Button';
import BracketFrame from './BracketFrame';
import EyebrowLabel from './EyebrowLabel';
import Figure from './Figure';

/**
 * A recovery strategy presented in the reference frames' pricing-card form
 * (PRD 3.6): comparable options laid out side by side, with one visually
 * elevated the way the reference elevates its middle "Plus" plan.
 *
 * The elevated slot is given to the lowest-cost non-debt option, so the
 * product's non-debt-first ranking is carried by the layout itself and not
 * only by the copy.
 *
 * @param {{
 *   recommendation: {
 *     id: string,
 *     strategy: string,
 *     category: 'internal'|'commercial'|'invoice_finance'|'working_capital',
 *     illustrativeCost: number,
 *     recoveryTimeDays: number,
 *     liquidityImpact: string,
 *     isRecommended: boolean,
 *     goal?: string,
 *     features?: string[],
 *   },
 *   onSimulate?: (recommendation: object) => void,
 *   className?: string,
 * }} props
 */
export default function RecommendationCard({ recommendation, onSimulate, className }) {
  const {
    strategy,
    category,
    illustrativeCost,
    recoveryTimeDays,
    liquidityImpact,
    isRecommended,
    goal,
    features = [],
  } = recommendation;

  const categoryLabel =
    {
      internal: 'Internal action',
      commercial: 'Commercial action',
      invoice_finance: 'Invoice finance',
      working_capital: 'Working capital',
      // A statutory entitlement, not a strategy anyone has to negotiate.
      legal: 'Statutory right',
    }[category] ?? 'Recovery option';

  // Debt-bearing options are labelled as such up front rather than being
  // distinguished only by their position in the row.
  const isDebt = category === 'invoice_finance' || category === 'working_capital';

  const card = (
    <div
      className={cn(
        'flex h-full w-full flex-col gap-6 rounded-card border p-6 shadow-card',
        'transition-[box-shadow,border-color,transform] duration-hover ease-out',
        'hover:-translate-y-0.5 hover:shadow-card-hover',
        isRecommended
          ? 'border-lime/50 bg-surface-2'
          : 'border-edge-dark bg-surface hover:border-chalk-lo/30',
      )}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <EyebrowLabel tone={isDebt ? 'watch' : 'healthy'}>{categoryLabel}</EyebrowLabel>
          {isRecommended ? (
            <span className="rounded-control bg-lime px-2 py-1 text-label-xs uppercase text-ink-hi">
              Recommended
            </span>
          ) : null}
        </div>

        <h3 className="font-display text-heading-md text-chalk-hi">{strategy}</h3>
        {goal ? <p className="text-body-sm text-chalk-lo">{goal}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4 border-y border-edge-dark py-5">
        <div className="space-y-1">
          <span className="block text-label-xs uppercase text-chalk-lo">Illustrative cost</span>
          <span
            data-numeric
            className={cn(
              'block font-display text-display-md tabular',
              illustrativeCost === 0 ? 'text-lime' : 'text-chalk-hi',
            )}
          >
            {illustrativeCost === 0 ? (
              '₹0'
            ) : (
              <Figure value={illustrativeCost} variant="currencyShort" label={`${strategy} cost`} />
            )}
          </span>
        </div>

        <div className="space-y-1">
          <span className="block text-label-xs uppercase text-chalk-lo">Recovery time</span>
          <span className="flex items-baseline gap-1.5 font-display text-display-md text-chalk-hi">
            <span data-numeric className="tabular">
              {recoveryTimeDays}
            </span>
            <span className="text-body-sm text-chalk-lo">days</span>
          </span>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5">
        <li className="flex items-start gap-2 text-body-sm text-chalk-hi">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chalk-lo" aria-hidden="true" />
          {liquidityImpact}
        </li>
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-body-sm text-chalk-lo">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={isRecommended ? 'primary' : 'secondary'}
        onClick={() => onSimulate?.(recommendation)}
        className="w-full"
      >
        Simulate this
      </Button>
    </div>
  );

  // The recommended option gets the bracket-corner treatment, matching how the
  // reference marks its one focal card.
  return isRecommended ? (
    <BracketFrame tone="accent" className={cn('h-full', className)}>
      {card}
    </BracketFrame>
  ) : (
    <div className={cn('h-full', className)}>{card}</div>
  );
}
