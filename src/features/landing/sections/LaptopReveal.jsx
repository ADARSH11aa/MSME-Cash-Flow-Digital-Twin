import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, TrendingUp } from 'lucide-react';
import Button from '@/components/shared/Button';
import ForecastChart from '@/components/shared/ForecastChart';
import { buildForecast } from '@/mocks/fixtures/forecastEngine';

/**
 * LaptopReveal — scroll-driven 3D laptop opening section.
 *
 * How it works:
 *   - `wrapperRef` is a TALL container (300vh). Its height is the amount
 *     of scroll distance the whole effect takes.
 *   - The inner section is `position: sticky; top: 0`, so it stays pinned
 *     to the viewport for as long as the wrapper is scrolling past.
 *   - useScroll + useTransform read scroll progress through that tall
 *     wrapper (0 at top, 1 at bottom) and map it directly to the lid's
 *     rotateX and the screen content's opacity — no separate scroll
 *     library needed, this works natively alongside Lenis.
 *   - Once the wrapper's height is exhausted (progress hits 1), the
 *     sticky section naturally un-pins and normal scroll continues into
 *     whatever section follows this one in LandingPage.jsx.
 *
 * Uses the real ForecastChart + live forecast data — same chart your
 * dashboard actually renders — so the "reveal" shows the real product,
 * not a mockup.
 */
export default function LaptopReveal() {
  const wrapperRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const { forecast, daysToBreach } = buildForecast({ horizon: 30 });

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Lid opens across the first 65% of the scroll distance, then holds
  // open for the remaining 35% so the user has time to read the screen
  // before the section releases.
  const rotateX = useTransform(scrollYProgress, [0, 0.65], [-100, 0]);
  const screenOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1]);
  const baseGlow = useTransform(scrollYProgress, [0, 0.65], [0, 1]);

  if (prefersReduced) {
    // Static fallback — no pinning, no rotation, content just visible.
    return (
      <section className="border-b border-edge-dark bg-void py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <LaptopShell rotateX={0} screenOpacity={1} baseGlow={1}>
            <ScreenContent forecast={forecast} daysToBreach={daysToBreach} />
          </LaptopShell>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className="relative h-[300vh] bg-void">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden border-b border-edge-dark px-5">
        {/* Ambient glow, matches Hero's atmosphere */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full opacity-20 blur-[130px]"
          style={{
            background:
              'radial-gradient(circle, var(--accent-lime) 0%, rgba(111, 168, 255, 0.4) 50%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          <p className="mb-8 text-label-xs uppercase tracking-wide text-chalk-lo">
            See it on your desk
          </p>

          <LaptopShell rotateX={rotateX} screenOpacity={screenOpacity} baseGlow={baseGlow}>
            <ScreenContent forecast={forecast} daysToBreach={daysToBreach} />
          </LaptopShell>

          <motion.div style={{ opacity: screenOpacity }} className="mt-10">
            <Button asChild size="lg" className="rounded-full px-8">
              <a href="/onboarding">See the full dashboard</a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** The physical laptop shape: base + hinged lid. */
function LaptopShell({ rotateX, screenOpacity, baseGlow, children }) {
  return (
    <div
      className="relative mx-auto w-full max-w-3xl"
      style={{ perspective: '1800px' }}
    >
      <div style={{ transformStyle: 'preserve-3d' }} className="relative">
        {/* Lid — animates open via rotateX */}
        <motion.div
          style={{
            rotateX,
            transformOrigin: 'bottom center',
            transformStyle: 'preserve-3d',
          }}
          className="relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-t-2xl border-[10px] border-b-0 border-[#1c1c1a] bg-void shadow-[0_40px_90px_rgba(0,0,0,0.6)]"
        >
          <motion.div style={{ opacity: screenOpacity }} className="h-full w-full">
            {children}
          </motion.div>
        </motion.div>

        {/* Base / keyboard deck — static, matches lid width */}
        <div className="relative mx-auto h-6 w-full max-w-3xl rounded-b-xl border border-edge-dark bg-gradient-to-b from-surface-2 to-void" />
        <motion.div
          style={{ opacity: baseGlow }}
          className="mx-auto h-2 w-[85%] rounded-full bg-black/40 blur-md"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/** What appears on the laptop screen once opened — the real dashboard chart. */
function ScreenContent({ forecast, daysToBreach }) {
  return (
    <div className="flex h-full w-full flex-col gap-4 bg-surface p-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label-xs uppercase text-chalk-lo">Liquidity status</p>
          <p className="font-display text-lg font-semibold text-chalk-hi">
            Balaji Furniture Works
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-caution/40 bg-caution/15 px-3 py-1 text-label-xs text-caution">
          <TrendingUp className="h-3.5 w-3.5" />
          {daysToBreach} days to breach
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-xl border border-edge-dark bg-surface-2 p-3">
        <ForecastChart
          forecast={forecast}
          minimumBuffer={200000}
          height={220}
          animate={false}
        />
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-lime/20 bg-lime-8 px-3 py-2 text-label-xs text-lime">
        <ShieldCheck className="h-3.5 w-3.5" />
        Every figure traces back to a source invoice
      </div>
    </div>
  );
}
