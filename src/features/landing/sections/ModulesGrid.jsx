import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  Boxes,
  GitBranch,
  LineChart,
  PencilRuler,
  ShieldQuestion,
  Users,
} from 'lucide-react';
import EyebrowLabel from '@/components/shared/EyebrowLabel';

/**
 * Core modules grid (PRD 3.1.6) — enhanced with multi-column parallax scrolling,
 * ambient glow depth, and bi-directional text reveal animations.
 */

const MODULES = [
  {
    Icon: LineChart,
    title: 'Cash-flow forecasting',
    body: 'Projects your liquidity 7 to 90 days ahead from real invoices and verified obligations.',
    col: 0,
  },
  {
    Icon: Users,
    title: 'Payment behaviour intelligence',
    body: 'Learns how late each buyer actually pays, rather than blindly trusting stated terms.',
    col: 1,
  },
  {
    Icon: Boxes,
    title: 'Customer concentration risk',
    body: 'Flags when too much of your cash depends on one single customer settling on time.',
    col: 2,
  },
  {
    Icon: GitBranch,
    title: 'Liquidity recovery simulator',
    body: 'Tests revenue shocks and non-debt recovery actions side-by-side before committing.',
    col: 0,
  },
  {
    Icon: ShieldQuestion,
    title: 'Explainable calculations',
    body: 'Every headline figure opens up into the source invoices and records that produced it.',
    col: 1,
  },
  {
    Icon: PencilRuler,
    title: 'Correctable financial model',
    body: 'Wrong OCR import? Edit any amount inline and your forecast recalculates immediately.',
    col: 2,
  },
];

const HEADLINE_TEXT = 'Six modules, one living cash position';
const SUBHEAD_TEXT =
  'Everything your business needs to stay ahead of upcoming cash-flow roadblocks.';

export default function ModulesGrid() {
  const containerRef = useRef(null);
  const prefersReduced = useReducedMotion();

  // Scroll tracking for parallax depth
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Parallax shifts for multi-column depth effect
  const col0Y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const col1Y = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const col2Y = useTransform(scrollYProgress, [0, 1], [-10, 20]);
  const glowY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.05, 0.2, 0.05]);

  // Header animation variants (bi-directional on scroll up & down)
  const headerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
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

  const getColTransform = (colIndex) => {
    if (prefersReduced) return undefined;
    if (colIndex === 0) return col0Y;
    if (colIndex === 1) return col1Y;
    return col2Y;
  };

  return (
    <section
      id="modules"
      ref={containerRef}
      className="relative overflow-hidden border-b border-edge-dark py-20 md:py-28 bg-void"
    >
      {/* Parallax Ambient Radial Glow */}
      <motion.div
        style={{ y: prefersReduced ? 0 : glowY, opacity: prefersReduced ? 0.1 : glowOpacity }}
        className="pointer-events-none absolute right-1/4 -top-20 h-96 w-96 rounded-full bg-lime blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        {/* Bi-directional Header Text Reveal */}
        <motion.div
          variants={headerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
            }}
          >
            <EyebrowLabel>Core capabilities</EyebrowLabel>
          </motion.div>

          <motion.h2 className="mt-6 max-w-2xl font-display text-[34px] leading-tight tracking-[-0.02em] text-[#0D1720] md:text-display-lg font-bold">
            {HEADLINE_TEXT.split(' ').map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                variants={wordVariants}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.25 } },
            }}
            className="mt-4 max-w-xl text-body-md text-[#6E7D87] leading-relaxed"
          >
            {SUBHEAD_TEXT}
          </motion.p>
        </motion.div>

        {/* 6 Capabilities Cards Grid with Multi-Column Parallax */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module, i) => {
            const iconColors = [
              { bg: 'bg-[#24D6A0]/15', border: 'border-[#24D6A0]/30', text: 'text-[#24D6A0]' },
              { bg: 'bg-[#26C6DA]/15', border: 'border-[#26C6DA]/30', text: 'text-[#26C6DA]' },
              { bg: 'bg-[#4C7DFF]/15', border: 'border-[#4C7DFF]/30', text: 'text-[#4C7DFF]' },
              { bg: 'bg-[#24D6A0]/15', border: 'border-[#24D6A0]/30', text: 'text-[#24D6A0]' },
              { bg: 'bg-[#26C6DA]/15', border: 'border-[#26C6DA]/30', text: 'text-[#26C6DA]' },
              { bg: 'bg-[#4C7DFF]/15', border: 'border-[#4C7DFF]/30', text: 'text-[#4C7DFF]' },
            ][i % 6];

            return (
              <motion.div
                key={module.title}
                style={{ y: getColTransform(module.col) }}
                initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{
                  duration: prefersReduced ? 0.01 : 0.5,
                  delay: prefersReduced ? 0 : (i % 3) * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group flex h-full flex-col justify-between rounded-2xl border border-edge-dark bg-surface p-7 transition-all hover:border-[#0B1720] hover:shadow-[0_16px_36px_rgba(11,23,32,0.08)] shadow-[0_2px_12px_rgba(11,23,32,0.04)]"
              >
                <div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColors.bg} border ${iconColors.border} ${iconColors.text} transition-transform group-hover:scale-110`}>
                    <module.Icon className="h-6 w-6" aria-hidden="true" />
                  </div>

                  <h3 className="mt-6 font-display text-heading-md font-bold text-[#0D1720] leading-snug">
                    {module.title}
                  </h3>

                  <p className="mt-3 text-body-sm text-[#6E7D87] leading-relaxed">
                    {module.body}
                  </p>
                </div>

                {/* Bottom Subtle Status Line */}
                <div className="mt-6 pt-4 border-t border-edge-dark flex items-center justify-between text-[11px] text-[#6E7D87] group-hover:text-[#0D1720] transition-colors">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#24D6A0]" /> Active Signal
                  </span>
                  <span className="font-mono text-[10px] text-[#6E7D87]">MOD 0{i + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
