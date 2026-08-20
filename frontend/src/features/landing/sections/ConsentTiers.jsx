import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ArrowRight, ChevronLeft, ChevronRight, Quote, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import cn from '@/lib/cn';
import Button from '@/components/shared/Button';
import EyebrowLabel from '@/components/shared/EyebrowLabel';

/**
 * Interactive Consent & Testimonial Card Deck (PRD 3.1.8) —
 * Uniform, fully opaque stacked cards with click-driven reveals, rich typography, and consistent styling across all tiers.
 */

const TIERS = [
  {
    id: 'tier-1',
    number: '01',
    tag: 'Starter Scope',
    name: 'Analysis only',
    summary: 'Understand where your cash stands today without forward commitments or predictions.',
    testimonial: {
      quote: 'We started with historical invoice analysis to clean up our ledger without exposing any future sales forecasts.',
      author: 'Rajesh K.',
      role: 'MD, Precision Components, Pune',
      badge: 'Verified MSME Owner',
    },
    features: [
      'Invoice and expense analysis',
      'Customer concentration view',
      'Full calculation lineage & audit',
      'No forward forecasting access',
    ],
  },
  {
    id: 'tier-2',
    number: '02',
    tag: 'Core Scope',
    name: 'Analysis + forecasting',
    summary: 'Add the forward predictive view, stress scenarios, and early liquidity breach alerts.',
    testimonial: {
      quote: 'The 30-day delay scenario simulation saved us from a ₹4.2L payroll crunch. Having this foresight is non-negotiable.',
      author: 'Mark Hussain',
      role: 'Founder, Hussain Crafts, Moradabad',
      badge: 'Active Twin User',
    },
    features: [
      'Everything in Analysis only',
      'Forward forecast to 90 days',
      'Days-to-breach early warning',
      'Scenario & stress simulator',
      'Non-debt recovery roadmap',
      'Cash runway stress testing',
    ],
  },
  {
    id: 'tier-3',
    number: '03',
    tag: 'Advisory Scope',
    name: '+ Advisor sharing',
    summary: 'Share a read-only verified summary with your chartered accountant, auditor, or lender.',
    testimonial: {
      quote: 'Our CA logs in with read-only view before quarterly filings. No raw passwords shared, with every query recorded in the audit log.',
      author: 'Ananya S.',
      role: 'Partner, Modern Textiles, Surat',
      badge: 'Multi-party Consent',
    },
    features: [
      'Everything in Forecasting',
      'Read-only CA or lender view',
      'Revocable at any single click',
      'Every access written to immutable log',
    ],
  },
];

export default function ConsentTiers() {
  const [activeIndex, setActiveIndex] = useState(0); // Default to Tier 1
  const prefersReduced = useReducedMotion();

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TIERS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TIERS.length) % TIERS.length);
  };

  return (
    <section id="consent" className="relative border-b border-edge-dark py-20 md:py-28 bg-void overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-lime/10 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        {/* Header */}
        <div className="text-center">
          <EyebrowLabel className="mx-auto">Consent, not cost</EyebrowLabel>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-[32px] sm:text-[38px] md:text-display-lg leading-tight tracking-[-0.02em] text-[#0D1720] font-bold">
            Choose what you share. <br className="hidden sm:inline" />
            <span className="text-[#24D6A0]">Change it any time.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-sm text-[#6E7D87]">
            CashTwin is consent-governed. You pick the tier of access that fits your business; you can upgrade, downgrade, or revoke consent in settings at any moment.
          </p>
        </div>

        {/* Tier Switcher Tabs (Clickable buttons above the stack) */}
        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-edge-dark bg-surface p-1.5 shadow-[0_4px_20px_rgba(11,23,32,0.06)] backdrop-blur-md">
            {TIERS.map((tier, i) => {
              const isSelected = activeIndex === i;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 select-none cursor-pointer',
                    isSelected
                      ? 'bg-[#0B1720] text-white shadow-md font-bold'
                      : 'text-[#6E7D87] hover:text-[#0D1720] hover:bg-surface-2',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                        isSelected ? 'bg-white text-[#0B1720]' : 'bg-surface-2 text-[#6E7D87]',
                      )}
                    >
                      {i + 1}
                    </span>
                    {tier.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Perspective Stacked Card Deck Container */}
        <div
          className="relative mx-auto mt-12 max-w-3xl min-h-[530px] md:min-h-[530px]"
          style={{ perspective: '1200px' }}
        >
          {TIERS.map((tier, index) => {
            const position = index - activeIndex;
            const isCurrent = index === activeIndex;

            let yOffset = 0;
            let scale = 1;
            let opacity = 1;
            let zIndex = 10;

            if (isCurrent) {
              yOffset = 0;
              scale = 1;
              opacity = 1;
              zIndex = 30;
            } else {
              // Non-active cards stack upwards at top edge with depth
              const depth = Math.abs(position);
              yOffset = -depth * 18;
              scale = Math.max(0.88, 1 - depth * 0.045);
              opacity = Math.max(0.4, 0.75 - depth * 0.2);
              zIndex = 20 - depth * 5;
            }

            const cardContent = (
              <div
                className="relative flex h-full flex-col justify-between rounded-2xl p-6 sm:p-7 md:p-8 transition-all duration-300 shadow-[0_20px_50px_rgba(11,23,32,0.08)] bg-surface border border-edge-dark"
              >
                <div>
                  {/* Top Status & Badge Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge-dark pb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0D1720] bg-[#24D6A0]/15 px-2.5 py-0.5 rounded-md border border-[#24D6A0]/30">
                        TIER {tier.number}
                      </span>
                      <span className="text-xs text-[#6E7D87] font-medium tracking-wide uppercase font-mono">
                        {tier.tag}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs text-[#6E7D87] font-medium">
                      <ShieldCheck className="h-4 w-4 text-[#24D6A0]" /> DPDP Act Compliant
                    </span>
                  </div>

                  {/* Headline & Summary */}
                  <div className="mt-4">
                    <h3 className="font-display text-2xl sm:text-[26px] font-bold text-[#0D1720] tracking-tight">
                      {tier.name}
                    </h3>
                    <p className="mt-1.5 text-body-sm text-[#6E7D87] leading-relaxed max-w-xl">
                      {tier.summary}
                    </p>
                  </div>

                  {/* Testimonial Quote Box */}
                  <div className="mt-4 rounded-xl border border-edge-dark bg-surface-2 p-3.5 sm:p-4 text-[#0D1720] shadow-inner">
                    <div className="flex items-start gap-3">
                      <Quote className="h-4 w-4 text-[#24D6A0] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs sm:text-[13px] italic text-[#0D1720] leading-snug">
                          &ldquo;{tier.testimonial.quote}&rdquo;
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 font-mono text-[11px]">
                          <span className="text-[#0D1720] font-bold">
                            {tier.testimonial.author} &middot; <span className="text-[#6E7D87] font-normal">{tier.testimonial.role}</span>
                          </span>
                          <span className="text-[10px] text-[#6E7D87] bg-surface px-2 py-0.5 rounded border border-edge-dark">
                            {tier.testimonial.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mt-4 pt-3.5 border-t border-edge-dark">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#6E7D87] font-semibold mb-2.5">
                      Included Capabilities &amp; Permissions:
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-[#0D1720]">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#24D6A0]" aria-hidden="true" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Button - safely inside the card */}
                <div className="mt-5 pt-2">
                  <Button
                    asChild
                    className="w-full rounded-full h-11 font-bold text-sm shadow-lg transition-all bg-[#0B1720] text-white hover:bg-[#182635] shadow-[0_4px_16px_rgba(11,23,32,0.15)]"
                  >
                    <Link to="/onboarding">
                      Choose {tier.name} <ArrowRight className="h-4 w-4 ml-1.5 text-[#24D6A0]" />
                    </Link>
                  </Button>
                </div>
              </div>
            );

            return (
              <motion.div
                key={tier.id}
                onClick={() => !isCurrent && setActiveIndex(index)}
                animate={
                  prefersReduced
                    ? { opacity: isCurrent ? 1 : 0 }
                    : {
                        scale,
                        y: yOffset,
                        opacity,
                      }
                }
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 32,
                }}
                className={cn(
                  'absolute inset-0 select-none transition-shadow',
                  isCurrent ? 'cursor-default pointer-events-auto' : 'cursor-pointer hover:opacity-90',
                )}
                style={{
                  zIndex,
                  transformOrigin: 'top center',
                }}
              >
                {cardContent}
              </motion.div>
            );
          })}
        </div>

        {/* Deck Navigation Controls & Dot Indicators */}
        <div className="mt-14 flex items-center justify-between max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous tier"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-edge-dark bg-surface text-[#0D1720] transition-colors hover:border-[#0B1720] hover:bg-surface-2 cursor-pointer shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next tier"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-edge-dark bg-surface text-[#0D1720] transition-colors hover:border-[#0B1720] hover:bg-surface-2 cursor-pointer shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {TIERS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to tier ${i + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 cursor-pointer',
                  activeIndex === i ? 'w-7 bg-[#24D6A0] shadow-[0_0_10px_rgba(36,214,160,0.4)]' : 'w-2 bg-[#E6E1D6] hover:bg-[#6E7D87]',
                )}
              />
            ))}
          </div>

          <span className="font-mono text-xs text-[#6E7D87]">
            Tier <strong className="text-[#0D1720]">{activeIndex + 1}</strong> of {TIERS.length}
          </span>
        </div>
      </div>
    </section>
  );
}
