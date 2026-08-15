import { ArrowRight, Lightbulb, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BracketFrame from '@/components/shared/BracketFrame';
import Button from '@/components/shared/Button';
import EmptyState from '@/components/shared/EmptyState';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import ForecastChart from '@/components/shared/ForecastChart';
import RiskGraph from '@/components/shared/RiskGraph';
import SegmentedToggle from '@/components/shared/SegmentedToggle';
import useAsync from '@/hooks/useAsync';
import { formatDateLong } from '@/lib/format';
import {
  getBufferPressure,
  getConcentrationBreakdown,
  getDashboard,
  getPaymentBehaviour,
} from '@/mocks/api/dashboard';
import HeroStatStrip from './components/HeroStatStrip';
import ObligationsList from './components/ObligationsList';
import RiskBreakdownRow from './components/RiskBreakdownRow';

/**
 * Dashboard (PRD 3.4) — the digital twin view and the product's home screen.
 */
export default function DashboardPage() {
  const [horizon, setHorizon] = useState(30);

  const { data, loading } = useAsync(() => getDashboard(horizon), [horizon]);
  const { data: behaviour } = useAsync(() => getPaymentBehaviour(), []);
  const { data: concentration } = useAsync(() => getConcentrationBreakdown(), []);
  const { data: buffer } = useAsync(() => getBufferPressure(horizon), [horizon]);

  if (loading && !data) return <DashboardSkeleton />;

  if (data && data.forecast.length === 0) {
    return (
      <div className="px-5 py-8 md:px-8">
        <EmptyState
          title="Your twin has nothing to model yet"
          body="Import your first invoice to see your 30-day forecast."
          actionLabel="Import data"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-5 py-8 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <EyebrowLabel>Liquidity status</EyebrowLabel>
          <h1 className="mt-3 font-display text-display-md text-chalk-hi">{data.businessName}</h1>
          <p className="mt-1 text-body-sm text-chalk-lo">
            As of {formatDateLong(new Date().toISOString())}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SegmentedToggle
            label="Forecast horizon"
            value={horizon}
            onChange={setHorizon}
            size="sm"
            options={[
              { value: 7, label: '7 days' },
              { value: 30, label: '30 days' },
              { value: 60, label: '60 days' },
              { value: 90, label: '90 days' },
            ]}
          />
          <Button asChild variant="secondary" size="sm">
            <Link to="/app/scenarios">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Ask a scenario
            </Link>
          </Button>
        </div>
      </header>

      <HeroStatStrip data={data} />

      <section className="border border-edge-dark bg-surface p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-heading-md text-chalk-hi">Cash-flow forecast</h2>
          <ChartLegend />
        </div>
        <ForecastChart
          forecast={data.forecast}
          minimumBuffer={data.minimumBuffer}
          height={340}
          ariaSummary={
            data.daysToBreach == null
              ? `Projected cash stays above the minimum buffer for the next ${horizon} days.`
              : `Projected cash falls below the minimum operating buffer after ${data.daysToBreach} days, around ${formatDateLong(data.breachDate)}.`
          }
        />
      </section>

      {behaviour && concentration && buffer ? (
        <RiskBreakdownRow
          concentration={concentration}
          behaviour={behaviour}
          buffer={buffer}
          minimumBuffer={data.minimumBuffer}
        />
      ) : null}

      {/* The one bracket-framed card on this screen — PRD 2.3 reserves the
          motif for the single thing the owner should look at first. */}
      <BracketFrame tone="risk">
        <section className="border border-edge-dark bg-surface p-6">
          <EyebrowLabel tone="risk">Why this risk exists</EyebrowLabel>
          <h2 className="mt-4 font-display text-heading-md text-chalk-hi">
            The chain behind your projected shortfall
          </h2>
          <p className="mt-2 max-w-2xl text-body-sm text-chalk-lo">
            Each step traces to real records. Select any node to open the invoices behind it.
          </p>
          <div className="mt-8">
            <RiskGraph nodes={data.riskGraph.nodes} edges={data.riskGraph.edges} />
          </div>
        </section>
      </BracketFrame>

      <ObligationsList obligations={data.upcomingObligations} />

      <div className="grid gap-4 sm:grid-cols-2">
        <NextStepCard
          to="/app/scenarios"
          Icon={SlidersHorizontal}
          title="Run a scenario"
          body="Test a late payment, a sales drop or a cost rise against this forecast."
        />
        <NextStepCard
          to="/app/recommendations"
          Icon={Lightbulb}
          title="View recommendations"
          body="Compare recovery options, cheapest and least risky first."
        />
      </div>
    </div>
  );
}

function ChartLegend() {
  const items = [
    { label: 'Optimistic', color: 'bg-viz-optimistic' },
    { label: 'Expected', color: 'bg-viz-expected' },
    { label: 'Pessimistic', color: 'bg-viz-pessimistic' },
  ];
  return (
    <ul className="flex flex-wrap items-center gap-4">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-label-xs uppercase text-chalk-lo">
          <span className={`h-0.5 w-4 ${item.color}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function NextStepCard({ to, Icon, title, body }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 border border-edge-dark bg-surface p-5 transition-colors hover:border-chalk-lo/40 hover:bg-surface-2"
    >
      <Icon className="h-5 w-5 shrink-0 text-lime" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-heading-md text-chalk-hi">{title}</p>
        <p className="mt-1 text-body-sm text-chalk-lo">{body}</p>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-chalk-lo transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 px-5 py-8 md:px-8" aria-busy="true" aria-label="Loading your forecast">
      <div className="h-16 w-72 animate-pulse bg-surface" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse border border-edge-dark bg-surface" />
        ))}
      </div>
      <div className="h-96 animate-pulse border border-edge-dark bg-surface" />
    </div>
  );
}
