import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const STEP_LABELS = [
  'START',
  'CURRENT',
  'DRIVERS',
  'FORECAST',
  'TWIN',
  'SIMULATE',
  'RISK',
  'INSIGHT',
];

export default function CinematicProgress({ stateIndex = 0, scrollProgress = 0, onStepClick }) {
  return (
    <>
      {/* Right-aligned Vertical Step Nav */}
      <div className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-3 select-none pointer-events-auto">
        <div className="flex flex-col items-end gap-2.5 bg-black/40 backdrop-blur-md border border-neutral-800/60 p-2.5 rounded-full shadow-lg">
          {STEP_LABELS.map((label, idx) => {
            const isActive = stateIndex === idx;
            const isPassed = stateIndex > idx;

            return (
              <button
                key={label}
                type="button"
                onClick={() => onStepClick && onStepClick(idx)}
                className="group flex items-center gap-2.5 text-right transition-all cursor-pointer focus:outline-none"
              >
                {/* Step tooltip label on hover or active */}
                <span
                  className={`text-[9px] font-mono tracking-widest uppercase transition-opacity duration-200 ${
                    isActive
                      ? 'text-lime font-bold opacity-100'
                      : 'text-neutral-500 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {label}
                </span>

                {/* Indicator Dot */}
                <div
                  className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? 'h-3 w-3 bg-lime shadow-[0_0_10px_#b6ff3b]'
                      : isPassed
                      ? 'h-2 w-2 bg-lime/40'
                      : 'h-1.5 w-1.5 bg-neutral-700 group-hover:bg-neutral-400'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -inset-1 rounded-full bg-lime/30 animate-ping" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Scroll Progress Bar Pill */}
        <div className="h-16 w-1 rounded-full bg-neutral-800/80 overflow-hidden relative mr-1">
          <motion.div
            className="w-full bg-lime rounded-full"
            style={{ height: `${Math.min(100, Math.max(8, scrollProgress * 100))}%` }}
          />
        </div>
      </div>

      {/* Scroll Down Prompt Indicator (visible at start) */}
      {stateIndex === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-chalk-lo z-20 pointer-events-none select-none"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-chalk-lo/80">
            Scroll to explore intelligence
          </span>
          <ChevronDown className="h-4 w-4 text-lime animate-bounce" />
        </motion.div>
      )}
    </>
  );
}
