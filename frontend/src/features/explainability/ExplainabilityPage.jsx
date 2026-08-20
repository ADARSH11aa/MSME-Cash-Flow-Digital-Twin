import { useState } from 'react';
import cn from '@/lib/cn';
import CalculationLineage from '@/components/shared/CalculationLineage';
import Card from '@/components/shared/Card';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import { StaggerItem } from '@/components/shared/motion';
import useAsync from '@/hooks/useAsync';
import { getLineage } from '@/mocks/api/lineage';

/**
 * Explainability & data lineage (PRD 3.7) in the reference's three-column docs
 * layout — left section nav, centre content, right "on this page" outline.
 *
 * The centre column renders the same <CalculationLineage /> that the AppShell
 * drawer uses, so a figure explains itself identically wherever it is opened.
 */

const FIGURES = [
  { id: 'projected-cash', label: 'Projected balance' },
  { id: 'current-cash', label: 'Current cash' },
  { id: 'receivables', label: 'Outstanding receivables' },
];

const OUTLINE = [
  { id: 'ladder', label: 'Calculation ladder' },
  { id: 'sources', label: 'Where the numbers come from' },
  { id: 'corrections', label: 'Corrections & audit' },
];

export default function ExplainabilityPage() {
  const [figureId, setFigureId] = useState('projected-cash');
  const { data: lineage } = useAsync(() => getLineage(figureId), [figureId]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Explainability"
        title="Every number, traced to its source"
        subtitle="Nothing here is a black box. Open any line to see the record it came from, who corrected it, and when."
      />

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)_180px]">
        <nav aria-label="Figures" className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-4 text-label-xs uppercase text-chalk-lo">Figures</p>
          <ul className="space-y-1">
            {FIGURES.map((figure) => {
              const active = figure.id === figureId;
              return (
                <li key={figure.id}>
                  <button
                    type="button"
                    onClick={() => setFigureId(figure.id)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-left text-body-sm',
                      'transition-colors duration-hover ease-out',
                      active
                        ? 'bg-lime-8 font-medium text-chalk-hi'
                        : 'text-chalk-lo hover:bg-surface-2 hover:text-chalk-hi',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-hover',
                        active ? 'bg-lime' : 'bg-edge-dark',
                      )}
                      aria-hidden="true"
                    />
                    {figure.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 space-y-10">
          <StaggerItem as="section" index={0} id="ladder" className="scroll-mt-24">
            <h2 className="font-display text-heading-md text-chalk-hi">
              {lineage?.label ?? 'Calculation ladder'}
            </h2>
            <p className="mt-2 text-body-sm text-chalk-lo">{lineage?.explanation}</p>

            <div className="mt-6">
              {lineage ? (
                <CalculationLineage lineage={lineage} />
              ) : (
                <div className="space-y-2" aria-busy="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-control border border-edge-dark bg-surface"
                    />
                  ))}
                </div>
              )}
            </div>
          </StaggerItem>

          <StaggerItem as="section" index={1} id="sources" className="scroll-mt-24">
            <Card padding="lg">
              <h2 className="font-display text-heading-md text-chalk-hi">
                Where the numbers come from
              </h2>
              <p className="mt-2 max-w-2xl text-body-sm text-chalk-lo">
                Inflows come from your invoices, timed by how late each customer has actually paid
                in the past — not by the terms on the invoice. Outflows come from your recurring
                schedule and supplier POs. Nothing is estimated where a record exists.
              </p>
            </Card>
          </StaggerItem>

          <StaggerItem as="section" index={2} id="corrections" className="scroll-mt-24">
            <Card padding="lg">
              <h2 className="font-display text-heading-md text-chalk-hi">Corrections &amp; audit</h2>
              <p className="mt-2 max-w-2xl text-body-sm text-chalk-lo">
                When you correct an imported value, the original is kept alongside the correction,
                with who changed it and when. Every correction re-runs the forecast immediately and
                writes an entry to your audit log.
              </p>
            </Card>
          </StaggerItem>
        </div>

        <nav aria-label="On this page" className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          <p className="mb-4 text-label-xs uppercase text-chalk-lo">On this page</p>
          <ul className="space-y-2.5">
            {OUTLINE.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-body-sm text-chalk-lo transition-colors duration-hover ease-out hover:text-chalk-hi"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </PageContainer>
  );
}
