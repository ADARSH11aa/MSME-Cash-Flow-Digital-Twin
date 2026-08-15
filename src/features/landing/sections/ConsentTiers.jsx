import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import cn from '@/lib/cn';
import BracketFrame from '@/components/shared/BracketFrame';
import Button from '@/components/shared/Button';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import Reveal from './Reveal';

/**
 * "Consent, not cost" (PRD 3.1.8) — the reference's pricing table repurposed
 * to show the three consent tiers, which is a more honest use of the pattern
 * than inventing price points for a product that does not have them.
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
      'No forecasting',
    ],
  },
  {
    name: 'Analysis + forecasting',
    summary: 'Add the forward view and scenario testing.',
    elevated: true,
    features: [
      'Everything in Analysis only',
      'Forward forecast to 90 days',
      'Days-to-breach warning',
      'Scenario and stress testing',
      'Recovery recommendations',
    ],
  },
  {
    name: '+ Advisor sharing',
    summary: 'Share a read-only summary with someone you choose.',
    elevated: false,
    features: [
      'Everything in Forecasting',
      'Read-only advisor or lender view',
      'Revocable at any time',
      'Every access written to your audit log',
    ],
  },
];

export default function ConsentTiers() {
  return (
    <section id="consent" className="border-b border-edge-dark py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="text-center">
          <EyebrowLabel className="mx-auto">Consent, not cost</EyebrowLabel>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-[32px] leading-tight tracking-[-0.02em] text-chalk-hi md:text-display-lg">
            You choose what CashTwin may see
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-body-md text-chalk-lo">
            Consent is granular and revocable. Nothing is analysed before you allow it, and turning
            something off takes effect immediately.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {TIERS.map((tier, i) => {
            const card = (
              <div
                className={cn(
                  'flex h-full flex-col gap-6 border p-7',
                  tier.elevated ? 'border-lime/50 bg-surface-2' : 'border-edge-dark bg-surface',
                )}
              >
                <div className="space-y-3">
                  {tier.elevated ? (
                    <span className="inline-block bg-lime px-2 py-1 text-label-xs uppercase text-ink-hi">
                      Most owners start here
                    </span>
                  ) : null}
                  <h3 className="font-display text-heading-md text-chalk-hi">{tier.name}</h3>
                  <p className="text-body-sm text-chalk-lo">{tier.summary}</p>
                </div>

                <ul className="flex-1 space-y-2.5 border-t border-edge-dark pt-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-body-sm text-chalk-lo">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button asChild variant={tier.elevated ? 'primary' : 'secondary'} className="w-full">
                  <Link to="/onboarding">
                    Choose scopes <ArrowRight className="h-4 w-4" />
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
