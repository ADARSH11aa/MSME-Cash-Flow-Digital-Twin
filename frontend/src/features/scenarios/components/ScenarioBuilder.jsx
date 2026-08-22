import { CalendarClock, Check, ChevronDown, RotateCcw, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { useEffect } from 'react';
import cn from '@/lib/cn';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import ScenarioSliderControl from '@/components/shared/ScenarioSliderControl';
import useAsync from '@/hooks/useAsync';
import { getCustomerOptions, getScenarioPresets } from '@/mocks/api/scenarios';

/**
 * Scenario builder panel (PRD 3.5) — composable assumption inputs plus the
 * one-click presets from the concept doc's §7 example table.
 *
 * Slider tone tracks whether the current value hurts cash, so the control
 * itself signals severity while the numeric read-out stays authoritative.
 */

/** Each preset gets the icon for the shock it applies, keyed off its fixture id. */
const PRESET_ICONS = {
  'preset-delay': CalendarClock,
  'preset-revenue': TrendingDown,
  'preset-expense': TrendingUp,
  'preset-combined': Zap,
};

export default function ScenarioBuilder({ state, onChange, onPreset, activePreset, onReset }) {
  const { data: presets } = useAsync(getScenarioPresets, []);
  const { data: customers } = useAsync(getCustomerOptions, []);

  // INITIAL's customerId is a fixture-era default that doesn't match any
  // real customer from the backend — once the real list loads, snap to an
  // actual id so the delay slider isn't silently pointed at nothing.
  useEffect(() => {
    if (!customers?.length) return;
    if (customers.some((c) => c.value === state.customerId)) return;
    onChange({ ...state, customerId: customers[0].value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers]);

  const dirty =
    Boolean(activePreset) ||
    state.delayDays !== 0 ||
    state.revenueShockPct !== 0 ||
    state.expenseShockPct !== 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <EyebrowLabel>Quick scenarios</EyebrowLabel>
        {/* Reset lives beside the controls it clears, and only appears once
            there is something to clear. */}
        {dirty ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-label-xs uppercase text-chalk-lo transition-colors hover:text-risk"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        ) : null}
      </div>

      {/* Stacked full-width rows rather than wrapped pills: the preset names are
          whole sentences, and as chips they shredded into ragged two-line blobs. */}
      <div className="space-y-2">
        {(presets ?? []).map((preset) => {
          const Icon = PRESET_ICONS[preset.id] ?? Zap;
          const active = preset.id === activePreset;

          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              onClick={() => onPreset(preset)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-card border px-3 py-2.5 text-left transition-all duration-150 ease-out',
                active
                  ? 'border-lime bg-lime-8 text-chalk-hi'
                  : 'border-edge-dark bg-surface text-chalk-lo hover:border-lime/50 hover:bg-lime-8/50 hover:text-chalk-hi',
              )}
            >
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-control transition-colors',
                  active ? 'bg-lime text-ink-hi' : 'bg-surface-2 text-chalk-lo group-hover:text-lime',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-body-sm font-medium leading-snug">
                {preset.label}
              </span>
              {active ? (
                <Check className="h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="space-y-6 border-t border-edge-dark pt-6">
        <div className="space-y-2">
          <label htmlFor="scenario-customer" className="text-label-xs uppercase text-chalk-lo">
            Customer delay — who
          </label>
          {/* Native select keeps the mobile picker; the chevron is drawn over it
              because appearance-none strips the platform arrow. */}
          <div className="relative">
            <select
              id="scenario-customer"
              value={state.customerId}
              onChange={(e) => onChange({ ...state, customerId: e.target.value })}
              className="w-full appearance-none rounded-card border border-edge-dark bg-surface px-3 py-2.5 pr-9 text-body-sm text-chalk-hi transition-colors hover:border-chalk-lo/40 focus:border-info focus:outline-none"
            >
              {(customers ?? []).map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-chalk-lo"
              aria-hidden="true"
            />
          </div>
        </div>

        <ScenarioSliderControl
          label="Customer delay"
          value={state.delayDays}
          onChange={(v) => onChange({ ...state, delayDays: v })}
          min={0}
          max={90}
          tone={state.delayDays > 45 ? 'risk' : state.delayDays > 15 ? 'caution' : 'accent'}
          formatValue={(v) => `${v} days late`}
          minLabel="On time"
          maxLabel="90 days"
          dirty={state.delayDays !== 0}
        />

        <ScenarioSliderControl
          label="Revenue shock"
          value={state.revenueShockPct}
          onChange={(v) => onChange({ ...state, revenueShockPct: v })}
          min={-50}
          max={20}
          tone={state.revenueShockPct < -25 ? 'risk' : state.revenueShockPct < 0 ? 'caution' : 'accent'}
          formatValue={(v) => `${v > 0 ? '+' : ''}${v}% sales`}
          minLabel="−50%"
          maxLabel="+20%"
          dirty={state.revenueShockPct !== 0}
        />

        <ScenarioSliderControl
          label="Expense shock"
          value={state.expenseShockPct}
          onChange={(v) => onChange({ ...state, expenseShockPct: v })}
          min={-20}
          max={50}
          tone={state.expenseShockPct > 25 ? 'risk' : state.expenseShockPct > 0 ? 'caution' : 'accent'}
          formatValue={(v) => `${v > 0 ? '+' : ''}${v}% costs`}
          minLabel="−20%"
          maxLabel="+50%"
          dirty={state.expenseShockPct !== 0}
        />
      </div>
    </div>
  );
}
