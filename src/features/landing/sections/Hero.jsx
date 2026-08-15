import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import BracketFrame from '@/components/shared/BracketFrame';
import Button from '@/components/shared/Button';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import Figure from '@/components/shared/Figure';
import useCountUp from '@/hooks/useCountUp';
import { buildForecast } from '@/mocks/fixtures/forecastEngine';
import { BUSINESS } from '@/mocks/fixtures/business';
import { formatDateLong } from '@/lib/format';

/**
 * Hero (PRD 3.1.2). The reference frames put a chat transcript here; this
 * product's equivalent is a live-looking forecast preview — the one place the
 * PRD asks for a bold visual risk.
 */
export default function Hero() {
  const prefersReduced = useReducedMotion();
  const { daysToBreach, breachDate, forecast } = buildForecast({ horizon: 30 });

  return (
    <section className="relative overflow-hidden border-b border-edge-dark">
      {/* Ambient glow, echoing the reference's green light bloom. */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 opacity-25 blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--accent-lime) 0%, transparent 65%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-20 text-center md:px-8 md:py-28">
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <EyebrowLabel>Cash-flow intelligence for MSMEs</EyebrowLabel>

          <h1 className="mt-7 max-w-4xl font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-chalk-hi sm:text-[52px] md:text-display-xl">
            Know your cash crunch
            <br />
            <span className="text-lime">before it happens.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-body-md text-chalk-lo md:text-[17px]">
            CashTwin models where your cash is heading — not just where it has been. See when your
            cash flow is likely to break, why, and the lowest-cost ways to recover.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/onboarding">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/app">
                <PlayCircle className="h-4 w-4" /> Watch demo
              </Link>
            </Button>
          </div>
        </motion.div>

        <ForecastPreview
          daysToBreach={daysToBreach}
          breachDate={breachDate}
          forecast={forecast}
          prefersReduced={prefersReduced}
        />
      </div>
    </section>
  );
}

/**
 * The signature element: a miniature of the real dashboard, with the
 * days-to-breach number counting in.
 */
function ForecastPreview({ daysToBreach, breachDate, forecast, prefersReduced }) {
  const days = useCountUp(daysToBreach ?? 0, { duration: 900 });

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0.01 : 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16"
    >
      <BracketFrame tone="accent" className="mx-auto max-w-3xl">
        <div className="border border-edge-dark bg-surface p-6 text-left md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <EyebrowLabel tone="watch">Liquidity status</EyebrowLabel>
              <p className="mt-4 flex items-baseline gap-2.5">
                <span
                  data-numeric
                  className="font-display text-[56px] leading-none tabular text-caution"
                >
                  {Math.round(days)}
                </span>
                <span className="font-display text-display-md text-chalk-hi">days</span>
              </p>
              <p className="mt-2 text-body-sm text-chalk-lo">
                until cash may fall below your operating buffer
                {breachDate ? ` — around ${formatDateLong(breachDate)}` : ''}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <dt className="text-label-xs uppercase text-chalk-lo">Cash today</dt>
                <dd className="mt-1 font-display text-heading-md text-chalk-hi">
                  <Figure value={BUSINESS.currentCash} variant="currencyShort" />
                </dd>
              </div>
              <div>
                <dt className="text-label-xs uppercase text-chalk-lo">Min buffer</dt>
                <dd className="mt-1 font-display text-heading-md text-chalk-hi">
                  <Figure value={BUSINESS.minimumBuffer} variant="currencyShort" />
                </dd>
              </div>
            </dl>
          </div>

          <Sparkline forecast={forecast} buffer={BUSINESS.minimumBuffer} />

          <p className="mt-4 text-body-sm text-chalk-lo">
            Think of it like a maps app for your cash flow — where you are, the roadblock ahead, and
            the routes around it.
          </p>
        </div>
      </BracketFrame>
    </motion.div>
  );
}

/** Lightweight inline sparkline — no chart library needed for a preview. */
function Sparkline({ forecast, buffer }) {
  const width = 720;
  const height = 90;
  const values = forecast.map((p) => p.expected);
  const min = Math.min(...values, buffer) * 0.9;
  const max = Math.max(...values) * 1.05;

  const x = (i) => (i / (values.length - 1)) * width;
  const y = (v) => height - ((v - min) / (max - min)) * height;

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-7 h-24 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Projected cash declining toward the minimum operating buffer over the next 30 days."
    >
      <defs>
        <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--risk-amber)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--risk-amber)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1="0"
        x2={width}
        y1={y(buffer)}
        y2={y(buffer)}
        stroke="var(--risk-red)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <path d={area} fill="url(#hero-spark)" />
      <path d={line} fill="none" stroke="var(--risk-amber)" strokeWidth="2.5" />
    </svg>
  );
}
