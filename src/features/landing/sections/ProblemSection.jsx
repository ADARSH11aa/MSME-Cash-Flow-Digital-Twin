import { motion, useReducedMotion } from 'framer-motion';
import { Banknote, Clock, Receipt } from 'lucide-react';
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
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
  {
    step: '02',
    Icon: Receipt,
    label: 'Receivables outstanding',
    value: 800000,
    body: 'Money earned and invoiced, but not yet collected. Profit on paper, not in the bank.',
    pill: 'Uncollected Inflow',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
  },
  {
    step: '03',
    Icon: Clock,
    label: 'Payments due in 30 days',
    value: 700000,
    body: 'Salaries, raw material suppliers, and rent that will not wait for buyers to settle.',
    pill: 'Rigid Obligations',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/80',
  },
];

const HEADLINE_TEXT = 'Profitable on paper, yet running out of cash.';
const PARAGRAPH_TEXT =
  'A furniture workshop books a strong quarter. On paper it is thriving. In practice, its largest customer settles 28 days beyond terms, and payroll does not move. Accounting tells you what happened; nothing warns you what is about to.';

export default function ProblemSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="problem" className="border-b border-edge-light bg-light py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <EyebrowLabel onLight filled>
            The fundamental problem
          </EyebrowLabel>
        </Reveal>

        {/* Bi-directional Staggered Headline */}
        <div className="mt-6 max-w-2xl">
          {prefersReduced ? (
            <h2 className="font-display text-[34px] leading-tight tracking-[-0.02em] text-neutral-950 md:text-display-lg">
              {HEADLINE_TEXT}
            </h2>
          ) : (
            <StaggerHeadlineText text={HEADLINE_TEXT} />
          )}
        </div>

        {/* Bi-directional Staggered Paragraph Text */}
        <div className="mt-5 max-w-2xl">
          {prefersReduced ? (
            <p className="text-body-md text-neutral-700 leading-relaxed font-normal">{PARAGRAPH_TEXT}</p>
          ) : (
            <StaggerParagraphText text={PARAGRAPH_TEXT} />
          )}
        </div>

        {/* Left-to-Right Sequential Slideshow Cards Grid with Refined Shape */}
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
              <div className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-neutral-200/90 bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-neutral-400/80">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105">
                      <card.Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-xs ${card.badgeClass}`}>
                      {card.pill}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 font-mono tracking-wider">
                      STEP {card.step}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                    <span className="text-xs uppercase tracking-wider text-neutral-800 font-bold">
                      {card.label}
                    </span>
                  </div>

                  <span
                    data-numeric
                    className="mt-2 block font-display text-[32px] md:text-[36px] font-extrabold tracking-tight tabular text-neutral-950"
                  >
                    {formatCurrency(card.value)}
                  </span>
                </div>

                <p className="text-[14px] text-neutral-700 font-normal leading-relaxed border-t border-neutral-200/80 pt-4.5">
                  {card.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <Reveal index={3}>
          <div className="mt-10 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm">
            <p className="border-l-3 border-neutral-950 pl-4 text-base font-semibold text-neutral-900 leading-relaxed">
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
