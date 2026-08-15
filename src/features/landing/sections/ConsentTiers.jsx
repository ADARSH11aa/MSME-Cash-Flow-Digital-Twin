import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import cn from '@/lib/cn';
import BracketFrame from '@/components/shared/BracketFrame';
import Button from '@/components/shared/Button';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import Reveal from './Reveal';

/**
 * "Consent, not cost" (PRD 3.1.8) — styled with rounded cards and pill buttons.
 */

const TIERS = [
  {
    name: 'Analysis only',
    summary: 'Understand where your cash stands today.',
    elevated: false,
    features: [
      'Invoice and expense analysis',
      'Customer concentration view',
      'Full calculation lineage',
      'No forward forecasting',
    ],
  },
  {
    name: 'Analysis + forecasting',
    summary: 'Add the forward predictive view and scenario testing.',
    elevated: true,
    features: [
      'Everything in Analysis only',
      'Forward forecast to 90 days',
      'Days-to-breach early warning',
      'Scenario & stress simulator',
      'Non-debt recovery roadmap',
    ],
  },
  {
    name: '+ Advisor sharing',
    summary: 'Share a read-only summary with an auditor or advisor.',
    elevated: false,
    features: [
      'Everything in Forecasting',
      'Read-only advisor or lender view',
      'Revocable at any single click',
      'Every access written to immutable log',
    ],
  },
];

export default function ConsentTiers() {
  return (
    <section id="consent" className="border-b border-edge-dark py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="text-center">
          <EyebrowLabel className="mx-auto">Consent, not cost</EyebrowLabel>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-[34px] leading-tight tracking-[-0.02em] text-chalk-hi md:text-display-lg">
            You choose what CashTwin may see
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-body-md text-chalk-lo">
            Consent is granular, explicit, and revocable. Nothing is analysed before you allow it, and turning off a scope takes effect immediately.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => {
            const card = (
              <div
                className={cn(
                  'flex h-full flex-col justify-between gap-6 rounded-2xl border p-8 shadow-sm transition-all',
                  tier.elevated
                    ? 'border-lime/60 bg-surface-2 shadow-xl shadow-lime/5 ring-1 ring-lime/30'
                    : 'border-edge-dark bg-surface hover:border-edge-dark/80 hover:bg-surface-2'
                )}
              >
                <div className="space-y-3">
                  {tier.elevated ? (
                    <span className="inline-block rounded-full bg-lime px-3 py-1 text-label-xs uppercase font-semibold text-ink-hi">
                      Most owners start here
                    </span>
                  ) : null}
                  <h3 className="font-display text-heading-md font-semibold text-chalk-hi">{tier.name}</h3>
                  <p className="text-body-sm text-chalk-lo leading-relaxed">{tier.summary}</p>
                </div>

                <ul className="flex-1 space-y-3 border-t border-edge-dark/60 pt-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-body-sm text-chalk-lo">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={tier.elevated ? 'primary' : 'secondary'}
                  className="w-full rounded-full"
                >
                  <Link to="/onboarding">
                    Choose scopes <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            );

            return (
              <Reveal key={tier.name} index={i} className="h-full">
                {tier.elevated ? (
                  <BracketFrame tone="accent" className="h-full">
                    {card}
                  </BracketFrame>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
