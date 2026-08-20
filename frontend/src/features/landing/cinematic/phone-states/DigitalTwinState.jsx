import { motion } from 'framer-motion';
import { Cpu, Network, Zap, CheckCircle2 } from 'lucide-react';

export default function DigitalTwinState() {
  const nodes = [
    { label: 'Revenue Flow', value: '₹14.2L/mo', status: 'Optimal', color: 'text-lime', borderColor: 'border-lime/40' },
    { label: 'Receivables Book', value: '14 Active Invoices', status: 'Syncing', color: 'text-info', borderColor: 'border-info/40' },
    { label: 'Operating Expenses', value: '₹5.3L/mo', status: 'Fixed', color: 'text-caution', borderColor: 'border-caution/40' },
    { label: 'Twin Simulation', value: '30-Day Horizons', status: '100% Live', color: 'text-lime', borderColor: 'border-lime/60' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between space-y-2.5 text-left">
      {/* In-Phone Feature Header */}
      <div className="space-y-0.5 pb-1 border-b border-edge-dark/60">
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-lime uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
          04 &middot; Digital Twin Engine
        </div>
        <p className="font-display text-[13px] font-bold text-chalk-hi leading-tight">
          Your business. Simulated in real time.
        </p>
      </div>

      {/* Engine Status Header */}
      <div className="rounded-xl border border-lime/30 bg-lime/10 p-2.5 flex items-center justify-between shadow-[0_0_16px_rgba(182,255,59,0.1)]">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-lime text-black font-bold">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="font-display text-[11px] font-bold text-white leading-tight">Digital Twin Core</p>
            <p className="text-[8.5px] font-mono text-lime">Active Mathematical Model</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[8.5px] font-mono text-lime bg-lime/20 px-2 py-0.5 rounded-full font-semibold">
          <Zap className="h-2 w-2" /> 60fps Sync
        </span>
      </div>

      {/* Connected Graph Topology Visualizer */}
      <div className="rounded-xl border border-edge-dark bg-surface-2 p-2.5 space-y-1.5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-chalk-hi flex items-center gap-1">
            <Network className="h-3 w-3 text-lime" />
            Node Telemetry
          </span>
          <span className="text-[8.5px] font-mono text-chalk-lo">Directed Graph</span>
        </div>

        {/* Node Graph Topology Map */}
        <div className="space-y-1 pt-0.5">
          {nodes.map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className={`rounded-lg border ${node.borderColor} bg-surface/90 p-1.5 flex items-center justify-between shadow-xs`}
            >
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-lime animate-ping" />
                <div>
                  <p className="text-[10px] font-medium text-chalk-hi leading-tight">{node.label}</p>
                  <p className="text-[8.5px] text-chalk-lo font-mono">{node.value}</p>
                </div>
              </div>
              <span className={`text-[8.5px] font-mono font-bold ${node.color} uppercase`}>
                {node.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Synchronized State Banner */}
      <div className="rounded-lg bg-surface-2/80 border border-edge-dark p-2 text-[9.5px] text-chalk-lo flex items-center gap-2">
        <CheckCircle2 className="h-3 w-3 text-lime shrink-0" />
        <span>Updates in real time with bank &amp; invoice events.</span>
      </div>
    </div>
  );
}
