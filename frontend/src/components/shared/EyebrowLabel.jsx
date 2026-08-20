import cn from '@/lib/cn';

/**
 * The "■ LABEL" eyebrow badge from the reference frames: a small squared
 * outline pill with a filled square bullet and uppercase micro-type.
 *
 * PRD 2.3 extends the motif for this product — the bullet is color-coded to
 * semantic state (lime healthy / amber watch / red at risk). Because the label
 * text sits right beside it, the state is always readable without relying on
 * the color (PRD Section 7).
 *
 * @param {{
 *   children: React.ReactNode,
 *   tone?: 'neutral'|'healthy'|'watch'|'risk'|'info',
 *   filled?: boolean,
 *   onLight?: boolean,
 *   className?: string,
 * }} props
 */
export default function EyebrowLabel({
  children,
  tone = 'neutral',
  filled = false,
  onLight = false,
  className,
}) {
  const bulletTone = {
    neutral: 'bg-lime',
    healthy: 'bg-lime',
    watch: 'bg-caution',
    risk: 'bg-risk',
    info: 'bg-info',
  }[tone];

  return (
    <span
      className={cn(
        // whitespace-nowrap: the badge is a label, not a paragraph — letting it
        // wrap inside a tight flex row shreds it into stacked words.
        'inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-2 py-1 text-label-xs uppercase',
        // The reference alternates between an outlined badge on dark sections
        // and a solid black-filled badge on light sections.
        filled
          ? 'bg-void text-chalk-hi'
          : onLight
            ? 'border border-edge-light text-ink-hi'
            : 'border border-edge-dark text-chalk-hi',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0', bulletTone)} aria-hidden="true" />
      {children}
    </span>
  );
}
