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
  className,
}) {
  const id = useId();

  const valueTone = {
    accent: 'text-lime',
    caution: 'text-caution',
    risk: 'text-risk',
  }[tone];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-label-xs uppercase text-chalk-lo">
          {label}
        </label>
        <span data-numeric className={cn('tabular text-body-md', valueTone)}>
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
        <div className="flex justify-between text-label-xs uppercase text-chalk-lo">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      ) : null}

      {hint ? <p className="text-body-sm text-chalk-lo">{hint}</p> : null}
    </div>
  );
}

/**
 * Preset quick-scenario chips (PRD 3.5) — one click applies a whole named
 * shock from the concept doc's example table.
 *
 * @param {{
 *   presets: Array<{ id: string, label: string }>,
 *   activeId?: string|null,
 *   onApply: (preset: object) => void,
 *   className?: string,
 * }} props
 */
export function PresetChipRow({ presets, activeId, onApply, className }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {presets.map((preset) => {
        const active = preset.id === activeId;
        return (
          <button
            key={preset.id}
            type="button"
            aria-pressed={active}
            onClick={() => onApply(preset)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-label-xs uppercase transition-colors',
              active
                ? 'border-lime bg-lime-16 text-lime'
                : 'border-edge-dark text-chalk-lo hover:border-chalk-lo hover:text-chalk-hi',
            )}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
