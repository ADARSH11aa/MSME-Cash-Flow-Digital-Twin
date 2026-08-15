import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import cn from '@/lib/cn';
import { formatCurrency, formatCurrencyShort, formatDateShort, formatDateLong } from '@/lib/format';

/**
 * The cash-flow forecast chart (PRD 2.5 / 3.4.3): three overlaid bands, a
 * "today" marker and a minimum-buffer threshold line, with smooth line drawing animation.
 *
 * @param {{
 *   forecast: Array<{ date: string, optimistic: number, expected: number, pessimistic: number }>,
 *   baseline?: Array<{ date: string, expected: number }>,
 *   minimumBuffer: number,
 *   todayIndex?: number,
 *   emphasis?: 'expected'|'optimistic'|'pessimistic',
 *   height?: number,
 *   ariaSummary?: string,
 *   className?: string,
 *   animate?: boolean,
 * }} props
 */
export default function ForecastChart({
  forecast,
  baseline,
  minimumBuffer,
  emphasis = 'expected',
  height = 320,
  ariaSummary,
  className,
  animate = true,
}) {
  // Merge the baseline series in by date so both lines share one x-axis.
  const data = forecast.map((point, index) => ({
    ...point,
    baseline: baseline?.[index]?.expected ?? null,
  }));

  const todayDate = forecast[0]?.date;

  const bandOpacity = (band) => (emphasis === band ? 0.28 : 0.1);
  const lineWidth = (band) => (emphasis === band ? 2.5 : 1.5);

  return (
    <div
      className={cn('w-full', className)}
      role="img"
      aria-label={
        ariaSummary ??
        `Cash-flow forecast over ${forecast.length} days, showing optimistic, expected and pessimistic projections against a minimum operating buffer of ${formatCurrency(minimumBuffer)}.`
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            {['optimistic', 'expected', 'pessimistic'].map((band) => (
              <linearGradient key={band} id={`fill-${band}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`var(--viz-${band})`} stopOpacity={bandOpacity(band)} />
                <stop offset="100%" stopColor={`var(--viz-${band})`} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid stroke="var(--viz-grid)" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            stroke="var(--text-onDark-lo)"
            tick={{ fontSize: 11, fill: 'var(--text-onDark-lo)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border-onDark)' }}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={formatCurrencyShort}
            stroke="var(--text-onDark-lo)"
            tick={{ fontSize: 11, fill: 'var(--text-onDark-lo)' }}
            tickLine={false}
            axisLine={false}
            width={64}
          />

          {/* Minimum operating buffer — the line the forecast must not cross. */}
          <ReferenceLine
            y={minimumBuffer}
            stroke="var(--risk-amber)"
            strokeDasharray="4 4"
            label={{
              value: 'MIN BUFFER',
              position: 'insideTopLeft',
              fill: 'var(--risk-amber)',
              fontSize: 10,
              letterSpacing: '0.08em',
            }}
          />

          {/* "Today" sits on the first data point */}
          {todayDate ? (
            <ReferenceLine
              x={todayDate}
              stroke="var(--text-onDark-lo)"
              strokeDasharray="2 4"
              label={{
                value: 'TODAY',
                position: 'insideBottomLeft',
                fill: 'var(--text-onDark-lo)',
                fontSize: 10,
                letterSpacing: '0.08em',
                dx: 8,
                dy: -6,
              }}
            />
          ) : null}

          <Area
            type="monotone"
            dataKey="optimistic"
            stroke="var(--viz-optimistic)"
            strokeWidth={lineWidth('optimistic')}
            fill="url(#fill-optimistic)"
            dot={false}
            activeDot={false}
            isAnimationActive={animate}
            animationDuration={1200}
            animationEasing="ease-out"
            name="Optimistic"
          />
          <Area
            type="monotone"
            dataKey="pessimistic"
            stroke="var(--viz-pessimistic)"
            strokeWidth={lineWidth('pessimistic')}
            fill="url(#fill-pessimistic)"
            dot={false}
            activeDot={false}
            isAnimationActive={animate}
            animationDuration={1500}
            animationEasing="ease-out"
            name="Pessimistic"
          />
          <Area
            type="monotone"
            dataKey="expected"
            stroke="var(--viz-expected)"
            strokeWidth={lineWidth('expected')}
            fill="url(#fill-expected)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--viz-expected)' }}
            isAnimationActive={animate}
            animationDuration={1350}
            animationEasing="ease-out"
            name="Expected"
          />

          {/* Pre-scenario baseline, dimmed and dashed behind the new curve. */}
          {baseline ? (
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="var(--text-onDark-lo)"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={animate}
              animationDuration={1100}
              animationEasing="ease-out"
              name="Before scenario"
            />
          ) : null}

          <Tooltip
            cursor={{ stroke: 'var(--border-onDark)', strokeWidth: 1 }}
            content={<ForecastTooltip minimumBuffer={minimumBuffer} hasBaseline={Boolean(baseline)} />}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Tooltip showing the day's breakdown
 */
function ForecastTooltip({ active, payload, label, minimumBuffer, hasBaseline }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const belowBuffer = point.expected < minimumBuffer;

  const rows = [
    { key: 'optimistic', label: 'Optimistic', value: point.optimistic, color: 'text-viz-optimistic' },
    { key: 'expected', label: 'Expected', value: point.expected, color: 'text-viz-expected' },
    {
      key: 'pessimistic',
      label: 'Pessimistic',
      value: point.pessimistic,
      color: 'text-viz-pessimistic',
    },
  ];

  return (
    <div className="min-w-[220px] rounded-xl border border-edge-dark bg-surface-2 p-3 shadow-card-dark">
      <p className="mb-2 text-label-xs uppercase text-chalk-lo">{formatDateLong(label)}</p>

      <dl className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-6">
            <dt className={cn('text-body-sm', row.color)}>{row.label}</dt>
            <dd data-numeric className="tabular text-body-sm text-chalk-hi">
              {formatCurrency(row.value)}
            </dd>
          </div>
        ))}

        {hasBaseline && point.baseline != null ? (
          <div className="flex items-center justify-between gap-6 border-t border-edge-dark pt-1.5">
            <dt className="text-body-sm text-chalk-lo">Before scenario</dt>
            <dd data-numeric className="tabular text-body-sm text-chalk-lo">
              {formatCurrency(point.baseline)}
            </dd>
          </div>
        ) : null}
      </dl>

      {belowBuffer ? (
        <p className="mt-2 border-t border-edge-dark pt-2 text-label-xs uppercase text-risk font-semibold">
          Below minimum buffer
        </p>
      ) : null}
    </div>
  );
}
