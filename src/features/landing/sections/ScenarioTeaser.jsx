import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/shared/Button';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import ForecastChart from '@/components/shared/ForecastChart';
import { BUSINESS } from '@/mocks/fixtures/business';
import { buildForecast } from '@/mocks/fixtures/forecastEngine';
import Reveal from './Reveal';

/**
 * Scenario teaser (PRD 3.1 nav target) — shows the real chart component with
 * the "largest customer pays 30 days late" shock already applied, so the
 * landing page demonstrates the product rather than describing it.
 */
export default function ScenarioTeaser() {
  const base = buildForecast({ horizon: 60 });
  const shocked = buildForecast({
    horizon: 60,
    shocks: { customerDelay: { customerId: 'cust-sharma', days: 30 } },
  });

  return (
    <section id="scenarios" className="border-b border-edge-dark py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-center">
          <Reveal>
            <EyebrowLabel tone="risk">Stress testing</EyebrowLabel>
            <h2 className="mt-6 font-display text-[32px] leading-tight tracking-[-0.02em] text-chalk-hi md:text-display-lg">
              What if your biggest customer pays late?
            </h2>
            <p className="mt-5 text-body-md text-chalk-lo">
              Move one assumption and the whole projection recalculates in front of you. Here,
              delaying a single customer by 30 days pulls the breach forward from{' '}
              <span data-numeric className="tabular text-caution">
                {base.daysToBreach}
              </span>{' '}
              days to{' '}
              <span data-numeric className="tabular text-risk">
                {shocked.daysToBreach}
              </span>
              .
            </p>
            <Button asChild variant="secondary" className="mt-8">
              <Link to="/app/scenarios">
                Open the simulator <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>

          <Reveal index={1}>
            <div className="border border-edge-dark bg-surface p-5">
              <ForecastChart
                forecast={shocked.forecast}
                baseline={base.forecast}
                minimumBuffer={BUSINESS.minimumBuffer}
                height={280}
                ariaSummary={`Under a 30-day customer delay, projected cash breaches the minimum buffer after ${shocked.daysToBreach} days instead of ${base.daysToBreach}.`}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
