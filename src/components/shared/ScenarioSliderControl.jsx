import { useId } from 'react';
import cn from '@/lib/cn';
import Slider from '@/components/ui/slider';

/**
 * A labelled assumption slider for the scenario builder (PRD 3.5), with the
 * current value always shown as text beside the label.
 *
 * `tone` is derived by the caller from whether the current value worsens cash
 * (amber/red) or improves it (lime) — the numeric read-out means the slider is
 * still fully legible without it.
 *
 * @param {{
 *   label: string,
 *   value: number,
 *   onChange: (value: number) => void,
 *   min: number,
 *   max: number,
 *   step?: number,
 *   formatValue?: (value: number) => string,
 *   tone?: 'accent'|'caution'|'risk',
 *   hint?: string,
 *   minLabel?: string,
 *   maxLabel?: string,
 *   dirty?: boolean,
 *   className?: string,
 * }} props
 */
export default function ScenarioSliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue = (v) => String(v),
  tone = 'accent',
  hint,
  minLabel,
  maxLabel,
  dirty = false,
  className,
}) {
  const id = useId();

  // The read-out is a tinted pill rather than bare colored text: at 13px on a
  // white panel, tone alone was too faint to register as the live value.
  const valueTone = {
    accent: 'bg-lime-8 text-lime',
    caution: 'bg-caution-8 text-caution',
    risk: 'bg-risk-8 text-risk',
  }[tone];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-label-xs uppercase text-chalk-lo"
        >
          {label}
          {/* Marks a slider moved off baseline, so a scenario's inputs are
              scannable without comparing every value to its default. */}
          {dirty ? (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-info"
              aria-hidden="true"
            />
          ) : null}
        </label>
        <span
          data-numeric
          className={cn(
            'tabular shrink-0 rounded-full px-2.5 py-0.5 text-body-sm font-semibold transition-colors',
            valueTone,
          )}
        >
          {formatValue(value)}
        </span>
      </div>

      <Slider
        id={id}
        tone={tone}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
        aria-valuetext={formatValue(value)}
      />

      {minLabel || maxLabel ? (
        <div className="flex justify-between text-label-xs uppercase text-chalk-lo/70">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      ) : null}

      {hint ? <p className="text-body-sm text-chalk-lo">{hint}</p> : null}
    </div>
  );
}
