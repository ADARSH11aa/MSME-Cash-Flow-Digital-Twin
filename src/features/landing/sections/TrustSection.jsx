import { motion, useReducedMotion } from 'framer-motion';
import { Quote } from 'lucide-react';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import StatsCounter from '@/components/shared/StatsCounter';

/**
 * Trust section (PRD 3.1.7) — enhanced with smooth bi-directional reveal animation,
 * word-by-word quote reveal, and animated StatsCounters.
 */

const STATS = [
  {
    numValue: 28,
    suffix: ' days',
    prefix: '',
    decimals: 0,
    label: 'Typical early warning before a cash shortfall',
  },
  {
    numValue: 0,
    suffix: '',
    prefix: '₹',
    decimals: 0,
    label: 'Cost of the non-debt recovery actions tried first',
  },
  {
    numValue: 100,
    suffix: '%',
    prefix: '',
    decimals: 0,
    label: 'Of figures traceable back to a verified source record',
  },
];

const QUOTE_TEXT =
  '“The month I could not make payroll, my books said I was profitable. I did not need another report telling me what happened. I needed three weeks of warning.”';

export default function TrustSection() {
  const prefersReduced = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 8, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="border-b border-edge-dark py-20 md:py-28 overflow-hidden bg-void">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.4 }}
        >
          <EyebrowLabel>What it changes</EyebrowLabel>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Left Main Quote Card with Smooth Text Reveal */}
          <motion.figure
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            className="flex h-full flex-col justify-between gap-8 rounded-2xl border border-edge-dark/80 bg-surface p-8 md:p-10 shadow-xl transition-all hover:border-lime/40"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-16 border border-lime/20 text-lime shadow-sm"
            >
              <Quote className="h-6 w-6" aria-hidden="true" />
            </motion.div>

            <blockquote className="font-display text-[24px] sm:text-[28px] leading-snug tracking-[-0.01em] text-chalk-hi font-medium">
              {prefersReduced ? (
                QUOTE_TEXT
              ) : (
                QUOTE_TEXT.split(' ').map((word, i) => (
                  <motion.span
                    key={`${word}-${i}`}
                    variants={wordVariants}
                    className="inline-block mr-[0.25em]"
                  >
                    {word}
                  </motion.span>
                ))
              )}
            </blockquote>

            <motion.figcaption
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.4, delay: 0.4 } },
              }}
              className="text-body-sm text-chalk-lo border-t border-edge-dark/50 pt-4"
            >
              Illustrative — the situation CashTwin is built for, not a customer endorsement.
            </motion.figcaption>
          </motion.figure>

          {/* Right Stats Cards */}
          <div className="grid gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 20, scale: 0.96 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{
                  duration: prefersReduced ? 0.01 : 0.5,
                  delay: prefersReduced ? 0 : i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="flex h-full flex-col justify-center gap-2 rounded-2xl border border-edge-dark/80 bg-surface p-7 shadow-sm transition-all hover:border-lime/40 hover:bg-surface-2"
              >
                <span
                  data-numeric
                  className="font-display text-display-lg font-bold tabular text-lime"
                >
                  <StatsCounter
                    value={stat.numValue}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    duration={1.6}
                  />
                </span>
                <span className="text-body-sm text-chalk-lo leading-relaxed">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
