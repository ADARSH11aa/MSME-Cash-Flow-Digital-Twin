import EyebrowLabel from './EyebrowLabel';
import cn from '@/lib/cn';

/**
 * The one page header for every authenticated screen.
 *
 * Each page had grown its own version of this block — same parts, but the
 * eyebrow-to-title gap, the title-to-subtitle gap and the bottom margin all
 * differed, so the six screens did not line up with each other when you moved
 * between them. The measurements live here now.
 *
 * `actions` is baseline-aligned with the title rather than the block, which is
 * what keeps a toggle or a button optically level with the headline instead of
 * floating against the subtitle.
 *
 * @param {{
 *   eyebrow?: React.ReactNode,
 *   eyebrowTone?: 'neutral'|'healthy'|'watch'|'risk'|'info',
 *   title: React.ReactNode,
 *   subtitle?: React.ReactNode,
 *   actions?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function PageHeader({
  eyebrow,
  eyebrowTone = 'neutral',
  title,
  subtitle,
  actions,
  className,
}) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-4', className)}>
      <div className="min-w-0">
        {eyebrow ? <EyebrowLabel tone={eyebrowTone}>{eyebrow}</EyebrowLabel> : null}
        <h1
          className={cn(
            'font-display text-display-md text-chalk-hi',
            // Only pay for the gap when there is actually an eyebrow above.
            eyebrow && 'mt-3',
          )}
        >
          {title}
        </h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-body-sm text-chalk-lo">{subtitle}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
