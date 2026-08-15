import { ChevronDown, FileText, UserPen } from 'lucide-react';
import { useState } from 'react';
import cn from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import Figure from './Figure';
import Pill from './Pill';

/**
 * The calculation ladder from PRD 3.7 / concept doc §12: every figure in the
 * product can be opened up into the line items that produced it, and each line
 * item can be opened further into its source record.
 *
 * Deliberately layout-agnostic so the same component serves both placements
 * the PRD requires — full page on the Explainability screen, and inside the
 * slide-over Sheet opened by any <Figure figureId="…" />.
 *
 * @param {{
 *   lineage: {
 *     total: number,
 *     label?: string,
 *     lineItems: Array<{
 *       label: string,
 *       amount: number,
 *       sign: '+'|'-',
 *       source: string,
 *       confidence?: 'high'|'medium'|'low',
 *       correctedBy?: string,
 *       correctedAt?: string,
 *     }>,
 *   },
 *   showRunningTotal?: boolean,
 *   className?: string,
 * }} props
 */
export default function CalculationLineage({ lineage, showRunningTotal = true, className }) {
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = (index) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Running total lets the owner see where the balance crosses into trouble,
  // not just the final figure.
  let running = 0;

  return (
    <div className={cn('space-y-px', className)}>
      {lineage.lineItems.map((item, index) => {
        const signed = item.sign === '+' ? item.amount : -item.amount;
        running += signed;

        const isOpen = expanded.has(index);
        const hasCorrection = Boolean(item.correctedBy);

        return (
          <div key={`${item.label}-${index}`} className="border border-edge-dark bg-surface">
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
            >
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 shrink-0 text-chalk-lo transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
                aria-hidden="true"
              />

              <span className="min-w-0 flex-1 truncate text-body-md text-chalk-hi">
                {item.label}
                {hasCorrection ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-label-xs uppercase text-info">
                    <UserPen className="h-3 w-3" aria-hidden="true" />
                    Corrected
                  </span>
                ) : null}
              </span>

              {item.confidence && item.confidence !== 'high' ? (
                <Pill status={item.confidence} className="hidden sm:inline-flex" />
              ) : null}

              {/* Sign is carried by the +/- glyph as well as the color, so the
                  direction of each item survives without color (Section 7). */}
              <span
                data-numeric
                className={cn(
                  'shrink-0 tabular text-body-md',
                  item.sign === '+' ? 'text-lime' : 'text-risk',
                )}
              >
                {item.sign}
                <Figure value={item.amount} variant="currency" />
              </span>

              {showRunningTotal ? (
                <span
                  data-numeric
                  className="hidden w-28 shrink-0 text-right tabular text-body-sm text-chalk-lo md:block"
                >
                  <Figure value={running} variant="currency" />
                </span>
              ) : null}
            </button>

            {isOpen ? (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-edge-dark bg-void px-4 py-3 pl-11 text-body-sm sm:grid-cols-2">
                <SourceField icon={FileText} label="Source" value={item.source} />
                {item.confidence ? (
                  <SourceField
                    label="OCR confidence"
                    value={<Pill status={item.confidence} />}
                  />
                ) : null}
                {item.correctedBy ? (
                  <SourceField label="Corrected by" value={item.correctedBy} />
                ) : null}
                {item.correctedAt ? (
                  <SourceField label="Corrected at" value={formatDateTime(item.correctedAt)} />
                ) : null}
              </dl>
            ) : null}
          </div>
        );
      })}

      <div className="mt-3 flex items-center justify-between gap-4 border border-lime/40 bg-lime-8 px-4 py-4">
        <span className="text-label-xs uppercase text-chalk-hi">
          {lineage.label ?? 'Projected balance'}
        </span>
        <span data-numeric className="font-display text-display-md tabular text-lime">
          <Figure value={lineage.total} variant="currency" />
        </span>
      </div>
    </div>
  );
}

function SourceField({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-label-xs uppercase text-chalk-lo">{label}</dt>
      <dd className="flex items-center gap-1.5 text-chalk-hi">
        {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-chalk-lo" aria-hidden="true" /> : null}
        {value}
      </dd>
    </div>
  );
}
