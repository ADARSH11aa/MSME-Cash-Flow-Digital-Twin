import { motion, useReducedMotion } from 'framer-motion';
import { Banknote, Clock, Receipt, ArrowRight } from 'lucide-react';
import BracketFrame from '@/components/shared/BracketFrame';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import { formatCurrency } from '@/lib/format';
import Reveal from './Reveal';

/**
 * The problem section on light canvas (PRD 3.1.4), enhanced with bi-directional
 * staggered text reveal and a left-to-right sequential slideshow card reveal.
 */

const CARDS = [
  {
    step: '01',
    Icon: Banknote,
    label: 'Cash today',
    value: 240000,
    body: 'Looks comfortable. This is the liquid balance most accounting dashboards show you.',
    pill: 'Liquid Bank Balance',
  },
  {
    step: '02',
    Icon: Receipt,
    label: 'Receivables outstanding',
    value: 800000,
    body: 'Money earned and invoiced, but not yet collected. Profit on paper, not in the bank.',
    pill: 'Uncollected Inflow',
  },
  {
    step: '03',
    Icon: Clock,
    label: 'Payments due in 30 days',
    value: 700000,
    body: 'Salaries, raw material suppliers, and rent that will not wait for buyers to settle.',
    pill: 'Rigid Obligations',
  },
];

const HEADLINE_TEXT = 'Profitable on paper, yet running out of cash.';
const PARAGRAPH_TEXT =
  'A furniture workshop books a strong quarter. On paper it is thriving. In practice, its largest customer settles 28 days beyond terms, and payroll does not move. Accounting tells you what happened; nothing warns you what is about to.';

export default function ProblemSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="border-b border-edge-light bg-light py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <EyebrowLabel onLight filled>
            The fundamental problem
          </EyebrowLabel>
        </Reveal>

        {/* Bi-directional Staggered Headline */}
        <div className="mt-6 max-w-2xl">
          {prefersReduced ? (
            <h2 className="font-display text-[34px] leading-tight tracking-[-0.02em] text-ink-hi md:text-display-lg">
              {HEADLINE_TEXT}
            </h2>
          ) : (
            <StaggerHeadlineText text={HEADLINE_TEXT} />
          )}
        </div>

        {/* Bi-directional Staggered Paragraph Text */}
        <div className="mt-5 max-w-2xl">
          {prefersReduced ? (
            <p className="text-body-md text-ink-lo leading-relaxed">{PARAGRAPH_TEXT}</p>
          ) : (
            <StaggerParagraphText text={PARAGRAPH_TEXT} />
          )}
        </div>

        {/* Left-to-Right Sequential Slideshow Cards Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -60, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{
                duration: prefersReduced ? 0.01 : 0.55,
                delay: prefersReduced ? 0 : i * 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              <BracketFrame tone="neutral" onLight className="h-full">
                <div className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-edge-light bg-light-card p-7 shadow-sm transition-all hover:shadow-lg hover:border-ink-lo/40">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-hi/5 text-ink-hi transition-transform group-hover:scale-105">
                        <card.Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="rounded-full bg-ink-hi/5 px-2.5 py-0.5 text-[11px] font-medium text-ink-lo">
                        {card.pill}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-ink-lo/70 font-mono">
                        STEP {card.step}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-ink-lo/40" />
                      <span className="text-label-xs uppercase tracking-wide text-ink-lo font-semibold">
                        {card.label}
                      </span>
                    </div>

                    <span
                      data-numeric
                      className="mt-1.5 block font-display text-display-md font-bold tabular text-ink-hi"
                    >
                      {formatCurrency(card.value)}
                    </span>
                  </div>

                  <p className="text-body-sm text-ink-lo leading-relaxed border-t border-edge-light/60 pt-4">
                    {card.body}
                  </p>
                </div>
              </BracketFrame>
            </motion.div>
          ))}
        </div>

        <Reveal index={3}>
          <div className="mt-10 rounded-xl border border-edge-light/80 bg-light-card p-6 shadow-sm">
            <p className="border-l-2 border-ink-hi pl-4 text-body-md font-medium text-ink-hi">
              The business is profitable. It is also 12 days from being unable to pay its staff. Those two facts live in the same spreadsheet, and traditional accounting software never connects them.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Bi-directional staggered headline animation (works scrolling up & down, no flickering bar) */
function StaggerHeadlineText({ text }) {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 14, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.h2
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      className="font-display text-[34px] leading-tight tracking-[-0.02em] text-ink-hi md:text-display-lg"
    >
      {words.map((word, index) => (
        <motion.span key={`${word}-${index}`} variants={wordVariants} className="inline-block mr-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.h2>
  );
}

/** Bi-directional staggered paragraph word-by-word animation */
function StaggerParagraphText({ text }) {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.015,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.p
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      className="text-body-md text-ink-lo leading-relaxed"
    >
      {words.map((word, i) => (
        <motion.span key={`${word}-${i}`} variants={wordVariants} className="inline-block mr-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}
