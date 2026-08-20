import { AnimatePresence, motion } from 'framer-motion';
import { Wifi, Battery } from 'lucide-react';
import InitialPhoneState from './phone-states/InitialPhoneState';
import CashPositionState from './phone-states/CashPositionState';
import PatternsState from './phone-states/PatternsState';
import ForecastState from './phone-states/ForecastState';
import DigitalTwinState from './phone-states/DigitalTwinState';
import ScenarioState from './phone-states/ScenarioState';
import RiskState from './phone-states/RiskState';
import AiInsightState from './phone-states/AiInsightState';

export default function CinematicPhone({
  stateIndex = 0,
  daysToBreach = 28,
  phoneRotation = 0,
  phoneScale = 1,
  phoneX = 0,
  phoneY = 0,
}) {
  const renderScreenState = () => {
    switch (stateIndex) {
      case 0:
        return <InitialPhoneState daysToBreach={daysToBreach} />;
      case 1:
        return <CashPositionState />;
      case 2:
        return <PatternsState />;
      case 3:
        return <ForecastState />;
      case 4:
        return <DigitalTwinState />;
      case 5:
        return <ScenarioState />;
      case 6:
        return <RiskState />;
      case 7:
      case 8:
      default:
        return <AiInsightState />;
    }
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[315px] sm:max-w-[335px] lg:max-w-[350px] transition-transform duration-300 ease-out"
      style={{
        perspective: '1600px',
        transform: `translate3d(${phoneX}px, ${phoneY}px, 0px) rotateY(${phoneRotation * 0.8}deg) rotateX(${-phoneRotation * 0.4}deg) scale(${phoneScale})`,
      }}
    >
      {/* Outer Metallic Bezel Chassis */}
      <div className="relative rounded-[50px] border-[4px] border-[#554d5e] bg-[#121016] shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-[3.5px] transition-shadow duration-500">
        {/* Glow halo behind bezel corresponding to active phase */}
        <div
          className="absolute -inset-1 rounded-[54px] opacity-40 blur-xl pointer-events-none -z-10 transition-colors duration-700"
          style={{
            background:
              stateIndex === 6
                ? 'rgba(245, 158, 11, 0.35)'
                : stateIndex === 4
                ? 'rgba(111, 168, 255, 0.35)'
                : 'rgba(182, 255, 59, 0.3)',
          }}
        />

        {/* Inner Uniform Black Screen Housing */}
        <div className="relative rounded-[45px] border-[6px] border-[#08090a] bg-surface overflow-hidden shadow-inner flex flex-col min-h-[600px] sm:min-h-[625px]">
          {/* Phone Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3.5 pb-2 text-label-xs text-chalk-lo select-none">
            <span className="font-semibold text-chalk-hi tracking-tight text-[12px]">9:41</span>
            {/* Dynamic Island Pill with Camera Glare Dot */}
            <div className="flex items-center justify-end h-5 w-24 rounded-full bg-black px-2.5 shadow-sm border border-white/5">
              <span className="h-2 w-2 rounded-full bg-[#111e28] ring-1 ring-blue-500/20" />
            </div>
            <div className="flex items-center gap-1.5 text-chalk-hi">
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Morphing Screen Body */}
          <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={stateIndex}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col justify-between"
              >
                {renderScreenState()}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Home Indicator Bar */}
            <div className="flex justify-center pt-2 select-none">
              <div className="h-1 w-28 rounded-full bg-chalk-lo/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
