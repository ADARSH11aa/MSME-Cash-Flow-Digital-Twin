import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, ShieldCheck, Wallet, Activity } from 'lucide-react';
import StatsCounter from '@/components/shared/StatsCounter';

export default function CashPositionState() {
  return (
    <div className="flex-1 flex flex-col justify-between space-y-3 text-left">
      {/* In-Phone Feature Header */}
      <div className="space-y-0.5 pb-1 border-b border-edge-dark/60">
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-lime uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
          01 &middot; Live Cash Position
        </div>
        <p className="font-display text-[13px] font-bold text-chalk-hi leading-tight">
          Know where your cash stands.
        </p>
      </div>

      {/* Available Cash Hero Card */}
      <div className="rounded-xl border border-lime/30 bg-lime/10 p-3.5 shadow-[0_0_20px_rgba(182,255,59,0.12)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-lime text-black">
              <Wallet className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-lime font-bold">
              Available Cash
            </span>
          </div>
          <span className="rounded-full bg-lime/20 border border-lime/40 px-2 py-0.5 text-[9px] font-mono text-lime font-semibold">
            +5.4% Buffer
          </span>
        </div>

        <div className="mt-2.5">
          <p className="font-display text-[24px] font-bold text-white tracking-tight leading-none">
            <StatsCounter value={3.4} decimals={1} prefix="₹" suffix="L" duration={0.8} />
          </p>
          <p className="text-[9.5px] text-chalk-lo mt-1 flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-lime" />
            Live verified across 3 linked business accounts
          </p>
        </div>
      </div>

      {/* Real-time In/Out Flow Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-edge-dark bg-surface-2 p-2 shadow-sm">
          <div className="flex items-center justify-between text-lime">
            <span className="text-[9px] uppercase font-mono text-chalk-lo">Inflows</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
          <p className="font-display text-[14px] font-bold text-chalk-hi mt-0.5">₹1.80L</p>
          <p className="text-[8.5px] text-lime font-mono">2 settlements</p>
        </div>

        <div className="rounded-xl border border-edge-dark bg-surface-2 p-2 shadow-sm">
          <div className="flex items-center justify-between text-caution">
            <span className="text-[9px] uppercase font-mono text-chalk-lo">Outflows</span>
            <ArrowDownRight className="h-3 w-3" />
          </div>
          <p className="font-display text-[14px] font-bold text-chalk-hi mt-0.5">₹45,000</p>
          <p className="text-[8.5px] text-caution font-mono">Vendor batch</p>
        </div>
      </div>

      {/* 7-Day Liquidity Buffer Waveform */}
      <div className="rounded-xl border border-edge-dark bg-surface-2 p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-chalk-hi flex items-center gap-1">
            <Activity className="h-3 w-3 text-lime" />
            7-Day Liquidity Buffer
          </span>
          <span className="font-mono text-chalk-lo text-[9px]">Min. ₹2.00L</span>
        </div>

        <div className="h-12 w-full pt-1">
          <svg viewBox="0 0 200 45" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="cashGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b6ff3b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#b6ff3b" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              d="M0 32 Q 25 18, 50 24 T 100 12 T 150 20 T 200 8"
              fill="none"
              stroke="#b6ff3b"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M0 32 Q 25 18, 50 24 T 100 12 T 150 20 T 200 8 L 200 45 L 0 45 Z"
              fill="url(#cashGrad2)"
            />
            <line x1="0" y1="36" x2="200" y2="36" stroke="#4a5568" strokeDasharray="3 3" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Trust Pill */}
      <div className="rounded-lg bg-surface-2/80 border border-edge-dark px-2.5 py-1.5 flex items-center justify-between text-[9.5px] text-chalk-lo">
        <span className="flex items-center gap-1 text-chalk-hi">
          <ShieldCheck className="h-3 w-3 text-lime" />
          Zero manual entry
        </span>
        <span className="text-lime font-mono font-semibold">100% Real-time</span>
      </div>
    </div>
  );
}
