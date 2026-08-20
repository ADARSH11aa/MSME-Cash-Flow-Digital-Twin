import cn from '@/lib/cn';

/**
 * The pill toggle from the reference frames (MONTHLY / YEARLY), reused for the
 * forecast horizon (7/30/60/90 DAYS) and the scenario band selector
 * (EXPECTED / OPTIMISTIC / PESSIMISTIC) per PRD 2.3.
 *
 * Implemented as a real radiogroup: arrow keys move between options and the
 * selected state is exposed via aria-checked, rather than a row of buttons
 * that only look like a toggle.
 *
 * @param {{
 *   options: Array<{ value: string|number, label: string, tone?: 'accent'|'optimistic'|'expected'|'pessimistic' }>,
 *   value: string|number,
 *   onChange: (value: string|number) => void,
 *   label: string,
 *   size?: 'sm'|'md',
 *   onLight?: boolean,
 *   className?: string,
 * }} props
 */
export default function SegmentedToggle({
  options,
  value,
  onChange,
  label,
  size = 'md',
  onLight = false,
  className,
}) {
  const handleKeyDown = (event) => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx === -1) return;

    let next = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (idx + 1) % options.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = (idx - 1 + options.length) % options.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = options.length - 1;

    if (next != null) {
      event.preventDefault();
      onChange(options[next].value);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        // max-w-full + scroll so a 3-4 option toggle never widens a narrow page.
        'inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border p-1',
        onLight ? 'border-edge-light bg-light-card' : 'border-edge-dark bg-surface',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        const activeTone = {
          accent: 'bg-lime text-ink-hi',
          optimistic: 'bg-lime text-ink-hi',
          expected: 'bg-info text-ink-hi',
          pessimistic: 'bg-risk text-ink-hi',
        }[option.tone ?? 'accent'];

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            // Roving tabindex: the group is one tab stop, arrows move within.
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full text-label-xs uppercase transition-colors duration-150',
              size === 'sm' ? 'px-3 py-1' : 'px-4 py-1.5',
              active
                ? activeTone
                : onLight
                  ? 'text-ink-lo hover:bg-light hover:text-ink-hi'
                  : 'text-chalk-lo hover:bg-surface-2 hover:text-chalk-hi',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
