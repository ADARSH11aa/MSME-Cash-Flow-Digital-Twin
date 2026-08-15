import {
  Boxes,
  GitBranch,
  LineChart,
  PencilRuler,
  ShieldQuestion,
  Users,
} from 'lucide-react';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import Reveal from './Reveal';

/** Core modules grid (PRD 3.1.6), in the reference's capability-card style. */

const MODULES = [
  {
    Icon: LineChart,
    title: 'Cash-flow forecasting',
    body: 'Projects your position 7 to 90 days ahead from real invoices and obligations.',
  },
  {
    Icon: Users,
    title: 'Payment behaviour intelligence',
    body: 'Learns how late each customer actually pays, rather than trusting agreed terms.',
  },
  {
    Icon: Boxes,
    title: 'Customer concentration risk',
    body: 'Flags when too much of your cash depends on one buyer settling on time.',
  },
  {
    Icon: GitBranch,
    title: 'Liquidity recovery simulator',
    body: 'Tests shocks and recovery actions side by side before you commit to either.',
  },
  {
    Icon: ShieldQuestion,
    title: 'Explainable recommendations',
    body: 'Every figure opens up into the invoices and payments that produced it.',
  },
  {
    Icon: PencilRuler,
    title: 'Correctable financial AI',
    body: 'Wrong import? Fix the value and the whole forecast recalculates immediately.',
  },
];

export default function ModulesGrid() {
  return (
    <section id="modules" className="border-b border-edge-dark py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <EyebrowLabel>Core capabilities</EyebrowLabel>
          <h2 className="mt-6 max-w-2xl font-display text-[32px] leading-tight tracking-[-0.02em] text-chalk-hi md:text-display-lg">
            Six modules, one cash position
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px border border-edge-dark bg-edge-dark sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module, i) => (
            <Reveal key={module.title} index={i} className="bg-surface">
              <div className="group h-full p-7 transition-colors hover:bg-surface-2">
                <module.Icon className="h-6 w-6 text-lime" aria-hidden="true" />
                <h3 className="mt-6 font-display text-heading-md text-chalk-hi">{module.title}</h3>
                <p className="mt-2.5 text-body-sm text-chalk-lo">{module.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
