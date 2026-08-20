import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import cn from '@/lib/cn';

/**
 * PRD Section 4: variants `primary` (lime fill), `secondary` (outline),
 * `ghost`, `destructive` (red outline).
 *
 * `destructive` is deliberately a red *outline*, never a lime fill — PRD 2.1
 * requires lime to mean "positive / primary / go" without exception, so revoke
 * and delete actions must not borrow it.
 *
 * The reference frames use squared corners and uppercase label-xs type on
 * buttons; both are baked in here so no screen re-derives them.
 */
const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control',
    'text-label-xs uppercase transition-colors duration-150',
    'disabled:pointer-events-none disabled:opacity-40',
    // Icons inside buttons should never capture pointer events or scale.
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ),
  {
    variants: {
      variant: {
        primary: 'bg-lime text-ink-hi hover:bg-lime-dim active:bg-lime-dim',
        secondary:
          'border border-edge-dark bg-transparent text-chalk-hi hover:border-chalk-lo hover:bg-surface-2',
        ghost: 'bg-transparent text-chalk-lo hover:bg-surface-2 hover:text-chalk-hi',
        destructive: 'border border-risk bg-transparent text-risk hover:bg-risk-8',
        /* Light-canvas counterparts for the invoice-review, consent-detail and
           audit-log screens, which sit on --bg-light per PRD 2.1. */
        secondaryLight:
          'border border-edge-light bg-transparent text-ink-hi hover:border-ink-lo hover:bg-light',
        ghostLight: 'bg-transparent text-ink-lo hover:bg-light hover:text-ink-hi',
      },
      size: {
        sm: 'h-8 px-3 [&_svg]:size-3.5',
        md: 'h-10 px-5 [&_svg]:size-4',
        lg: 'h-12 px-7 [&_svg]:size-4',
        icon: 'h-9 w-9 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

/**
 * @param {{
 *   variant?: 'primary'|'secondary'|'ghost'|'destructive'|'secondaryLight'|'ghostLight',
 *   size?: 'sm'|'md'|'lg'|'icon',
 *   asChild?: boolean,
 *   className?: string,
 * }} props
 */
const Button = forwardRef(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  // asChild lets a react-router <Link> inherit button styling without nesting
  // an <a> inside a <button>.
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
});

export { buttonVariants };
export default Button;
