import cn from '@/lib/cn';
import Button from './Button';

/**
 * Empty state as an invitation to act (PRD 3.4): a directive line that names
 * the next step, not a passive "no data" message.
 *
 * @param {{
 *   illustration?: React.ReactNode,
 *   title: string,
 *   body?: string,
 *   actionLabel?: string,
 *   onAction?: () => void,
 *   onLight?: boolean,
 *   className?: string,
 * }} props
 */
export default function EmptyState({
  illustration,
  title,
  body,
  actionLabel,
  onAction,
  onLight = false,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border border-dashed px-6 py-16 text-center',
        onLight ? 'border-edge-light bg-light-card' : 'border-edge-dark bg-surface',
        className,
      )}
    >
      {illustration ? <div className="mb-6">{illustration}</div> : null}

      <h3
        className={cn(
          'font-display text-heading-md',
          onLight ? 'text-ink-hi' : 'text-chalk-hi',
        )}
      >
        {title}
      </h3>

      {body ? (
        <p
          className={cn(
            'mt-2 max-w-sm text-body-md',
            onLight ? 'text-ink-lo' : 'text-chalk-lo',
          )}
        >
          {body}
        </p>
      ) : null}

      {actionLabel ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
