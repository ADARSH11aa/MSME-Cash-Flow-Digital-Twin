import { Banknote, Clock, Receipt } from 'lucide-react';
import BracketFrame from '@/components/shared/BracketFrame';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import { formatCurrency } from '@/lib/format';
import Reveal from './Reveal';

/**
 * The problem section on light canvas (PRD 3.1.4), using the concept doc's
 * ABC-Furniture-style worked example in the reference's 3-card row.
 */

const CARDS = [
  {
    Icon: Banknote,
    label: 'Cash today',
    value: 240000,
    body: 'Looks comfortable. This is the number most accounting software shows you.',
  },
  {
    Icon: Receipt,
    label: 'Receivables outstanding',
    value: 800000,
    body: 'Money you have earned but do not hold. Profit on paper, not in the bank.',
  },
  {
    Icon: Clock,
    label: 'Payments due in 30 days',
    value: 700000,
    body: 'Salaries, suppliers and rent that will not wait for your customers to pay.',
  },
];

export default function ProblemSection() {
  return (
    <section className="border-b border-edge-light bg-light py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <EyebrowLabel onLight filled>
            The problem
          </EyebrowLabel>
          <h2 className="mt-6 max-w-2xl font-display text-[32px] leading-tight tracking-[-0.02em] text-ink-hi md:text-display-lg">
            Profitable and still out of cash.
          </h2>
          <p className="mt-5 max-w-2xl text-body-md text-ink-lo">
            A furniture workshop books a strong quarter. On paper it is doing well. In practice its
            largest customer pays 28 days beyond terms, and payroll does not move. Accounting tells
            it what happened. Nothing tells it what is about to.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.label} index={i}>
              <BracketFrame tone="neutral" onLight className="h-full">
                <div className="flex h-full flex-col gap-4 border border-edge-light bg-light-card p-6">
                  <card.Icon className="h-5 w-5 text-ink-lo" aria-hidden="true" />
                  <span className="text-label-xs uppercase text-ink-lo">{card.label}</span>
                  <span
                    data-numeric
                    className="font-display text-display-md tabular text-ink-hi"
                  >
                    {formatCurrency(card.value)}
                  </span>
                  <p className="text-body-sm text-ink-lo">{card.body}</p>
                </div>
              </BracketFrame>
            </Reveal>
          ))}
        </div>

        <Reveal index={3}>
          <p className="mt-10 max-w-2xl border-l-2 border-ink-hi pl-5 text-body-md text-ink-hi">
            The business is profitable. It is also 12 days from being unable to pay its staff. Those
            two facts live in the same spreadsheet, and nothing connects them.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
