import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, BarChart3, Layers } from 'lucide-react';

export default function PatternsState() {
  const categories = [
    { name: 'Customer Sales', amount: '₹5.20L', pct: 60, color: 'bg-lime' },
    { name: 'Overdue Receivables', amount: '₹3.40L', pct: 40, color: 'bg-emerald-400' },
    { name: 'Payroll & Wages', amount: '₹2.60L', pct: 50, color: 'bg-info' },
    { name: 'Raw Material Inventory', amount: '₹1.80L', pct: 34, color: 'bg-caution' },
    { name: 'Utilities & Logistics', amount: '₹90,000', pct: 16, color: 'bg-neutral-500' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between space-y-2.5 text-left">
      {/* In-Phone Feature Header */}
      <div className="space-y-0.5 pb-1 border-b border-edge-dark/60">
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-lime uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
          02 &middot; Cash Flow Drivers
        </div>
        <p className="font-display text-[13px] font-bold text-chalk-hi leading-tight">
          See what&apos;s driving your cash.
        </p>
      </div>

      {/* Net Summary Strip */}
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-edge-dark bg-surface-2 p-2 shadow-sm text-center">
        <div>
          <p className="text-[8.5px] uppercase font-mono text-chalk-lo flex items-center justify-center gap-0.5">
            <ArrowDownLeft className="h-2.5 w-2.5 text-lime" /> IN
          </p>
          <p className="font-display text-[12px] font-bold text-lime mt-0.5">₹8.6L</p>
        </div>
        <div className="border-x border-edge-dark/60">
          <p className="text-[8.5px] uppercase font-mono text-chalk-lo flex items-center justify-center gap-0.5">
            <ArrowUpRight className="h-2.5 w-2.5 text-caution" /> OUT
          </p>
          <p className="font-display text-[12px] font-bold text-chalk-hi mt-0.5">₹5.3L</p>
        </div>
        <div>
          <p className="text-[8.5px] uppercase font-mono text-chalk-lo">NET FLOW</p>
          <p className="font-display text-[12px] font-bold text-lime mt-0.5">+₹3.3L</p>
        </div>
      </div>

      {/* Category Breakdown list */}
      <div className="rounded-xl border border-edge-dark bg-surface-2 p-2.5 space-y-2 shadow-sm">
        <div className="flex items-center justify-between pb-1 border-b border-edge-dark/60">
          <span className="text-[10px] font-semibold text-chalk-hi flex items-center gap-1">
            <Layers className="h-3 w-3 text-lime" />
            Active Cash Drivers
          </span>
          <span className="text-[8.5px] font-mono text-chalk-lo">Monthly Aggregate</span>
        </div>

        <div className="space-y-1.5">
          {categories.map((cat, idx) => (
            <div key={cat.name} className="space-y-0.5">
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="text-chalk-hi font-medium">{cat.name}</span>
                <span className="font-mono text-chalk-lo">{cat.amount}</span>
              </div>
              <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.pct}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                  className={`h-full rounded-full ${cat.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Analysis Insight */}
      <div className="rounded-lg bg-surface-2/90 border border-edge-dark p-2 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-lime/10 text-lime shrink-0">
          <BarChart3 className="h-3.5 w-3.5" />
        </div>
        <div className="text-[9.5px] leading-tight">
          <p className="text-chalk-hi font-semibold">Net Cash Positive</p>
          <p className="text-chalk-lo mt-0.5">Restock cycle in 12 days</p>
        </div>
      </div>
    </div>
  );
}
