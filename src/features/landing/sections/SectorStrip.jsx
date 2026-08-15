import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * Sector strip (PRD 3.1.3) — enhanced with bi-directional parallax and staggered
 * scroll reveal that plays on both scroll up and scroll down.
 */

const SECTORS = [
  'Textiles & Apparel',
  'Furniture & Interiors',
  'Electronics Retail',
  'Food Processing',
  'Auto Components',
  'Pharmaceuticals',
];

export default function SectorStrip() {
  const containerRef = useRef(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Smooth continuous parallax movement
  const glowY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.05, 0.25, 0.05]);

  if (prefersReduced) {
    return (
      <section className="border-b border-edge-dark py-14 bg-surface/30">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-center text-label-xs uppercase tracking-wider text-chalk-lo">
            Engineered for growth-oriented Indian MSMEs across industries
          </p>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {SECTORS.map((sector) => (
              <li
                key={sector}
                className="rounded-full border border-edge-dark/80 bg-surface px-5 py-2 text-label-xs uppercase text-chalk-lo shadow-sm"
              >
                {sector}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  // Bi-directional stagger container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const pillVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden border-b border-edge-dark py-16 md:py-20 bg-surface/20"
    >
      {/* Ambient glow with parallax depth */}
      <motion.div
        style={{ y: glowY, opacity: glowOpacity }}
        className="pointer-events-none absolute left-1/2 -top-12 h-64 w-96 -translate-x-1/2 rounded-full bg-lime blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        {/* Parallax / Bi-directional Stagger Wrapper */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="text-center"
        >
          {/* Header */}
          <motion.p
            variants={titleVariants}
            className="text-label-xs uppercase tracking-wider text-chalk-lo"
          >
            Engineered for growth-oriented Indian MSMEs across industries
          </motion.p>

          {/* Staggered Pills (Bi-directional on scroll up & down) */}
          <motion.div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {SECTORS.map((sector) => (
              <motion.div
                key={sector}
                variants={pillVariants}
                whileHover={{ scale: 1.05, y: -2 }}
                className="rounded-full border border-edge-dark/80 bg-surface/90 px-5 py-2.5 text-label-xs uppercase text-chalk-lo shadow-sm backdrop-blur-sm transition-colors hover:border-lime/60 hover:text-chalk-hi cursor-default"
              >
                {sector}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
