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

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (prefersReduced) return;
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
                  className="hidden sm:flex items-center gap-3 rounded-full border border-edge-dark bg-surface-2 px-3.5 py-1.5 text-[11px] text-chalk-lo shadow-sm"
                >
                  <span>Scroll to advance</span>
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    {STEPS.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300',
                          i === active ? 'w-4 bg-lime' : 'w-1.5 bg-edge-dark',
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-lime font-mono">Stage {step.n}/04</span>
                </motion.div>
              </div>

              {/* Staggered Words Headline */}
              <motion.h2
                className="mt-4 max-w-2xl font-display text-[32px] leading-tight tracking-[-0.02em] text-chalk-hi md:text-display-lg"
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
                        'group flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all',
                        i === active
                          ? 'border-chalk-hi/90 bg-surface-2 shadow-xl text-chalk-hi ring-1 ring-white/10'
                          : 'border-edge-dark/60 bg-surface/70 text-chalk-lo hover:border-edge-dark hover:text-chalk-hi'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg text-label-xs font-semibold tabular transition-colors',
                            i === active ? 'bg-lime text-ink-hi' : 'border border-edge-dark bg-void text-chalk-lo'
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
                          i === active ? 'bg-lime scale-125' : 'bg-transparent'
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ol>

              {/* Right Dynamic Showcase Panel */}
              <div className="overflow-hidden rounded-2xl border border-edge-dark bg-surface shadow-2xl min-h-[340px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="grid md:grid-cols-2 h-full"
                  >
                    {/* Stage Details */}
                    <div className="flex flex-col justify-between gap-6 p-8 md:p-10">
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-16 border border-lime/30 px-3 py-0.5 text-label-xs uppercase text-lime font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Stage {step.n}
                        </span>
                        <h3 className="mt-3 font-display text-display-md text-chalk-hi">{step.title}</h3>
                        <p className="mt-4 text-body-md text-chalk-lo leading-relaxed">{step.body}</p>
                      </div>
                    </div>

                    {/* Active Output Signals */}
                    <div className="flex flex-col justify-center gap-3 border-t border-edge-dark bg-surface-2 p-8 md:border-l md:border-t-0 md:p-10">
                      <span className="text-label-xs uppercase text-chalk-lo mb-1 font-semibold tracking-wider">
                        Active Output Signals
                      </span>
                      {step.panel.map((item, idx) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.06 }}
                          className="flex items-center gap-3 rounded-xl border border-edge-dark bg-surface px-4 py-3 shadow-sm"
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-lime" aria-hidden="true" />
                          <span className="text-body-sm font-medium text-chalk-hi">{item}</span>
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
