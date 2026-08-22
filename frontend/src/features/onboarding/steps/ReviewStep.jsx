import { Check, Minus, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import cn from '@/lib/cn';
import { CONSENT_SCOPES } from '@/mocks/api/consent';

/** Onboarding step 3 (PRD 3.2) — confirm what was granted before computing. */
export default function ReviewStep({ consent, method, uploadResult }) {
  const methodLabel =
    method === 'upload' && uploadResult
      ? `${uploadResult.rowCount} invoices uploaded (${uploadResult.customerCount} customers)`
      : {
          upload: 'Uploaded files',
          manual: 'Manual entry',
          connect: 'Accounting software',
        }[method];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="font-display text-display-md text-chalk-hi">Review &amp; confirm</h2>
        <p className="text-body-md text-chalk-lo">
          This is everything you have allowed. Building your twin does not share anything with
          anyone.
        </p>
      </header>

      <ul className="space-y-2">
        {CONSENT_SCOPES.map((scope) => {
          const granted = Boolean(consent?.[scope.key]);
          return (
            <li
              key={scope.key}
              className="flex items-center gap-3 border border-edge-dark bg-surface px-4 py-3"
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center',
                  granted
                    ? scope.sensitive
                      ? 'bg-caution text-void'
                      : 'bg-lime text-void'
                    : 'border border-edge-dark text-chalk-lo',
                )}
                aria-hidden="true"
              >
                {granted ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              </span>
              <span className="flex-1 text-body-md text-chalk-hi">{scope.title}</span>
              <span
                className={cn(
                  'text-label-xs uppercase',
                  granted ? (scope.sensitive ? 'text-caution' : 'text-lime') : 'text-chalk-lo',
                )}
              >
                {granted ? 'Allowed' : 'Not allowed'}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-start gap-3 border border-edge-dark bg-surface px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
        <p className="text-body-sm text-chalk-lo">
          Data source: <span className="text-chalk-hi">{methodLabel}</span>. You can review and
          correct every imported figure, and see the full record of what was accessed in{' '}
          <Link to="/app/settings/audit" className="text-info underline underline-offset-2">
            Settings → Audit log
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
