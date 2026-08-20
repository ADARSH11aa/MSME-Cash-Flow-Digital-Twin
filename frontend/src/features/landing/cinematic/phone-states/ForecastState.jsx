import { motion } from 'framer-motion';
import { Compass, ShieldCheck, Sparkles } from 'lucide-react';

export default function ForecastState() {
  return (
    <div className="flex-1 flex flex-col justify-between space-y-2.5 text-left">
      {/* In-Phone Feature Header */}
      <div className="space-y-0.5 pb-1 border-b border-edge-dark/60">
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-lime uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
          03 &middot; 3-Band Forecasting
        </div>
        <p className="font-display text-[13px] font-bold text-chalk-hi leading-tight">
          Know what&apos;s coming next.
        </p>
      </div>

      {/* Forecast Metric Ribbon */}
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-edge-dark bg-surface-2 p-2 shadow-sm text-center">
        <div>
          <p className="text-[8.5px] uppercase font-mono text-chalk-lo">Current</p>
          <p className="font-display text-[12px] font-bold text-chalk-hi mt-0.5">₹3.4L</p>
        </div>
        <div className="border-x border-edge-dark/60 bg-lime/5 rounded">
          <p className="text-[8.5px] uppercase font-mono text-lime font-bold">30D Forecast</p>
          <p className="font-display text-[12px] font-bold text-lime mt-0.5">₹4.8L</p>
        </div>
        <div>
          <p className="text-[8.5px] uppercase font-mono text-chalk-lo">90D Proj.</p>
          <p className="font-display text-[12px] font-bold text-chalk-hi mt-0.5">₹6.2L</p>
        </div>
      </div>

      {/* Predictive Forward Chart */}
      <div className="rounded-xl border border-edge-dark bg-surface-2 p-2.5 space-y-1.5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-chalk-hi flex items-center gap-1">
            <Compass className="h-3 w-3 text-lime" />
            3-Band Trajectory
          </span>
          <span className="text-[8.5px] font-mono text-lime flex items-center gap-1">
            <Sparkles className="h-2 w-2" /> 90D Projection
          </span>
        </div>

        {/* Prediction Chart SVG */}
        <div className="h-24 w-full pt-1">
          <svg viewBox="0 0 240 85" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="forecastGlow2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6fa8ff" />
                <stop offset="100%" stopColor="#b6ff3b" />
              </linearGradient>
              <linearGradient id="riskZone2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.0)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.18)" />
              </linearGradient>
            </defs>

            {/* Risk Zone Base */}
            <rect x="0" y="60" width="240" height="25" fill="url(#riskZone2)" rx="4" />
            <line x1="0" y1="60" x2="240" y2="60" stroke="#ef4444" strokeDasharray="3 3" strokeWidth="1" strokeOpacity="0.4" />
            <text x="5" y="74" fill="#ef4444" fontSize="6" fontFamily="monospace" opacity="0.8">BUFFER RISK LIMIT (₹2.0L)</text>

            {/* Historical Actual Solid Line */}
            <path
              d="M 5 48 Q 25 42, 45 45 T 80 38"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* "Today" Point Marker */}
            <circle cx="80" cy="38" r="4" fill="#b6ff3b" stroke="#121016" strokeWidth="2" />
            <line x1="80" y1="8" x2="80" y2="80" stroke="#b6ff3b" strokeDasharray="2 2" strokeWidth="1" strokeOpacity="0.5" />
            <text x="83" y="14" fill="#b6ff3b" fontSize="6.5" fontWeight="bold" fontFamily="monospace">TODAY</text>

            {/* Optimistic Forward Line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              d="M 80 38 Q 120 28, 160 20 T 235 10"
              fill="none"
              stroke="#6fa8ff"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              strokeOpacity="0.6"
            />

            {/* Expected Forward Projection (Glow Line) */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              d="M 80 38 Q 120 32, 160 25 T 235 18"
              fill="none"
              stroke="url(#forecastGlow2)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Pessimistic Forward Line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              d="M 80 38 Q 120 44, 160 50 T 235 54"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              strokeOpacity="0.6"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[8.5px] font-mono text-chalk-lo pt-1 border-t border-edge-dark/60">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Actual
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Expected
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-caution" /> Stress Worst
          </span>
        </div>
      </div>

      {/* Model Confidence Strip */}
      <div className="rounded-lg bg-surface-2/80 border border-edge-dark px-2.5 py-1.5 flex items-center justify-between text-[9.5px] text-chalk-lo">
        <span className="flex items-center gap-1 text-chalk-hi">
          <ShieldCheck className="h-3 w-3 text-lime" />
          Trained on 2,400+ cycles
        </span>
        <span className="text-lime font-mono font-bold">98.4% Confidence</span>
      </div>
    </div>
  );
}
