import cn from '@/lib/cn';

/**
 * The corner tick-mark motif from the reference frames — four small L-shaped
 * brackets that frame a card without drawing a full border.
 *
 * PRD 2.3 gives this a job rather than treating it as decoration: it marks the
 * single thing on screen the owner should look at first (the causal risk graph
 * on the dashboard, the currently-selected scenario, the recommended strategy).
 * Used sparingly — more than one bracketed card per screen defeats the point.
 *
 * @param {{
 *   children: React.ReactNode,
 *   tone?: 'accent'|'neutral'|'risk',
 *   onLight?: boolean,
 *   className?: string,
 *   as?: React.ElementType,
 * }} props
 */
export default function BracketFrame({
  children,
  tone = 'accent',
  onLight = false,
  className,
  as: Tag = 'div',
  ...rest
}) {
  const strokeTone = {
    accent: 'border-lime',
    risk: 'border-risk',
    neutral: onLight ? 'border-ink-lo' : 'border-chalk-lo',
  }[tone];

  // Each corner is a 12px box showing only its two outer edges.
  const corner = cn('pointer-events-none absolute h-3 w-3', strokeTone);

  return (
    <Tag className={cn('relative', className)} {...rest}>
      <span className={cn(corner, '-left-px -top-px border-l-2 border-t-2')} aria-hidden="true" />
      <span className={cn(corner, '-right-px -top-px border-r-2 border-t-2')} aria-hidden="true" />
      <span
        className={cn(corner, '-bottom-px -left-px border-b-2 border-l-2')}
        aria-hidden="true"
      />
      <span
        className={cn(corner, '-bottom-px -right-px border-b-2 border-r-2')}
        aria-hidden="true"
      />
      {children}
    </Tag>
  );
}
