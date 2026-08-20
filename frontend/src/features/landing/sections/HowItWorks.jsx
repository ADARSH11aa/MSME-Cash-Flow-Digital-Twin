import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import cn from '@/lib/cn';
import EyebrowLabel from '@/components/shared/EyebrowLabel';

/**
 * How it works (PRD 3.1.5) — enhanced with bi-directional header reveal animation
 * on scrolling up and down, and automatic sticky slideshow progression.
 */

const STEPS = [
  {
    n: '01',
    title: 'Connect & consent',
    body: 'You choose exactly what CashTwin may analyse — invoices, payment history, forecasting — and can withdraw any of it later. Nothing is read before you agree to it.',
    panel: ['Invoice analysis', 'Payment-history analysis', 'Forecasting', 'Lender sharing — off'],
  },
  {
    n: '02',
    title: 'See your forecast',
    body: 'Import invoices and obligations, and your twin projects cash forward 7 to 90 days, with a single headline number: how long until you run tight.',
    panel: ['28 days to breach', '₹1.52L projected close', '53% customer concentration'],
  },
  {
    n: '03',
    title: 'Stress-test scenarios',
    body: 'Ask what happens if your biggest customer pays 30 days late, or sales fall 20%. Numbers recalculate in front of you.',
    panel: ['Customer delay +30d', 'Sales −20%', 'Supplier costs +15%', 'Combined shock'],
  },
  {
    n: '04',
    title: 'Compare recovery options',
    body: 'Non-debt actions are ranked first — delay a spend, renegotiate terms, offer an early-payment discount — before any financing is shown.',
    panel: ['Supplier extension — ₹0', 'Early-payment discount', 'Invoice financing', 'Working capital'],
  },
];

const HEADLINE_TEXT = 'Everything your cash position runs on';

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);
  const prefersReduced = useReducedMotion();

  // Scroll tracking for sticky automatic slideshow progression
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Advancing the stage is navigation, not decoration — it is the only way to
  // reach stages 2-4, and the section pins the viewport for ~2 screens while
  // you do it. Gating it on prefers-reduced-motion left anyone with that
  // setting scrolling through a locked "Stage 01/04" that never moved.
  //
  // Same rule as the landing <Reveal>: reduced motion softens *how* things
  // change, it never removes the content or the means of getting to it. The
  // AnimatePresence transitions below already collapse on their own.
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const stepCount = STEPS.length;
    // Map scroll progress (0 to 1) across the 4 steps
    const index = Math.min(stepCount - 1, Math.max(0, Math.floor(latest * stepCount)));
    setActive((prev) => (prev !== index ? index : prev));
  });

  const step = STEPS[active];

  // Header animation variants (bi-directional on scroll up & down)
  const headerContainerVariants = {
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
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative border-b border-edge-dark pb-24"
    >
      {/* Scroll track height to give smooth progressive scroll distance */}
      <div className="relative min-h-[220vh] md:min-h-[260vh]">
        {/* Sticky viewport content */}
        <div className="sticky top-20 md:top-24 flex min-h-[calc(100vh-6rem)] flex-col justify-center py-8">
          <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
            {/* Bi-directional Header Animation (Works on scroll up & down) */}
            <motion.div
              variants={headerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                  }}
                >
                  <EyebrowLabel>How it works</EyebrowLabel>
                </motion.div>

                {/* Scroll progress pill with stepped dots */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
                  }}
                  className="hidden sm:flex items-center gap-3 rounded-full border border-edge-dark bg-surface px-3.5 py-1.5 text-[11px] text-[#6E7D87] shadow-sm"
                >
                  <span>Scroll to advance</span>
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    {STEPS.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300',
                          i === active ? 'w-4 bg-[#24D6A0]' : 'w-1.5 bg-[#E6E1D6]',
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-[#0D1720] font-mono">Stage {step.n}/04</span>
                </motion.div>
              </div>

              {/* Staggered Words Headline */}
              <motion.h2
                className="mt-4 max-w-2xl font-display text-[32px] leading-tight tracking-[-0.02em] text-[#0D1720] md:text-display-lg font-bold"
              >
                {HEADLINE_TEXT.split(' ').map((word, i) => (
                  <motion.span key={`${word}-${i}`} variants={wordVariants} className="inline-block mr-[0.25em]">
                    {word}
                  </motion.span>
                ))}
              </motion.h2>
            </motion.div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
              {/* Left Selector List */}
              <ol className="space-y-2.5">
                {STEPS.map((s, i) => (
                  <li key={s.n}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={i === active}
                      className={cn(
                        'group flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all cursor-pointer',
                        i === active
                          ? 'border-[#0B1720] bg-surface shadow-md text-[#0D1720] ring-1 ring-[#0B1720]/10'
                          : 'border-edge-dark bg-surface/70 text-[#6E7D87] hover:border-[#0B1720] hover:text-[#0D1720]'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg text-label-xs font-semibold tabular transition-colors',
                            i === active ? 'bg-[#0B1720] text-white' : 'border border-edge-dark bg-surface-2 text-[#6E7D87]'
                          )}
                        >
                          {s.n}
                        </span>
                        <span className="text-body-sm font-semibold uppercase tracking-wider">{s.title}</span>
                      </div>

                      {/* Active indicator bar */}
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full transition-all',
                          i === active ? 'bg-[#24D6A0] scale-125' : 'bg-transparent'
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ol>

              {/* Right Dynamic Showcase Panel */}
              <div className="overflow-hidden rounded-2xl border border-edge-dark bg-surface-2 md:bg-gradient-to-r md:from-surface md:from-50% md:to-surface-2 md:to-50% shadow-[0_12px_36px_rgba(11,23,32,0.06)]">
                <AnimatePresence mode="wait">
                  {/* Under reduced motion the stage still changes, it just
                      swaps instantly instead of sliding. */}
                  <motion.div
                    key={active}
                    initial={prefersReduced ? false : { opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -15 }}
                    transition={
                      prefersReduced ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
                    }
                    className="grid md:grid-cols-2 min-h-[360px] items-stretch"
                  >
                    {/* Stage Details (Left Side) */}
                    <div className="flex flex-col justify-between gap-6 p-8 md:p-10 bg-surface h-full">
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#24D6A0]/15 border border-[#24D6A0]/35 px-3 py-0.5 text-label-xs uppercase text-[#0D1720] font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#24D6A0]" /> Stage {step.n}
                        </span>
                        <h3 className="mt-3 font-display text-display-md text-[#0D1720] font-bold">{step.title}</h3>
                        <p className="mt-4 text-body-md text-[#6E7D87] leading-relaxed">{step.body}</p>
                      </div>
                    </div>

                    {/* Active Output Signals (Right Side) */}
                    <div className="flex flex-col justify-center gap-3 border-t border-edge-dark bg-surface-2 p-8 md:border-l md:border-t-0 md:p-10 h-full">
                      <span className="text-label-xs uppercase text-[#6E7D87] mb-1 font-semibold tracking-wider">
                        Active Output Signals
                      </span>
                      {step.panel.map((item, idx) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.06 }}
                          className="flex items-center gap-3 rounded-xl border border-edge-dark bg-surface px-4 py-3 shadow-xs"
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#24D6A0]" aria-hidden="true" />
                          <span className="text-body-sm font-medium text-[#0D1720]">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
