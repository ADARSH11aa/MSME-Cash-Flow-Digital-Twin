import { ChevronDown, Cpu, User } from 'lucide-react';
import { useState } from 'react';
import cn from '@/lib/cn';
import useAsync from '@/hooks/useAsync';
import { formatDateTime } from '@/lib/format';
import { getAuditLog } from '@/mocks/api/auditLog';

/**
 * Audit log (PRD 3.8) — reverse-chronological timeline of every consent change
 * and data-access event, with the reference's square-bullet left rail.
 */
export default function AuditLogPage() {
  const { data: events, loading } = useAsync(() => getAuditLog(), []);
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = (id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-heading-md text-chalk-hi">Audit log</h2>
        <p className="mt-2 max-w-2xl text-body-sm text-chalk-lo">
          Everything CashTwin has accessed or changed, newest first. This record cannot be edited.
        </p>
      </div>

      {loading || !events ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse border border-edge-dark bg-surface rounded-lg" />
          ))}
        </div>
      ) : (
        <ol className="relative border-l border-edge-dark pl-6">
          {events.map((event) => {
            const isOpen = expanded.has(event.id);
            const Icon = event.actor === 'owner' ? User : Cpu;

            return (
              <li key={event.id} className="relative pb-3">
                <span
                  className={cn(
                    'absolute -left-[27px] top-4 h-1.5 w-1.5 rounded-full',
                    event.actor === 'owner' ? 'bg-lime' : 'bg-edge-dark',
                  )}
                  aria-hidden="true"
                />

                <div className="border border-edge-dark bg-surface rounded-lg overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggle(event.id)}
                    aria-expanded={isOpen}
                    disabled={!event.detail}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                      event.detail ? 'hover:bg-surface-2' : 'cursor-default',
                    )}
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime" aria-hidden="true" />

                    {/* The event name is the point of an audit entry */}
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-md text-chalk-hi font-medium">{event.event}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-label-xs uppercase text-chalk-lo">
                          {event.actor === 'owner' ? 'Owner' : 'System'}
                        </span>
                        <span
                          data-numeric
                          className="tabular text-body-sm text-chalk-lo sm:hidden"
                        >
                          {formatDateTime(event.timestamp)}
                        </span>
                      </span>
                    </span>

                    <span
                      data-numeric
                      className="hidden shrink-0 tabular text-body-sm text-chalk-lo sm:inline"
                    >
                      {formatDateTime(event.timestamp)}
                    </span>

                    {event.detail ? (
                      <ChevronDown
                        className={cn(
                          'mt-0.5 h-3.5 w-3.5 shrink-0 text-chalk-lo transition-transform duration-200',
                          isOpen && 'rotate-180',
                        )}
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="w-3.5 shrink-0" aria-hidden="true" />
                    )}
                  </button>

                  {isOpen && event.detail ? (
                    <p className="border-t border-edge-dark bg-surface-2 px-4 py-3 pl-11 text-body-sm text-chalk-lo">
                      {event.detail}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
