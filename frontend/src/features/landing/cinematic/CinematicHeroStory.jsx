import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/shared/Button';
import CinematicAtmosphere from './CinematicAtmosphere';
import CinematicPhone from './CinematicPhone';
import { buildForecast } from '@/mocks/fixtures/forecastEngine';

const FEATURE_TITLES = [
  {
    step: 0,
    tag: 'OVERVIEW',
    title: 'Know your cash crunch before it happens.',
    desc: 'CashTwin models where your cash is heading — not just where it has been.',
  },
  {
    step: 1,
    tag: '01 · LIVE CASH POSITION',
    title: 'Know where your cash stands.',
    desc: 'Real-time verified liquidity buffer and automated bank feed tracking.',
  },
  {
    step: 2,
    tag: '02 · CASH FLOW DRIVERS',
    title: "See what's driving your cash.",
    desc: 'Granular inflow and outflow telemetry across sales, payroll, and inventory.',
  },
  {
    step: 3,
    tag: '03 · 3-BAND FORECASTING',
    title: "Know what's coming next.",
    desc: 'Predictive trajectory with optimistic, expected, and stress-tested risk bands.',
  },
  {
    step: 4,
    tag: '04 · DIGITAL TWIN ENGINE',
    title: 'Your business. Simulated in real time.',
    desc: "A living financial twin showing how today's decisions alter future cash.",
  },
  {
    step: 5,
    tag: '05 · WHAT-IF SIMULATION',
    title: 'Test the decision before you commit.',
    desc: 'Simulate delayed client payments, revenue spikes, or supplier costs.',
  },
  {
    step: 6,
    tag: '06 · RISK DETECTION',
    title: 'Spot the cash gap before it hits.',
    desc: 'Identify liquidity shortfalls weeks ahead and discover zero-debt recovery steps.',
  },
  {
    step: 7,
    tag: '07 · EXPLAINABLE AI',
    title: "Don't just see numbers. Understand them.",
    desc: 'Auditable, DPDP-compliant intelligence without black-box lending traps.',
  },
];

export default function CinematicHeroStory() {
  const containerRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const { daysToBreach } = buildForecast({ horizon: 30 });

  const [activeStep, setActiveStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate active step dynamically based on scroll progression (0 to 7)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (prefersReduced) return;
    const numSteps = FEATURE_TITLES.length;
    // Map 0..1 to 0..7
    const step = Math.min(numSteps - 1, Math.floor(latest * numSteps));
    if (step !== activeStep) {
      setActiveStep(step);
    }
  });

  // Smooth scroll animations:
  // 1. Initial Left Hero Text: Fades out and slides left during the 1st scroll (0.00 -> 0.12)
  const leftTextOpacity = useTransform(scrollYProgress, [0, 0.10], [1, 0]);
  const leftTextX = useTransform(scrollYProgress, [0, 0.12], [0, -80]);
  const leftTextScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.94]);

  // 2. Phone Horizontal Centering: Moves smoothly from right column to center (0.00 -> 0.14)
  const phoneXTranslate = useTransform(
    scrollYProgress,
    [0, 0.14],
    isDesktop ? ['0%', '-68%'] : ['0%', '0%']
  );
  const phoneScale = useTransform(
    scrollYProgress,
    [0, 0.14, 0.5, 0.85, 1],
    [1, 1.10, 1.08, 1.10, 1.02]
  );
  const phoneRotation = useTransform(
    scrollYProgress,
    [0, 0.14, 0.35, 0.6, 0.85, 1],
    [0, 0, -1.8, 1.8, -1.2, 0]
  );

  // 3. Centered Feature Header: Fades in once phone is centered (0.12 -> 0.18)
  const centeredHeaderOpacity = useTransform(scrollYProgress, [0.10, 0.16, 0.94, 1], [0, 1, 1, 0]);
  const centeredHeaderY = useTransform(scrollYProgress, [0.10, 0.16], [20, 0]);

  // Desktop Mouse Parallax
  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  const currentFeature = FEATURE_TITLES[activeStep];

  if (prefersReduced) {
    return (
      <section className="relative overflow-hidden border-b border-edge-dark bg-void py-16 md:py-24">
        <CinematicAtmosphere stateIndex={0} mouseX={0} mouseY={0} />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <InitialHeroText />
            <CinematicPhone stateIndex={0} daysToBreach={daysToBreach} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-[650vh] bg-void"
    >
      {/* 100vh Sticky Viewport Screen */}
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden border-b border-edge-dark bg-void">
        {/* Dynamic Multi-State Atmosphere Glow with Backdrop Blur */}
        <CinematicAtmosphere stateIndex={activeStep} mouseX={mousePos.x} mouseY={mousePos.y} />

        {/* Content Viewport Container */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            {/* Left Initial Hero Text Column (Smoothly fades out on scroll) */}
            <motion.div
              style={{
                opacity: leftTextOpacity,
                x: leftTextX,
                scale: leftTextScale,
                pointerEvents: activeStep === 0 ? 'auto' : 'none',
              }}
              className="flex flex-col justify-center"
            >
              <InitialHeroText />
            </motion.div>

            {/* Smartphone Column (Smoothly glides from right to center on scroll) */}
            <motion.div
              style={{
                x: phoneXTranslate,
                scale: phoneScale,
                rotateZ: phoneRotation,
              }}
              className="flex items-center justify-center lg:justify-start"
            >
              <CinematicPhone
                stateIndex={activeStep}
                daysToBreach={daysToBreach}
                phoneRotation={mousePos.x * 4}
                phoneX={mousePos.x * 6}
                phoneY={mousePos.y * 6}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InitialHeroText() {
  return (
    <div className="flex flex-col items-start text-left">
      {/* Pill Eyebrow Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-edge-dark/80 bg-surface/80 px-4 py-1.5 text-body-sm text-chalk-lo shadow-sm backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
        <span className="font-mono text-xs tracking-wider uppercase">
          Simple and integrated MSME cash-flow tools
        </span>
      </div>

      {/* Display Headline */}
      <h1 className="mt-7 font-display text-[44px] sm:text-[56px] lg:text-[66px] font-bold leading-[1.04] tracking-[-0.03em] text-chalk-hi">
        Know your cash crunch <br />
        <span className="text-lime">before it happens.</span>
      </h1>

      {/* Sub-headline */}
      <p className="mt-5 max-w-xl text-body-md text-chalk-lo sm:text-[17px] leading-relaxed">
        CashTwin models where your cash is heading — not just where it has been. See when your cash flow is likely to break, why, and the lowest-cost ways to recover.
      </p>

      {/* Pill CTA Buttons */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-lime/10">
          <Link to="/onboarding">
            Get started <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="rounded-full px-7">
          <Link to="/app">
            <PlayCircle className="h-4 w-4 mr-1" /> Book a demo
          </Link>
        </Button>
      </div>

      {/* Small Trust Features */}
      <div className="mt-9 flex flex-wrap items-center gap-6 text-label-xs uppercase text-chalk-lo">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> Zero Debt Push
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> Consent-First Privacy
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> 100% Explainable
        </span>
      </div>
    </div>
  );
}
