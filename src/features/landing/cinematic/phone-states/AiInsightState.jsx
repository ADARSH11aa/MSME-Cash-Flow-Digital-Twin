import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function AiInsightState() {
  return (
    <div className="flex-1 flex flex-col justify-between space-y-2.5 text-left">
      {/* In-Phone Feature Header */}
      <div className="space-y-0.5 pb-1 border-b border-edge-dark/60">
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-lime uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
          07 &middot; Explainable AI Intelligence
        </div>
        <p className="font-display text-[13px] font-bold text-chalk-hi leading-tight">
          Understand what the numbers mean.
        </p>
      </div>

      {/* Main Insight Card */}
      <div className="rounded-xl border border-edge-dark bg-surface-2 p-2.5 space-y-2 shadow-sm">
        <div>
          <p className="text-[8.5px] uppercase font-mono text-chalk-lo">Projected Signal</p>
          <p className="font-display text-[12px] font-bold text-chalk-hi mt-0.5 leading-snug">
            Cash balance may fall by 18% over the next 45 days.
          </p>
        </div>

        <div className="p-2 rounded-lg bg-surface border border-edge-dark/80 space-y-0.5">
          <p className="text-[8.5px] uppercase font-mono text-caution font-bold">Primary Driver</p>
          <p className="text-[10px] text-chalk-hi font-medium">
            Delayed receivables clustering across 3 wholesale buyers.
          </p>
        </div>

        <div className="p-2 rounded-lg bg-lime-8 border border-lime/20 space-y-0.5">
          <p className="text-[8.5px] uppercase font-mono text-lime font-bold">Recommended Action</p>
          <p className="text-[10px] text-chalk-hi font-medium">
            Prioritize ₹3.2L in overdue accounts with automated cadence.
          </p>
        </div>
      </div>

      {/* Trust & Explainability Badge */}
      <div className="rounded-lg bg-surface-2/80 border border-edge-dark px-2.5 py-1.5 flex items-center justify-between text-[9.5px] text-chalk-lo">
        <span className="flex items-center gap-1 text-chalk-hi">
          <ShieldCheck className="h-3 w-3 text-lime" />
          No black-box guesses &middot; Verified audits
        </span>
        <span className="text-lime font-mono font-bold">DPDP Compliant</span>
      </div>
    </div>
  );
}
