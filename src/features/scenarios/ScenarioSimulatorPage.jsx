import { Save, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import cn from '@/lib/cn';
import Button from '@/components/shared/Button';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import Figure from '@/components/shared/Figure';
import ForecastChart from '@/components/shared/ForecastChart';
import SegmentedToggle from '@/components/shared/SegmentedToggle';
import { useToast } from '@/components/shared/Toast';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BUSINESS } from '@/mocks/fixtures/business';
import { getRecommendation } from '@/mocks/api/recommendations';
import { runScenario } from '@/mocks/api/scenarios';
import ScenarioBuilder from './components/ScenarioBuilder';
import ScenarioDeltaStrip from './components/ScenarioDeltaStrip';

/**
 * Scenario & stress-test simulator (PRD 3.5).
 *
 * Recalculation is live rather than gated behind a Run button — the PRD
 * prefers it for demo impact, and the model is cheap enough to run on every
 * slider move without debouncing.
 */

const INITIAL = {
  customerId: 'cust-sharma',
  delayDays: 0,
  revenueShockPct: 0,
  expenseShockPct: 0,
};

export default function ScenarioSimulatorPage() {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [state, setState] = useState(INITIAL);
  const [activePreset, setActivePreset] = useState(null);
  const [result, setResult] = useState(null);
  const [band, setBand] = useState('expected');
  const [saved, setSaved] = useState([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [applied, setApplied] = useState(null);

  // A recommendation's "Simulate this" lands here with ?apply=<id>, so the
  // owner sees the gap closing before committing to anything (PRD 3.6).
  const applyId = params.get('apply');

  const shocks = useMemo(() => {
    const base = {
      revenueShockPct: state.revenueShockPct,
      expenseShockPct: state.expenseShockPct,
    };
    if (state.delayDays > 0) {
      base.customerDelay = { customerId: state.customerId, days: state.delayDays };
    }
    if (applied) Object.assign(base, applied.shocks);
    return base;
  }, [state, applied]);

  useEffect(() => {
    if (!applyId) return;
    const rec = getRecommendation(applyId);
    if (rec) {
      setApplied(rec);
      toast({
        title: `Applied: ${rec.strategy}`,
        description: 'Shown as an overlay against your current forecast.',
        tone: 'info',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyId]);

  useEffect(() => {
    let cancelled = false;
    runScenario(shocks, 90).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [shocks]);

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    const next = { ...INITIAL };
    if (preset.shocks.customerDelay) {
      next.customerId = preset.shocks.customerDelay.customerId;
      next.delayDays = preset.shocks.customerDelay.days;
    }
    next.revenueShockPct = preset.shocks.revenueShockPct ?? 0;
    next.expenseShockPct = preset.shocks.expenseShockPct ?? 0;
    setState(next);
  };

  const reset = () => {
    setState(INITIAL);
    setActivePreset(null);
    setApplied(null);
  };

  const save = () => {
    const label =
      activePreset || state.delayDays || state.revenueShockPct || state.expenseShockPct
        ? `Delay ${state.delayDays}d · Sales ${state.revenueShockPct}% · Costs ${state.expenseShockPct}%`
        : 'Baseline';
    setSaved((s) => [...s, { id: `${Date.now()}`, label, state: { ...state } }]);
    toast({ title: 'Scenario saved', description: label, tone: 'success' });
  };

  const builder = (
    <ScenarioBuilder
      state={state}
      onChange={(next) => {
        setState(next);
        setActivePreset(null);
      }}
      onPreset={applyPreset}
      activePreset={activePreset}
      onReset={reset}
    />
  );

  return (
    <div className="px-5 py-8 md:px-8">
      <header className="mb-6">
        <EyebrowLabel>Stress testing</EyebrowLabel>
        <h1 className="mt-3 font-display text-display-md text-chalk-hi">Scenario simulator</h1>
        <p className="mt-1 max-w-2xl text-body-sm text-chalk-lo">
          Change an assumption and watch the projection recalculate. Nothing here changes your real
          data.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        {/* Builder is a persistent left panel on desktop, a bottom sheet on
            mobile (PRD Section 7). */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 border border-edge-dark bg-surface p-5">{builder}</div>
        </aside>

        <div className="lg:hidden">
          <Button variant="secondary" className="w-full" onClick={() => setBuilderOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Adjust assumptions
          </Button>
          <Sheet open={builderOpen} onOpenChange={setBuilderOpen}>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Scenario assumptions</SheetTitle>
              </SheetHeader>
              <SheetBody>{builder}</SheetBody>
            </SheetContent>
          </Sheet>
        </div>

        <div className="min-w-0 space-y-6">
          {result ? <ScenarioDeltaStrip result={result} /> : <div className="h-32" />}

          <section className="border border-edge-dark bg-surface p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-heading-md text-chalk-hi">
                Recalculated forecast
                {applied ? (
                  <span className="ml-2 text-body-sm text-lime">· {applied.strategy} applied</span>
                ) : null}
              </h2>
              <SegmentedToggle
                label="Emphasised band"
                value={band}
                onChange={setBand}
                size="sm"
                options={[
                  { value: 'optimistic', label: 'Optimistic', tone: 'optimistic' },
                  { value: 'expected', label: 'Expected', tone: 'expected' },
                  { value: 'pessimistic', label: 'Pessimistic', tone: 'pessimistic' },
                ]}
              />
            </div>

            {result ? (
              <ForecastChart
                forecast={result.after}
                baseline={result.before}
                minimumBuffer={BUSINESS.minimumBuffer}
                emphasis={band}
                height={340}
                ariaSummary={`Under this scenario, cash falls below the buffer after ${result.daysToBreachAfter ?? 'no'} days, compared with ${result.daysToBreachBefore ?? 'no'} days before.`}
              />
            ) : (
              <div className="h-[340px] animate-pulse bg-surface-2" />
            )}

            <p className="mt-4 text-body-sm text-chalk-lo">
              Dashed grey line shows your forecast before this scenario was applied.
            </p>
          </section>

          {result ? <BandTable bands={result.bands} activeBand={band} onSelect={setBand} /> : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={save}>
              <Save className="h-4 w-4" /> Save scenario
            </Button>
            {saved.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setState(s.state)}
                className="rounded-full border border-edge-dark px-3 py-1.5 text-label-xs uppercase text-chalk-lo transition-colors hover:border-chalk-lo hover:text-chalk-hi"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Optimistic / expected / pessimistic comparison (concept doc §6.5). */
function BandTable({ bands, activeBand, onSelect }) {
  const meta = {
    optimistic: { label: 'Optimistic', note: 'Everyone pays on contractual terms', tone: 'text-viz-optimistic' },
    expected: { label: 'Expected', note: 'Customers pay with their usual delay', tone: 'text-viz-expected' },
    pessimistic: { label: 'Pessimistic', note: 'Everyone pays at their worst observed delay', tone: 'text-viz-pessimistic' },
  };

  return (
    // Scrolls within itself on narrow screens rather than widening the page.
    <section className="overflow-x-auto border border-edge-dark bg-surface">
      <table className="w-full min-w-[560px] text-left">
        <caption className="sr-only">Outcome by forecast band</caption>
        <thead>
          <tr className="border-b border-edge-dark">
            <th scope="col" className="px-5 py-3 text-label-xs uppercase text-chalk-lo">Band</th>
            <th scope="col" className="px-5 py-3 text-label-xs uppercase text-chalk-lo">Assumption</th>
            <th scope="col" className="px-5 py-3 text-right text-label-xs uppercase text-chalk-lo">Days to breach</th>
            <th scope="col" className="px-5 py-3 text-right text-label-xs uppercase text-chalk-lo">Closing cash</th>
          </tr>
        </thead>
        <tbody>
          {bands.map((row) => (
            <tr
              key={row.band}
              onClick={() => onSelect(row.band)}
              className={cn(
                'cursor-pointer border-b border-edge-dark transition-colors last:border-b-0 hover:bg-surface-2',
                row.band === activeBand && 'bg-surface-2',
              )}
            >
              <td className={cn('px-5 py-3 text-body-sm', meta[row.band].tone)}>
                {meta[row.band].label}
              </td>
              <td className="px-5 py-3 text-body-sm text-chalk-lo">{meta[row.band].note}</td>
              <td data-numeric className="px-5 py-3 text-right text-body-sm tabular text-chalk-hi">
                {row.daysToBreach ?? 'No breach'}
              </td>
              <td className="px-5 py-3 text-right text-body-sm text-chalk-hi">
                <Figure value={row.closing} variant="currencyShort" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
