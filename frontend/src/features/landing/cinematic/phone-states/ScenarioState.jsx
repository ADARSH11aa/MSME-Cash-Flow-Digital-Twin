import { motion } from 'framer-motion';
import { Sliders, Sparkles, TrendingUp } from 'lucide-react';

export default function ScenarioState() {
  return (
    <div className="flex-1 flex flex-col justify-between space-y-2.5 text-left">
      {/* In-Phone Feature Header */}
      <div className="space-y-0.5 pb-1 border-b border-edge-dark/60">
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-lime uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
          05 &middot; What-If Simulation
        </div>
        <p className="font-display text-[13px] font-bold text-chalk-hi leading-tight">
          Test decisions before committing.
        </p>
      </div>

      {/* Simulation Header */}
      <div className="rounded-xl border border-lime/30 bg-surface-2 p-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-chalk-hi flex items-center gap-1">
            <Sliders className="h-3 w-3 text-lime" />
            Shock Simulator
          </span>
          <span className="rounded-full bg-lime/15 border border-lime/30 px-1.5 py-0.5 text-[8.5px] font-mono text-lime font-bold">
            +20% Growth
          </span>
        </div>

        {/* Interactive Shock Slider Bar */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[9px] text-chalk-lo font-mono">
            <span>Customer Sales Growth</span>
            <span className="text-lime font-bold">+20.0%</span>
          </div>
          <div className="relative h-1.5 w-full bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '65%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-lime rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Before / After Impact Matrix */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="rounded-xl border border-edge-dark bg-surface-2 p-2 shadow-sm text-center">
          <p className="text-[8.5px] uppercase font-mono text-chalk-lo">Revenue</p>
          <p className="font-display text-[10px] text-chalk-lo line-through">₹12.4L</p>
          <p className="font-display text-[13px] font-bold text-lime">₹14.9L</p>
        </div>

        <div className="rounded-xl border border-lime/40 bg-lime/10 p-2 shadow-[0_0_12px_rgba(182,255,59,0.1)] text-center">
          <p className="text-[8.5px] uppercase font-mono text-lime font-bold">Cash</p>
          <p className="font-display text-[10px] text-chalk-lo line-through">₹3.4L</p>
          <p className="font-display text-[13px] font-bold text-white">₹5.8L</p>
        </div>

        <div className="rounded-xl border border-edge-dark bg-surface-2 p-2 shadow-sm text-center">
          <p className="text-[8.5px] uppercase font-mono text-chalk-lo">Runway</p>
          <p className="font-display text-[10px] text-chalk-lo line-through">4.8M</p>
          <p className="font-display text-[13px] font-bold text-lime">6.2M</p>
        </div>
      </div>

      {/* Outcome Verdict Card */}
      <div className="rounded-xl border border-edge-dark bg-surface-2 p-2.5 space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-chalk-hi flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-lime" />
            Verdict
          </span>
          <span className="text-lime font-mono text-[9px] font-bold">+₹2.4L Net Gain</span>
        </div>
        <p className="text-[9.5px] text-chalk-lo leading-snug">
          Breach risk cleared. Safe to hire 2 technicians without external loans.
        </p>
      </div>

      {/* Zero Risk Badge */}
      <div className="rounded-lg bg-surface-2/80 border border-edge-dark px-2.5 py-1.5 flex items-center justify-between text-[9.5px] text-chalk-lo">
        <span className="flex items-center gap-1 text-chalk-hi">
          <Sparkles className="h-3 w-3 text-lime" /> Zero risk simulation
        </span>
        <span className="text-lime font-mono font-bold">Instant Compute</span>
      </div>
    </div>
  );
}
