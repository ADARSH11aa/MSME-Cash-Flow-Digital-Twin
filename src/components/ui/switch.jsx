import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef } from 'react';
import cn from '@/lib/cn';

/**
 * Toggle switch built on Radix (keyboard + ARIA handled by the primitive).
 *
 * The `sensitive` variant turns the ON track amber instead of lime — used for
 * the "Share financial data with lenders" consent scope (PRD 3.2), where lime
 * would wrongly read as "this is the healthy default". Consent rows always
 * render a text state label alongside, so the color is never the only signal.
 *
 * @param {{ sensitive?: boolean, className?: string }} props
 */
const Switch = forwardRef(function Switch({ className, sensitive = false, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
        'border border-edge-dark transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=unchecked]:bg-surface-2',
        sensitive
          ? 'data-[state=checked]:border-caution data-[state=checked]:bg-caution'
          : 'data-[state=checked]:border-lime data-[state=checked]:bg-lime',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full shadow-sm ring-0',
          'transition-transform duration-200',
          'data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[3px]',
          'data-[state=checked]:bg-void data-[state=unchecked]:bg-chalk-lo',
        )}
      />
    </SwitchPrimitive.Root>
  );
});

export default Switch;
