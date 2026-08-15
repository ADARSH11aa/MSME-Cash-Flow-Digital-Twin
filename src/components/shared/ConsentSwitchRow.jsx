import { AlertTriangle } from 'lucide-react';
import { useId } from 'react';
import cn from '@/lib/cn';
import Switch from '@/components/ui/switch';

/**
 * One granular consent scope (PRD 3.2 Step 1 / 3.8 Privacy panel) — the same
 * component serves both so the onboarding and settings surfaces cannot drift.
 *
 * The `sensitive` variant covers "Share financial data with lenders": it
 * defaults off, uses an amber track rather than lime (lime would imply this is
 * the healthy default), and shows a warning line when enabled.
 *
 * Description copy states what the scope *does* for the owner, not how it is
 * implemented.
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   checked: boolean,
 *   onCheckedChange: (checked: boolean) => void,
 *   sensitive?: boolean,
 *   sensitiveNote?: string,
 *   onLight?: boolean,
 *   className?: string,
 * }} props
 */
export default function ConsentSwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
  sensitive = false,
  sensitiveNote = 'Your data is shared only with advisors you name, and you can revoke this at any time.',
  onLight = false,
  className,
}) {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-5 border p-4 transition-colors',
        onLight
          ? 'border-edge-light bg-light-card'
          : cn('bg-surface', sensitive && checked ? 'border-caution/40' : 'border-edge-dark'),
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <label
          htmlFor={id}
          className={cn(
            'flex cursor-pointer flex-wrap items-center gap-2 text-body-md',
            onLight ? 'text-ink-hi' : 'text-chalk-hi',
          )}
        >
          {title}
          {sensitive ? (
            <span className="inline-flex items-center gap-1 text-label-xs uppercase text-caution">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              Sensitive
            </span>
          ) : null}
        </label>

        <p
          id={descriptionId}
          className={cn('text-body-sm', onLight ? 'text-ink-lo' : 'text-chalk-lo')}
        >
          {description}
        </p>

        {sensitive && checked ? (
          <p className="flex items-start gap-1.5 pt-1 text-body-sm text-caution">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {sensitiveNote}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* Text state label so the switch position is never the only signal. */}
        <span
          className={cn(
            'hidden text-label-xs uppercase sm:inline',
            checked
              ? sensitive
                ? 'text-caution'
                : 'text-lime'
              : onLight
                ? 'text-ink-lo'
                : 'text-chalk-lo',
          )}
          aria-hidden="true"
        >
          {checked ? 'On' : 'Off'}
        </span>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          sensitive={sensitive}
          aria-describedby={descriptionId}
        />
      </div>
    </div>
  );
}
