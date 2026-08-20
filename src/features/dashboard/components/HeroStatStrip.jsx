import StatCard from '@/components/shared/StatCard';
import { Stagger, StaggerItem } from '@/components/shared/motion';
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
      <span data-numeric className="tabular text-display-lg leading-none">
        {Math.round(animated)}
      </span>
      {/* The unit is a label, not part of the figure: body face, one weight
          down, muted — so the numeral is unambiguously what you read first. */}
      <span className="font-sans text-heading-md font-medium text-chalk-lo">days</span>
    </span>
  );
}

export default function HeroStatStrip({ data }) {
  const { tone, label } = riskToneForDays(data.daysToBreach);
  const concentrationHigh = data.topCustomerConcentrationPct > 40;

  return (
    <Stagger className="grid gap-4 md:grid-cols-3">
      <StaggerItem className="flex">
        <StatCard
          className="w-full"
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
      </StaggerItem>

      <StaggerItem className="flex">
        <StatCard
          className="w-full"
          label="Projected cash — end of horizon"
          value={data.projectedCashEndOfHorizon}
          variant="currencyShort"
          figureId="projected-cash"
          delta={data.projectedCashEndOfHorizon - data.currentCash}
          animate
        />
      </StaggerItem>

      <StaggerItem className="flex">
        <StatCard
          className="w-full"
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
      </StaggerItem>
    </Stagger>
  );
}
