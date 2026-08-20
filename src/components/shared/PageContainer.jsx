import cn from '@/lib/cn';
import { PageTransition } from './motion';

/**
 * The outer wrapper for every authenticated screen: page padding, a measure
 * cap, and the route transition, in one place.
 *
 * The measure cap is the substantive part. Every page was a full-bleed block,
 * so on a wide monitor the 3-up stat strip stretched until each card was a
 * band of whitespace with a number lost at one end. 1440px holds the 3-up grid
 * at a readable card width and keeps the forecast chart from going letterbox.
 *
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export default function PageContainer({ children, className }) {
  return (
    <PageTransition className="px-5 py-8 md:px-8">
      <div className={cn('mx-auto w-full max-w-[1440px] space-y-8', className)}>{children}</div>
    </PageTransition>
  );
}
