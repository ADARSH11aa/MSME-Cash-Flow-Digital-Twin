import { Bookmark, Save, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import cn from '@/lib/cn';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Figure from '@/components/shared/Figure';
import ForecastChart from '@/components/shared/ForecastChart';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
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

  const dirty =
    Boolean(applied) ||
    state.delayDays !== 0 ||
    state.revenueShockPct !== 0 ||
    state.expenseShockPct !== 0;

  useEffect(() => {
    if (!applyId) return;
    let cancelled = false;
    getRecommendation(applyId).then((rec) => {
      if (cancelled || !rec) return;
      setApplied(rec);
      toast({
        title: `Applied: ${rec.strategy}`,
        description: 'Shown as an overlay against your current forecast.',
        tone: 'info',
      });
    });
    return () => {
      cancelled = true;
    };
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
    <PageContainer>
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            Stress testing
            {/* The page recalculates silently, so this dot is the only signal
                that what you are looking at is no longer the baseline. */}
            {dirty ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-1.5 text-info"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-info" aria-hidden="true" />
                Live
              </motion.span>
            ) : null}
          </span>
        }
        title="Scenario simulator"
        subtitle="Change an assumption and watch the projection recalculate. Nothing here changes your real data."
        actions={
          <Button variant="secondary" size="sm" onClick={save}>
            <Save className="h-3.5 w-3.5" /> Save scenario
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        {/* Builder is a persistent left panel on desktop, a bottom sheet on
            mobile (PRD Section 7). */}
        <aside className="hidden lg:block">
          <Card className="sticky top-6">{builder}</Card>
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
          {result ? <ScenarioDeltaStrip result={result} /> : <StripSkeleton />}

          <Card as="section">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h2 className="font-display text-heading-md text-chalk-hi">Recalculated forecast</h2>
                {applied ? (
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-lime-8 px-2 py-0.5 text-label-xs uppercase text-lime-ink">
                    {applied.strategy} applied
                  </span>
                ) : null}
              </div>
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
              <div className="h-[340px] animate-pulse rounded-card bg-surface-2" />
            )}

            <p className="mt-4 flex items-center gap-2 text-body-sm text-chalk-lo">
              <span
                className="w-6 shrink-0 border-t-2 border-dashed border-chalk-lo/60"
                aria-hidden="true"
              />
              Dashed grey line shows your forecast before this scenario was applied.
            </p>
          </Card>

          {result ? <BandTable bands={result.bands} activeBand={band} onSelect={setBand} /> : null}

          {saved.length ? (
            <Card as="section">
              <span className="text-label-xs uppercase text-chalk-lo">Saved scenarios</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {saved.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setState(s.state)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-edge-dark px-3 py-1.5 text-label-xs uppercase text-chalk-lo transition-colors hover:border-info hover:bg-info-8 hover:text-info"
                  >
                    <Bookmark className="h-3 w-3" aria-hidden="true" />
                    {s.label}
                  </button>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}

/** Holds the delta strip's footprint so the page does not jump on first result. */
function StripSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[150px] animate-pulse rounded-card bg-surface-2" />
      ))}
    </div>
  );
}

/** Optimistic / expected / pessimistic comparison (concept doc §6.5). */
function BandTable({ bands, activeBand, onSelect }) {
  const meta = {
    optimistic: {
      label: 'Optimistic',
      note: 'Everyone pays on contractual terms',
      text: 'text-viz-optimistic',
      dot: 'bg-viz-optimistic',
      rail: 'border-viz-optimistic',
    },
    expected: {
      label: 'Expected',
      note: 'Customers pay with their usual delay',
      text: 'text-viz-expected',
      dot: 'bg-viz-expected',
      rail: 'border-viz-expected',
    },
    pessimistic: {
      label: 'Pessimistic',
      note: 'Everyone pays at their worst observed delay',
      text: 'text-viz-pessimistic',
      dot: 'bg-viz-pessimistic',
      rail: 'border-viz-pessimistic',
    },
  };

  return (
    // Scrolls within itself on narrow screens rather than widening the page.
    <Card as="section" padding="none" className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left">
        <caption className="px-5 pt-5 text-left font-display text-heading-md text-chalk-hi">
          Outcome by forecast band
          <span className="mt-1 block text-body-sm font-normal text-chalk-lo">
            Select a row to emphasise that band in the chart above.
          </span>
        </caption>
        <thead>
          <tr className="border-b border-edge-dark">
            <th scope="col" className="px-5 py-3 text-label-xs uppercase text-chalk-lo">Band</th>
            <th scope="col" className="px-5 py-3 text-label-xs uppercase text-chalk-lo">Assumption</th>
            <th scope="col" className="px-5 py-3 text-right text-label-xs uppercase text-chalk-lo">Days to breach</th>
            <th scope="col" className="px-5 py-3 text-right text-label-xs uppercase text-chalk-lo">Closing cash</th>
          </tr>
        </thead>
        <tbody>
          {bands.map((row) => {
            const active = row.band === activeBand;
            return (
              <tr
                key={row.band}
                onClick={() => onSelect(row.band)}
                className={cn(
                  'cursor-pointer border-b border-edge-dark transition-colors last:border-b-0 hover:bg-surface-2',
                  active && 'bg-surface-2',
                )}
              >
                {/* The 2px rail on the leading cell marks the selected band far
                    more legibly than a background tint alone on cream. */}
                <td
                  className={cn(
                    'border-l-2 px-5 py-3.5 text-body-sm font-medium',
                    meta[row.band].text,
                    active ? meta[row.band].rail : 'border-transparent',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn('h-2 w-2 shrink-0 rounded-full', meta[row.band].dot)}
                      aria-hidden="true"
                    />
                    {meta[row.band].label}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-body-sm text-chalk-lo">{meta[row.band].note}</td>
                <td data-numeric className="px-5 py-3.5 text-right text-body-sm tabular text-chalk-hi">
                  {row.daysToBreach ?? 'No breach'}
                </td>
                <td className="px-5 py-3.5 text-right text-body-sm text-chalk-hi">
                  <Figure value={row.closing} variant="currencyShort" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
