import * as SliderPrimitive from '@radix-ui/react-slider';
import { forwardRef } from 'react';
import cn from '@/lib/cn';

/**
 * Range slider on Radix — arrow-key stepping, Home/End and ARIA value text
 * come from the primitive. Used by ScenarioSliderControl (PRD 3.5).
 *
 * `tone` colors the filled range so a shock that worsens cash reads amber/red
 * rather than lime; the control always ships with a visible numeric value, so
 * the color is reinforcement rather than the signal itself.
 *
 * @param {{ tone?: 'accent'|'caution'|'risk', className?: string }} props
 */
const Slider = forwardRef(function Slider({ className, tone = 'accent', ...props }, ref) {
  const rangeTone = {
    accent: 'bg-lime',
    caution: 'bg-caution',
    risk: 'bg-risk',
  }[tone];

  const thumbTone = {
    accent: 'border-lime',
    caution: 'border-caution',
    risk: 'border-risk',
  }[tone];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center py-2',
        'data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-surface-2">
        <SliderPrimitive.Range className={cn('absolute h-full', rangeTone)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          'block h-4 w-4 rounded-full border-2 bg-void transition-colors',
          'hover:bg-surface-2 disabled:pointer-events-none',
          thumbTone,
        )}
      />
    </SliderPrimitive.Root>
  );
});

export default Slider;
