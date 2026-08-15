import { RotateCcw } from 'lucide-react';
import Button from '@/components/shared/Button';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import ScenarioSliderControl, { PresetChipRow } from '@/components/shared/ScenarioSliderControl';
import { getCustomerOptions, getScenarioPresets } from '@/mocks/api/scenarios';

/**
 * Scenario builder panel (PRD 3.5) — composable assumption inputs plus the
 * one-click presets from the concept doc's §7 example table.
 *
 * Slider tone tracks whether the current value hurts cash, so the control
 * itself signals severity while the numeric read-out stays authoritative.
 */
export default function ScenarioBuilder({ state, onChange, onPreset, activePreset, onReset }) {
  const presets = getScenarioPresets();
  const customers = getCustomerOptions();

  return (
    <div className="space-y-7">
      <div>
        <EyebrowLabel>Quick scenarios</EyebrowLabel>
        <PresetChipRow
          className="mt-4"
          presets={presets}
          activeId={activePreset}
          onApply={onPreset}
        />
      </div>

      <div className="space-y-6 border-t border-edge-dark pt-6">
        <div className="space-y-2">
          <label
            htmlFor="scenario-customer"
            className="text-label-xs uppercase text-chalk-lo"
          >
            Customer delay — who
          </label>
          <select
            id="scenario-customer"
            value={state.customerId}
            onChange={(e) => onChange({ ...state, customerId: e.target.value })}
            className="w-full border border-edge-dark bg-void px-3 py-2.5 text-body-sm text-chalk-hi"
          >
            {customers.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
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
        />
      </div>

      <Button variant="ghost" onClick={onReset} className="w-full">
        <RotateCcw className="h-3.5 w-3.5" /> Reset assumptions
      </Button>
    </div>
  );
}
