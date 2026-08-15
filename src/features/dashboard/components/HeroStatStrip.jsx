import StatCard from '@/components/shared/StatCard';
import useCountUp from '@/hooks/useCountUp';
import { formatDateLong, riskToneForDays } from '@/lib/format';

/**
 * The 3-up stat strip (PRD 3.4.2), reusing the reference's big-number row.
 *
 * Days-to-breach is the largest figure on the screen because it is the one
 * number the product exists to deliver.
 */
/**
 * The single most important number in the product, so it tweens when the
 * horizon changes rather than snapping (PRD 2.4). No-ops under reduced motion.
 */
function DaysToBreach({ days }) {
  const animated = useCountUp(days, { duration: 600 });
  return (
    <span className="flex items-baseline gap-2">
      <span data-numeric className="tabular">
        {Math.round(animated)}
      </span>
      <span className="text-heading-md text-chalk-lo">days</span>
    </span>
  );
}

export default function HeroStatStrip({ data }) {
  const { tone, label } = riskToneForDays(data.daysToBreach);
  const concentrationHigh = data.topCustomerConcentrationPct > 40;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        label="Days to liquidity breach"
        tone={tone}
        stateLabel={label}
        size="lg"
        displayValue={
          data.daysToBreach == null ? (
            <span className="text-display-md">No breach projected</span>
          ) : (
            <DaysToBreach days={data.daysToBreach} />
          )
        }
        caption={
          data.breachDate
            ? `Expected cash may fall below buffer around ${formatDateLong(data.breachDate)}`
            : 'Expected cash stays above your operating buffer across this horizon'
        }
      />

      <StatCard
        label="Projected cash — end of horizon"
        value={data.projectedCashEndOfHorizon}
        variant="currencyShort"
        figureId="projected-cash"
        delta={data.projectedCashEndOfHorizon - data.currentCash}
        animate
      />

      <StatCard
        label="Customer concentration"
        value={data.topCustomerConcentrationPct}
        variant="percent"
        digits={1}
        tone={concentrationHigh ? 'watch' : 'healthy'}
        stateLabel={concentrationHigh ? 'Watch' : 'Balanced'}
        animate
        caption={
          concentrationHigh
            ? 'Over 40% of your receivables sit with a single customer'
            : 'Your receivables are spread across several customers'
        }
      />
    </div>
  );
}
