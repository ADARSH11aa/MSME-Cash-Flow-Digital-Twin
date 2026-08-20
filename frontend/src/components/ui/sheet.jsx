import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef } from 'react';
import cn from '@/lib/cn';

/**
 * Slide-over panel on Radix Dialog — focus trap, scroll lock, Escape and
 * ARIA wiring come from the primitive.
 *
 * Primary use is the contextual lineage drawer (PRD 3.7): clicking any
 * currency figure opens <CalculationLineage /> in here rather than navigating
 * away from the screen the owner is reading.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

export const SheetOverlay = forwardRef(function SheetOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        className,
      )}
      {...props}
    />
  );
});

/**
 * @param {{ side?: 'right'|'bottom', className?: string, children: React.ReactNode }} props
 */
export const SheetContent = forwardRef(function SheetContent(
  { className, children, side = 'right', ...props },
  ref,
) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col gap-0 bg-surface shadow-card-dark',
          'transition ease-out data-[state=open]:animate-in data-[state=closed]:animate-out',
          side === 'right' && [
            'inset-y-0 right-0 h-full w-full border-l border-edge-dark sm:max-w-md',
            'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
          ],
          // On narrow viewports a bottom sheet is the better shape — used by
          // the scenario builder panel at <768px (PRD Section 7).
          side === 'bottom' && [
            'inset-x-0 bottom-0 max-h-[85vh] border-t border-edge-dark',
            'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
          ],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4 p-1 text-chalk-lo transition-colors',
            'hover:text-chalk-hi',
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});

/** @param {{ className?: string, children: React.ReactNode }} props */
export function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn('shrink-0 border-b border-edge-dark px-6 py-5 pr-12', className)}
      {...props}
    />
  );
}

export const SheetTitle = forwardRef(function SheetTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('font-display text-heading-md text-chalk-hi', className)}
      {...props}
    />
  );
});

export const SheetDescription = forwardRef(function SheetDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('mt-1 text-body-sm text-chalk-lo', className)}
      {...props}
    />
  );
});

/** Scrollable body region. */
export function SheetBody({ className, ...props }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-5', className)} {...props} />;
}
