import cn from '@/lib/cn';

/**
 * The standard panel surface. Pages were each hand-writing
 * `border border-edge-dark bg-surface p-5` with no radius, which is why the
 * section panels read as flat outlines next to the rounded shell chrome.
 *
 * `interactive` adds the hover lift. Use it only where the whole card is
 * actually a target — a card that lifts under the pointer but does nothing
 * when clicked is a worse affordance than one that stays put.
 *
 * @param {{
 *   children: React.ReactNode,
 *   as?: React.ElementType,
 *   interactive?: boolean,
 *   padding?: 'none'|'sm'|'md'|'lg',
 *   className?: string,
 * }} props
 */
export default function Card({
  children,
  as: Component = 'div',
  interactive = false,
  padding = 'md',
  className,
  ...rest
}) {
  return (
    <Component
      className={cn(
        'min-w-0 rounded-card border border-edge-dark bg-surface shadow-card',
        'transition-[box-shadow,border-color,transform] duration-hover ease-out',
        { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }[padding],
        interactive &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-chalk-lo/30 hover:shadow-card-hover',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * A card's own header row — title on the left, controls on the right, on a
 * shared baseline. Same reason as PageHeader: this row was being rebuilt with
 * slightly different margins on every panel in the app.
 *
 * @param {{
 *   title: React.ReactNode,
 *   description?: React.ReactNode,
 *   actions?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function CardHeader({ title, description, actions, className }) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-2', className)}>
      <div className="min-w-0">
        <h2 className="font-display text-heading-md text-chalk-hi">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-body-sm text-chalk-lo">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
