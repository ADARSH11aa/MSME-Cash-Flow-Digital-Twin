import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { forwardRef } from 'react';
import cn from '@/lib/cn';

/**
 * Tooltip on Radix — shows on hover *and* keyboard focus, which is what makes
 * the AppShell's icon-only rail navigation accessible (PRD 3.4).
 */
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = forwardRef(function TooltipContent(
  { className, sideOffset = 8, ...props },
  ref,
) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 border border-edge-dark bg-surface-2 px-2.5 py-1.5',
          'text-label-xs uppercase text-chalk-hi shadow-card-dark',
          'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});
