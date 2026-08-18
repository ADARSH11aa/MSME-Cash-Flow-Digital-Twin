import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Battery,
  Bell,
  CheckCircle2,
  Clock,
  PlayCircle,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Wifi,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/shared/Button';
import Figure from '@/components/shared/Figure';
import StatsCounter from '@/components/shared/StatsCounter';
import { BUSINESS } from '@/mocks/fixtures/business';
import { buildForecast } from '@/mocks/fixtures/forecastEngine';

/**
 * Hero (PRD 3.1.2) styled after the premium reference layout:
 * Left: Clean pill eyebrow, bold display typography, subtext, and pill CTA buttons.
 * Right: Realistic tall flagship smartphone mockup matching reference frame.
 */
export default function Hero() {
  const prefersReduced = useReducedMotion();
  const { daysToBreach } = buildForecast({ horizon: 30 });

  return (
    <section className="relative overflow-hidden border-b border-edge-dark bg-void py-16 md:py-24 lg:py-28">
      {/* Soft ambient gradient glow with Cream, Green & Cyan atmosphere */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full opacity-15 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #24D6A0 0%, rgba(38, 198, 218, 0.4) 40%, rgba(76, 125, 255, 0.2) 70%, transparent 80%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-[450px] w-[450px] rounded-full opacity-10 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #24D6A0 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* Left Column: Typography & CTAs */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start text-left"
          >
            {/* Pill Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-edge-dark bg-surface px-4 py-1.5 text-body-sm text-[#0D1720] shadow-[0_2px_12px_rgba(11,23,32,0.04)] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#24D6A0] animate-pulse" />
              <span className="font-medium">Simple and integrated MSME cash-flow tools</span>
            </div>

            {/* Display Headline */}
            <h1 className="mt-7 font-display text-[44px] sm:text-[56px] lg:text-[66px] font-bold leading-[1.04] tracking-[-0.03em] text-[#0D1720]">
              Know your cash crunch <br />
              <span className="text-[#24D6A0]">before it happens.</span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-5 max-w-xl text-body-md text-[#6E7D87] sm:text-[17px] leading-relaxed">
              CashTwin models where your cash is heading — not just where it has been. See when your cash flow is likely to break, why, and the lowest-cost ways to recover.
            </p>

            {/* Pill CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-[#24D6A0]/25 bg-[#24D6A0] text-[#0D1720] font-bold hover:bg-[#1EB889]">
                <Link to="/onboarding">
                  Get started <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-full px-7 bg-surface border-edge-dark text-[#0D1720] hover:bg-surface-2 hover:border-[#0B1720]">
                <Link to="/app">
                  <PlayCircle className="h-4 w-4 mr-1 text-[#4C7DFF]" /> Book a demo
                </Link>
              </Button>
            </div>

            {/* Small trust features */}
            <div className="mt-9 flex flex-wrap items-center gap-6 text-label-xs uppercase text-[#6E7D87]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#24D6A0]" /> Zero Debt Push
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#24D6A0]" /> Consent-First Privacy
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#24D6A0]" /> 100% Explainable
              </span>
            </div>
          </motion.div>

          {/* Right Column: Tall Smartphone Mockup matching Reference Image */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReduced ? 0.01 : 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-[310px] sm:max-w-[325px]"
          >
            {/* Phone Outer Shell with Metallic Border */}
            <div className="relative rounded-[50px] border-[4px] border-[#CBD5E1] bg-[#0B1720] shadow-[0_30px_90px_rgba(11,23,32,0.18)] p-[3px]">
              {/* Inner Bezel Frame */}
              <div className="relative rounded-[45px] border-[6px] border-[#0B1720] bg-surface overflow-hidden shadow-inner flex flex-col min-h-[610px]">
                {/* Phone Status Bar */}
                <div className="flex items-center justify-between px-6 pt-3.5 pb-2 text-label-xs text-[#6E7D87]">
                  <span className="font-semibold text-[#0D1720] tracking-tight text-[12px]">9:41</span>
                  {/* Dynamic Island Pill with Camera Glare Dot */}
                  <div className="flex items-center justify-end h-5 w-24 rounded-full bg-[#0B1720] px-2.5 shadow-sm border border-white/10">
                    <span className="h-2 w-2 rounded-full bg-[#111F2B] ring-1 ring-[#26C6DA]/30" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[#0D1720]">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* In-app Screen Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 bg-void/50">
                  {/* User Profile Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#24D6A0]/15 border border-[#24D6A0]/30 text-[#24D6A0] font-display font-bold text-sm">
                        MH
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6E7D87] leading-none">Welcome Back,</p>
                        <p className="font-display text-[14px] font-semibold text-[#0D1720] leading-tight mt-1">
                          Mark Hussain
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="relative flex h-8 w-8 items-center justify-center rounded-full border border-edge-dark bg-surface text-[#6E7D87] hover:text-[#0D1720]"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#24D6A0]" />
                    </button>
                  </div>

                  {/* 2x2 Sparkline Stat Cards Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Card 1: Operating Cash */}
                    <div className="rounded-xl border border-edge-dark bg-surface p-3 flex flex-col justify-between shadow-[0_2px_8px_rgba(11,23,32,0.04)]">
                      <div className="flex items-center justify-between">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#24D6A0]/15 text-[#24D6A0]">
                          <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                        <MicroSparkline stroke="#24D6A0" />
                      </div>
                      <div className="mt-3">
                        <p className="font-display text-[15px] font-bold text-[#0D1720] leading-tight">
                          <Figure value={BUSINESS.currentCash} variant="currencyShort" />
                        </p>
                        <p className="text-[10px] uppercase text-[#6E7D87] mt-0.5 font-medium">Cash Today</p>
                        <p className="text-[10px] text-[#24D6A0] font-medium mt-0.5">+5.4% buffer</p>
                      </div>
                    </div>
                    {/* Card 2: Time to hire / Days to breach */}
                    <div className="rounded-xl border border-edge-dark bg-surface p-3 flex flex-col justify-between shadow-[0_2px_8px_rgba(11,23,32,0.04)]">
                      <div className="flex items-center justify-between">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FFB238]/15 text-[#FFB238]">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <MicroSparkline stroke="#FFB238" />
                      </div>
                      <div className="mt-3">
                        <p className="font-display text-[15px] font-bold text-[#FFB238] tabular leading-tight">
                          <StatsCounter value={daysToBreach} suffix=" days" duration={1.4} />
                        </p>
                        <p className="text-[10px] uppercase text-[#6E7D87] mt-0.5 font-medium">To Breach</p>
                        <p className="text-[10px] text-[#FFB238] font-medium mt-0.5">Buffer watch</p>
                      </div>
                    </div>

                    {/* Card 3: Attendance / Receivables */}
                    <div className="rounded-xl border border-edge-dark bg-surface p-3 flex flex-col justify-between shadow-[0_2px_8px_rgba(11,23,32,0.04)]">
                      <div className="flex items-center justify-between">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4C7DFF]/15 text-[#4C7DFF]">
                          <Receipt className="h-3.5 w-3.5" />
                        </div>
                        <MicroSparkline stroke="#4C7DFF" />
                      </div>
                      <div className="mt-3">
                        <p className="font-display text-[15px] font-bold text-[#0D1720] leading-tight">
                          ₹8.00L
                        </p>
                        <p className="text-[10px] uppercase text-[#6E7D87] mt-0.5 font-medium">Receivables</p>
                        <p className="text-[10px] text-[#6E7D87] mt-0.5">14 Invoices</p>
                      </div>
                    </div>

                    {/* Card 4: Performance / Model Health */}
                    <div className="rounded-xl border border-edge-dark bg-surface p-3 flex flex-col justify-between shadow-[0_2px_8px_rgba(11,23,32,0.04)]">
                      <div className="flex items-center justify-between">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#26C6DA]/15 text-[#26C6DA]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </div>
                        <MicroSparkline stroke="#26C6DA" />
                      </div>
                      <div className="mt-3">
                        <p className="font-display text-[15px] font-bold text-[#0D1720] leading-tight">
                          <StatsCounter value={98.4} decimals={1} suffix="%" duration={1.6} />
                        </p>
                        <p className="text-[10px] uppercase text-[#6E7D87] mt-0.5 font-medium">Accuracy</p>
                        <p className="text-[10px] text-[#24D6A0] font-medium mt-0.5">+10 from last wk</p>
                      </div>
                    </div>
                  </div>

                  {/* Overview Section */}
                  <div className="rounded-xl border border-edge-dark bg-surface p-3.5 shadow-[0_2px_8px_rgba(11,23,32,0.04)]">
                    <div className="flex items-center justify-between pb-2 border-b border-edge-dark">
                      <span className="text-[12px] font-semibold text-[#0D1720]">Inflow Settlement</span>
                      <span className="text-[10px] text-[#24D6A0] font-semibold">See All</span>
                    </div>

                    <div className="mt-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#24D6A0]" />
                          <div>
                            <p className="text-[#0D1720] text-[12px] font-medium leading-tight">Herry Kane</p>
                            <p className="text-[10px] text-[#6E7D87]">Woodcrafts</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#24D6A0]">75%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#4C7DFF]" />
                          <div>
                            <p className="text-[#0D1720] text-[12px] font-medium leading-tight">Herry Brooks</p>
                            <p className="text-[10px] text-[#6E7D87]">Textiles</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#4C7DFF]">50%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#FF4D6D]" />
                          <div>
                            <p className="text-[#0D1720] text-[12px] font-medium leading-tight">Ross Teylar</p>
                            <p className="text-[10px] text-[#6E7D87]">Hardware</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#FF4D6D]">Overdue</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Strip & Home Indicator Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between rounded-lg bg-[#24D6A0]/10 border border-[#24D6A0]/30 px-3 py-1.5 mb-2">
                      <span className="text-[11px] text-[#0D1720] font-medium flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#24D6A0]" /> Automated Sync
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#24D6A0]">Active</span>
                    </div>

                    <div className="flex justify-center pt-1">
                      <div className="h-1 w-28 rounded-full bg-[#6E7D87]/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Lightweight micro sparkline SVG for the 2x2 phone grid */
function MicroSparkline({ stroke }) {
  return (
    <svg width="36" height="16" viewBox="0 0 36 16" fill="none" className="shrink-0" aria-hidden="true">
      <path
        d="M2 12L8 7L14 11L21 3L27 8L33 2"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
