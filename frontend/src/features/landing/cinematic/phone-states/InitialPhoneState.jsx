import { TrendingUp, Clock, Receipt, ShieldCheck, Wifi, Battery, Bell } from 'lucide-react';
import StatsCounter from '@/components/shared/StatsCounter';
import Figure from '@/components/shared/Figure';
import { BUSINESS } from '@/mocks/fixtures/business';

export default function InitialPhoneState({ daysToBreach = 28 }) {
  return (
    <div className="flex-1 flex flex-col justify-between space-y-3.5 text-left">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime/20 border border-lime/40 text-lime font-display font-bold text-xs">
            MH
          </div>
          <div>
            <p className="text-[10px] text-chalk-lo leading-none font-mono">Welcome back,</p>
            <p className="font-display text-[13px] font-semibold text-chalk-hi leading-tight mt-1">
              Mark Hussain
            </p>
          </div>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-edge-dark bg-surface-2 text-chalk-lo relative">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-lime" />
        </div>
      </div>

      {/* 2x2 Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Card 1: Cash Today */}
        <div className="rounded-xl border border-edge-dark/80 bg-surface-2 p-2.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-lime-16 text-lime">
              <TrendingUp className="h-3 w-3" />
            </div>
            <span className="text-[9px] font-mono text-lime">+5.4%</span>
          </div>
          <div className="mt-2">
            <p className="font-display text-[14px] font-bold text-chalk-hi leading-tight">
              <StatsCounter value={3.4} decimals={1} prefix="₹" suffix="L" duration={1.2} />
            </p>
            <p className="text-[9px] uppercase text-chalk-lo mt-0.5">Cash Today</p>
          </div>
        </div>

        {/* Card 2: To Breach */}
        <div className="rounded-xl border border-edge-dark/80 bg-surface-2 p-2.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-caution/15 text-caution">
              <Clock className="h-3 w-3" />
            </div>
            <span className="text-[9px] font-mono text-caution">Watch</span>
          </div>
          <div className="mt-2">
            <p className="font-display text-[14px] font-bold text-caution tabular leading-tight">
              <StatsCounter value={daysToBreach} suffix=" days" duration={1.4} />
            </p>
            <p className="text-[9px] uppercase text-chalk-lo mt-0.5">To Breach</p>
          </div>
        </div>

        {/* Card 3: Receivables */}
        <div className="rounded-xl border border-edge-dark/80 bg-surface-2 p-2.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-info/15 text-info">
              <Receipt className="h-3 w-3" />
            </div>
            <span className="text-[9px] font-mono text-info">14 Inv</span>
          </div>
          <div className="mt-2">
            <p className="font-display text-[14px] font-bold text-chalk-hi leading-tight">
              <StatsCounter value={8.0} decimals={1} prefix="₹" suffix="L" duration={1.4} />
            </p>
            <p className="text-[9px] uppercase text-chalk-lo mt-0.5">Receivables</p>
          </div>
        </div>

        {/* Card 4: Accuracy */}
        <div className="rounded-xl border border-edge-dark/80 bg-surface-2 p-2.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-lime-16 text-lime">
              <ShieldCheck className="h-3 w-3" />
            </div>
            <span className="text-[9px] font-mono text-lime">Live</span>
          </div>
          <div className="mt-2">
            <p className="font-display text-[14px] font-bold text-chalk-hi leading-tight">
              <StatsCounter value={98.4} decimals={1} suffix="%" duration={1.6} />
            </p>
            <p className="text-[9px] uppercase text-chalk-lo mt-0.5">Accuracy</p>
          </div>
        </div>
      </div>

      {/* Overview Inflow Settlements */}
      <div className="rounded-xl border border-edge-dark/80 bg-surface-2 p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-edge-dark/60">
          <span className="text-[11px] font-semibold text-chalk-hi">Inflow Settlement</span>
          <span className="text-[9px] text-lime font-mono">Live Sync</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              <span className="text-chalk-hi">Hussain Woodcrafts</span>
            </div>
            <span className="font-mono text-lime font-medium">₹1.80L &middot; 75%</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-info" />
              <span className="text-chalk-hi">Brooks Textiles</span>
            </div>
            <span className="font-mono text-info font-medium">₹95K &middot; 50%</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-risk" />
              <span className="text-chalk-hi">Ross Hardware</span>
            </div>
            <span className="font-mono text-risk font-medium">Overdue +14d</span>
          </div>
        </div>
      </div>

      {/* Bottom Automated Sync Strip */}
      <div className="rounded-lg bg-lime-8 border border-lime/20 px-3 py-1.5 flex items-center justify-between text-[10px]">
        <span className="text-lime font-medium flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" /> Automated Bank Sync
        </span>
        <span className="text-lime uppercase font-mono font-bold">Active</span>
      </div>
    </div>
  );
}
