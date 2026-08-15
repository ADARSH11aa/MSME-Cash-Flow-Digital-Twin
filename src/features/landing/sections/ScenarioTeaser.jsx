import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedButton from '@/components/shared/AnimatedButton';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import ForecastChart from '@/components/shared/ForecastChart';
import { BUSINESS } from '@/mocks/fixtures/business';
import { buildForecast } from '@/mocks/fixtures/forecastEngine';
import Reveal from './Reveal';

/**
 * Scenario teaser (PRD 3.1 nav target) — enhanced with typewriter text reveal,
 * animated line drawing on the graph, and custom AnimatedButton with shine effects.
 */

const HEADLINE = 'What if your largest customer pays late?';

export default function ScenarioTeaser() {
  const prefersReduced = useReducedMotion();
  const [chartKey, setChartKey] = useState(0);

  const base = buildForecast({ horizon: 60 });
  const shocked = buildForecast({
    horizon: 60,
    shocks: { customerDelay: { customerId: 'cust-sharma', days: 30 } },
  });

  return (
    <section id="scenarios" className="border-b border-edge-dark py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center">
          {/* Left Column: Typography & Animated CTA Button */}
          <div className="flex flex-col items-start">
            <Reveal>
              <EyebrowLabel tone="risk">Stress testing</EyebrowLabel>
            </Reveal>

            {/* Typewriter Staggered Headline */}
            <div className="mt-6">
              {prefersReduced ? (
                <h2 className="font-display text-[34px] leading-tight tracking-[-0.02em] text-chalk-hi md:text-display-lg">
                  {HEADLINE}
                </h2>
              ) : (
                <TypewriterHeadline text={HEADLINE} />
              )}
            </div>

            {/* Typewriter / Staggered Paragraph Text */}
            <div className="mt-5">
              {prefersReduced ? (
                <p className="text-body-md text-chalk-lo leading-relaxed">
                  Move one assumption and the whole cash-flow projection recalculates in front of you. Here, delaying a single customer by 30 days pulls your liquidity breach forward from{' '}
                  <span className="tabular font-semibold text-caution">28 days</span> to{' '}
                  <span className="tabular font-semibold text-risk">16 days</span>.
                </p>
              ) : (
                <TypewriterParagraph
                  baseDays={base.daysToBreach}
                  shockedDays={shocked.daysToBreach}
                />
              )}
            </div>

            {/* Animated Button with border/text shine effect */}
            <div className="mt-8">
              <Link to="/app/scenarios" className="inline-block">
                <AnimatedButton className="gap-2">
                  <span>Open the simulator</span>
                  <ArrowRight className="h-4 w-4" />
                </AnimatedButton>
              </Link>
            </div>
          </div>

          {/* Right Column: Animated Graph Container & Line Drawing */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            onViewportEnter={() => setChartKey((k) => k + 1)}
            transition={{
              duration: prefersReduced ? 0.01 : 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="rounded-2xl border border-edge-dark/80 bg-surface p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient top light */}
            <div
              className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-lime/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="flex items-center justify-between pb-4 border-b border-edge-dark/60 mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-risk animate-pulse" />
                <span className="text-body-sm font-semibold text-chalk-hi">Scenario: Sharma 30d Delay</span>
              </div>
              <span className="rounded-full bg-risk-8 border border-risk/20 px-2.5 py-0.5 text-label-xs uppercase font-semibold text-risk">
                Breach in {shocked.daysToBreach}d
              </span>
            </div>

            <ForecastChart
              key={chartKey}
              forecast={shocked.forecast}
              baseline={base.forecast}
              minimumBuffer={BUSINESS.minimumBuffer}
              height={280}
              animate={!prefersReduced}
              ariaSummary={`Under a 30-day customer delay, projected cash breaches the minimum buffer after ${shocked.daysToBreach} days instead of ${base.daysToBreach}.`}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Typewriter character-by-character headline reveal */
function TypewriterHeadline({ text }) {
  const characters = Array.from(text);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.01 },
    },
  };

  return (
    <motion.h2
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      className="font-display text-[34px] leading-tight tracking-[-0.02em] text-chalk-hi md:text-display-lg"
    >
      {characters.map((char, index) => (
        <motion.span key={`${char}-${index}`} variants={charVariants}>
          {char}
        </motion.span>
      ))}
    </motion.h2>
  );
}

/** Typewriter word-by-word paragraph reveal with colored metric highlights */
function TypewriterParagraph({ baseDays, shockedDays }) {
  const wordsPart1 = 'Move one assumption and the whole cash-flow projection recalculates in front of you. Here, delaying a single customer by 30 days pulls your liquidity breach forward from'.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.p
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      className="text-body-md text-chalk-lo leading-relaxed"
    >
      {wordsPart1.map((word, i) => (
        <motion.span key={`${word}-${i}`} variants={wordVariants} className="inline-block mr-[0.25em]">
          {word}
        </motion.span>
      ))}
      <motion.span variants={wordVariants} className="inline-block mr-[0.25em] font-semibold text-caution tabular">
        {baseDays} days
      </motion.span>
      <motion.span variants={wordVariants} className="inline-block mr-[0.25em]">
        to
      </motion.span>
      <motion.span variants={wordVariants} className="inline-block font-semibold text-risk tabular">
        {shockedDays} days.
      </motion.span>
    </motion.p>
  );
}
