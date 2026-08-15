import { useState } from 'react';
import cn from '@/lib/cn';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import Reveal from './Reveal';

/**
 * How it works (PRD 3.1.5) — a genuine sequence, so numbering is justified.
 * Uses the reference's left-list / right-media layout with the list acting as
 * a selector for the panel beside it.
 */

const STEPS = [
  {
    n: '01',
    title: 'Connect & consent',
    body: 'You choose exactly what CashTwin may analyse — invoices, payment history, forecasting — and can withdraw any of it later. Nothing is read before you agree to it.',
    panel: ['Invoice analysis', 'Payment-history analysis', 'Forecasting', 'Lender sharing — off'],
  },
  {
    n: '02',
    title: 'See your forecast',
    body: 'Import invoices and obligations, and your twin projects cash forward 7 to 90 days, with a single headline number: how long until you run tight.',
    panel: ['28 days to breach', '₹1.52L projected close', '53% customer concentration'],
  },
  {
    n: '03',
    title: 'Stress-test scenarios',
    body: 'Ask what happens if your biggest customer pays 30 days late, or sales fall 20%. Numbers recalculate in front of you.',
    panel: ['Customer delay +30d', 'Sales −20%', 'Supplier costs +15%', 'Combined shock'],
  },
  {
    n: '04',
    title: 'Compare recovery options',
    body: 'Non-debt actions are ranked first — delay a spend, renegotiate terms, offer an early-payment discount — before any financing is shown.',
    panel: ['Supplier extension — ₹0', 'Early-payment discount', 'Invoice financing', 'Working capital'],
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section id="how-it-works" className="border-b border-edge-dark py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <EyebrowLabel>How it works</EyebrowLabel>
          <h2 className="mt-6 max-w-2xl font-display text-[32px] leading-tight tracking-[-0.02em] text-chalk-hi md:text-display-lg">
            Everything your cash position runs on
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
          <ol className="space-y-0">
            {STEPS.map((s, i) => (
              <li key={s.n}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className={cn(
                    'flex w-full items-center gap-3 border-b py-4 text-left transition-colors',
                    i === active
                      ? 'border-chalk-hi text-chalk-hi'
                      : 'border-edge-dark text-chalk-lo hover:text-chalk-hi',
                  )}
                >
                  <span
                    className={cn('h-1.5 w-1.5 shrink-0', i === active ? 'bg-lime' : 'bg-chalk-lo')}
                    aria-hidden="true"
                  />
                  <span data-numeric className="text-label-xs uppercase tabular">
                    {s.n}
                  </span>
                  <span className="text-label-xs uppercase">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="grid gap-0 border border-edge-dark bg-surface md:grid-cols-2">
            <div className="flex flex-col justify-between gap-8 p-7">
              <div>
                <h3 className="font-display text-display-md text-chalk-hi">{step.title}</h3>
                <p className="mt-4 text-body-md text-chalk-lo">{step.body}</p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2.5 border-t border-edge-dark bg-void p-7 md:border-l md:border-t-0">
              {step.panel.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 border border-edge-dark bg-surface px-3.5 py-2.5"
                >
                  <span className="h-1.5 w-1.5 shrink-0 bg-lime" aria-hidden="true" />
                  <span className="text-body-sm text-chalk-hi">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
