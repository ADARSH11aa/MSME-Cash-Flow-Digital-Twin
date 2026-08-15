import { Quote } from 'lucide-react';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import Reveal from './Reveal';

/**
 * Trust section (PRD 3.1.7) in the reference's asymmetric grid — one large
 * quote card beside two stat cards.
 *
 * The quote is written as an illustrative composite rather than attributed to
 * a named business, since inventing a real-sounding testimonial for a product
 * that has no users yet would be a fabricated endorsement.
 */

const STATS = [
  { value: '28 days', label: 'Typical early warning before a shortfall' },
  { value: '₹0', label: 'Cost of the non-debt actions tried first' },
];

export default function TrustSection() {
  return (
    <section className="border-b border-edge-dark py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <EyebrowLabel>What it changes</EyebrowLabel>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <figure className="flex h-full flex-col justify-between gap-8 border border-edge-dark bg-surface p-8">
              <Quote className="h-7 w-7 text-lime" aria-hidden="true" />
              <blockquote className="font-display text-[26px] leading-snug tracking-[-0.01em] text-chalk-hi md:text-[30px]">
                “The month I could not make payroll, my books said I was profitable. I did not need
                another report telling me what happened. I needed three weeks of warning.”
              </blockquote>
              <figcaption className="text-body-sm text-chalk-lo">
                Illustrative — the situation CashTwin is built for, not a customer endorsement.
              </figcaption>
            </figure>
          </Reveal>

          <div className="grid gap-5">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} index={i + 1}>
                <div className="flex h-full flex-col justify-center gap-2 border border-edge-dark bg-surface p-8">
                  <span
                    data-numeric
                    className="font-display text-display-lg tabular text-lime"
                  >
                    {stat.value}
                  </span>
                  <span className="text-body-sm text-chalk-lo">{stat.label}</span>
                </div>
              </Reveal>
            ))}
            <Reveal index={3}>
              <div className="flex h-full flex-col justify-center gap-2 border border-edge-dark bg-surface p-8">
                <span data-numeric className="font-display text-display-lg tabular text-lime">
                  100%
                </span>
                <span className="text-body-sm text-chalk-lo">
                  Of figures traceable back to a source record
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
