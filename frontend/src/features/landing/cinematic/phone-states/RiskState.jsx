import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export default function RiskState() {
  return (
    <div className="flex-1 flex flex-col justify-between space-y-2.5 text-left">
      {/* In-Phone Feature Header */}
      <div className="space-y-0.5 pb-1 border-b border-edge-dark/60">
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-caution uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-caution animate-pulse" />
          06 &middot; Risk Detection Radar
        </div>
        <p className="font-display text-[13px] font-bold text-chalk-hi leading-tight">
          Spot the cash gap before it hits.
        </p>
      </div>

      {/* Risk Alert Header Banner */}
      <div className="rounded-xl border border-caution/40 bg-caution/15 p-2.5 shadow-[0_0_16px_rgba(245,158,11,0.15)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-caution text-black">
              <AlertTriangle className="h-3 w-3" />
            </div>
            <span className="text-[9.5px] font-mono uppercase tracking-wider text-caution font-bold">
              Cash Gap Detected
            </span>
          </div>
          <span className="rounded-full bg-caution/20 border border-caution/40 px-1.5 py-0.5 text-[8.5px] font-mono text-caution font-bold">
            High Priority
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <p className="font-display text-[20px] font-bold text-white tracking-tight leading-none">
              ₹3.20 Lakhs
            </p>
            <p className="text-[9px] text-caution font-mono mt-1 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> Shortfall on Day 28
            </p>
          </div>
          <div className="text-right text-[9px] text-chalk-lo">
            <span className="block font-mono text-chalk-hi font-bold">Buffer Breach</span>
            <span>&lt; ₹2.00L Limit</span>
          </div>
        </div>
      </div>

      {/* Root Cause Analysis Card */}
      <div className="rounded-xl border border-edge-dark bg-surface-2 p-2.5 space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-chalk-hi">Root Cause</span>
          <span className="text-[8.5px] font-mono text-caution">Identified Early</span>
        </div>

        <div className="space-y-1 text-[9.5px]">
          <div className="flex items-center justify-between p-1.5 rounded-md bg-surface border border-edge-dark">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-caution shrink-0" />
              <span className="text-chalk-hi font-medium truncate max-w-[160px]">Sharma Furnishings (35d delay)</span>
            </div>
            <span className="font-mono text-chalk-hi font-bold">₹2.40L</span>
          </div>
        </div>
      </div>

      {/* Recommended Action (Zero Debt) */}
      <div className="rounded-xl border border-lime/30 bg-lime/10 p-2.5 space-y-1 shadow-sm">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-lime flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-lime" />
            Recommended Action &middot; Zero Debt
          </span>
          <span className="text-[8.5px] font-mono text-lime font-bold">Recover ₹3.2L</span>
        </div>
        <p className="text-[9.5px] text-chalk-hi leading-snug">
          Trigger 2% early-settlement discount. Resolves shortfall without expensive loans.
        </p>
      </div>
    </div>
  );
}
