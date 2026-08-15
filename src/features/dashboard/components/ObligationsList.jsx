import { AlertTriangle } from 'lucide-react';
import cn from '@/lib/cn';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import Figure from '@/components/shared/Figure';
import { formatDateShort } from '@/lib/format';

/**
 * Upcoming obligations (PRD 3.4.6) — soonest first, with a red left border on
 * anything falling inside the risk window.
 */
export default function ObligationsList({ obligations }) {
  return (
    <section className="border border-edge-dark bg-surface p-5">
      <EyebrowLabel>Upcoming obligations</EyebrowLabel>
      <h3 className="mt-4 font-display text-heading-md text-chalk-hi">What has to go out next</h3>

      <ul className="mt-5 space-y-2">
        {obligations.map((item) => (
          <li
            key={item.id}
            className={cn(
              'flex items-center gap-3 border-l-2 bg-void px-4 py-3',
              item.isAtRisk ? 'border-risk' : 'border-edge-dark',
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md text-chalk-hi">{item.label}</p>
              <p className="text-body-sm text-chalk-lo">Due {formatDateShort(item.dueDate)}</p>
            </div>

            {item.isAtRisk ? (
              <span className="flex shrink-0 items-center gap-1.5 text-label-xs uppercase text-risk">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                At risk
              </span>
            ) : null}

            <span className="shrink-0 font-display text-heading-md text-chalk-hi">
              <Figure value={item.amount} variant="currencyShort" label={item.label} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
