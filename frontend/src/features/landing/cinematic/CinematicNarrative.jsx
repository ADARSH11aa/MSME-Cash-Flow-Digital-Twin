import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/shared/Button';

export const STORY_STEPS = [
  {
    id: 'initial',
    eyebrow: 'Simple and integrated MSME cash-flow tools',
    titleLine1: 'Know your cash crunch',
    titleLine2: 'before it happens.',
    body: 'CashTwin models where your cash is heading — not just where it has been. See when your cash flow is likely to break, why, and the lowest-cost ways to recover.',
    showPrimaryCta: true,
    showTrustBadges: true,
  },
  {
    id: 'cash-position',
    eyebrow: '01 · REAL-TIME VISIBILITY',
    titleLine1: 'Know where',
    titleLine2: 'your cash stands.',
    body: 'Get a live, unified view of your available cash, real-time inflows, outflows, and true operating buffer across all linked business accounts.',
    showPrimaryCta: false,
    showTrustBadges: false,
  },
  {
    id: 'patterns',
    eyebrow: '02 · CASH-FLOW DRIVERS',
    titleLine1: "See what's",
    titleLine2: 'driving your cash.',
    body: 'Understand where money is coming from, where it is going, and which customer delay patterns are putting working capital under pressure.',
    showPrimaryCta: false,
    showTrustBadges: false,
  },
  {
    id: 'forecast',
    eyebrow: '03 · 3-BAND FORECASTING',
    titleLine1: "Know what's",
    titleLine2: 'coming next.',
    body: 'CashTwin turns your financial history into a forward-looking cash-flow forecast with optimistic, expected, and stress-tested projections.',
    showPrimaryCta: false,
    showTrustBadges: false,
  },
  {
    id: 'digital-twin',
    eyebrow: '04 · DIGITAL TWIN ENGINE',
    titleLine1: 'Your business.',
    titleLine2: 'Simulated in real time.',
    body: "CashTwin builds a living mathematical model of your business so you can understand how today's operational decisions alter tomorrow's liquidity.",
    showPrimaryCta: false,
    showTrustBadges: false,
  },
  {
    id: 'scenario',
    eyebrow: '05 · SHOCK SIMULATION',
    titleLine1: 'What if you could',
    titleLine2: 'test the decision first?',
    body: 'Simulate delayed client payments, revenue expansion, or supplier spikes in seconds before committing real capital.',
    showPrimaryCta: false,
    showTrustBadges: false,
  },
  {
    id: 'risk',
    eyebrow: '06 · RISK RADAR',
    titleLine1: 'Spot the cash gap',
    titleLine2: 'before it hits.',
    body: 'Identify potential liquidity shortfalls 28 to 45 days in advance and evaluate self-recovery options with zero debt burden.',
    showPrimaryCta: false,
    showTrustBadges: false,
  },
  {
    id: 'ai-insight',
    eyebrow: '07 · EXPLAINABLE INTELLIGENCE',
    titleLine1: "Don't just see numbers.",
    titleLine2: 'Understand them.',
    body: 'CashTwin translates raw telemetry into clear, auditable guidance and actionable next steps compliant with DPDP privacy standards.',
    showPrimaryCta: false,
    showTrustBadges: false,
  },
  {
    id: 'final-cta',
    eyebrow: 'DECIDE WITH CONFIDENCE',
    titleLine1: 'Make your next decision',
    titleLine2: 'with confidence.',
    body: "Build a clearer picture of what's happening now — and what's coming next. Connect your business in minutes with zero debt push.",
    showPrimaryCta: true,
    showTrustBadges: true,
  },
];

export default function CinematicNarrative({ stateIndex = 0 }) {
  const currentStep = STORY_STEPS[Math.min(stateIndex, STORY_STEPS.length - 1)];

  return (
    <div className="flex flex-col items-start text-left min-h-[380px] justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={stateIndex}
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start"
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-edge-dark/80 bg-surface/80 px-4 py-1.5 text-body-sm text-chalk-lo shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
            <span className="font-mono text-xs tracking-wider uppercase">{currentStep.eyebrow}</span>
          </div>

          {/* Display Headline */}
          <h1 className="mt-6 font-display text-[40px] sm:text-[50px] lg:text-[60px] font-bold leading-[1.05] tracking-[-0.03em] text-chalk-hi">
            {currentStep.titleLine1} <br />
            <span className="text-lime">{currentStep.titleLine2}</span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-5 max-w-xl text-body-md text-chalk-lo sm:text-[17px] leading-relaxed">
            {currentStep.body}
          </p>

          {/* CTA Buttons for Start, End, or Direct Action */}
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

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center gap-5 text-label-xs uppercase text-chalk-lo">
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
