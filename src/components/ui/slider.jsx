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

  // The thumb carries a soft halo in its own tone so the grab target reads as
  // interactive against a white panel, where a hairline ring disappears.
  const thumbTone = {
    accent: 'border-lime shadow-[0_0_0_4px_var(--accent-lime-8)]',
    caution: 'border-caution shadow-[0_0_0_4px_var(--risk-amber-8)]',
    risk: 'border-risk shadow-[0_0_0_4px_var(--risk-red-8)]',
  }[tone];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'group relative flex w-full touch-none select-none items-center py-2',
        'data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-2">
        <SliderPrimitive.Range
          className={cn('absolute h-full rounded-full transition-colors', rangeTone)}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          'block h-4 w-4 cursor-grab rounded-full border-2 bg-surface',
          'transition-[transform,box-shadow,border-color] duration-150 ease-out',
          'hover:scale-110 active:scale-105 active:cursor-grabbing',
          'disabled:pointer-events-none',
          thumbTone,
        )}
      />
    </SliderPrimitive.Root>
  );
});

export default Slider;
