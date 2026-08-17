import { motion } from 'framer-motion';

export default function CinematicAtmosphere({ stateIndex = 0, mouseX = 0, mouseY = 0 }) {
  const getAtmosphereGlow = () => {
    switch (stateIndex) {
      case 0:
      case 1:
        return 'radial-gradient(circle, rgba(182, 255, 59, 0.18) 0%, rgba(111, 168, 255, 0.1) 50%, transparent 70%)';
      case 2:
      case 3:
        return 'radial-gradient(circle, rgba(111, 168, 255, 0.22) 0%, rgba(182, 255, 59, 0.12) 50%, transparent 70%)';
      case 4:
        return 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(182, 255, 59, 0.15) 50%, transparent 70%)';
      case 5:
        return 'radial-gradient(circle, rgba(182, 255, 59, 0.22) 0%, rgba(45, 212, 191, 0.15) 50%, transparent 70%)';
      case 6:
        return 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(239, 68, 68, 0.12) 50%, transparent 70%)';
      case 7:
      case 8:
      default:
        return 'radial-gradient(circle, rgba(182, 255, 59, 0.2) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 70%)';
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10" aria-hidden="true">
      {/* Primary Dynamic Radial Atmosphere Glow */}
      <motion.div
        animate={{
          x: mouseX * 25,
          y: mouseY * 25,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 100 }}
        className="absolute -right-20 -top-20 h-[650px] w-[650px] rounded-full blur-[140px] transition-all duration-1000"
        style={{
          background: getAtmosphereGlow(),
        }}
      />

      {/* Secondary Left Ambient Glow */}
      <motion.div
        animate={{
          x: -mouseX * 15,
          y: -mouseY * 15,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 100 }}
        className="absolute -left-32 top-1/3 h-[500px] w-[500px] rounded-full opacity-15 blur-[130px] transition-all duration-1000"
        style={{
          background:
            stateIndex === 6
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(182, 255, 59, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Subtle Matrix Dot Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Subtle Cinematic Backdrop Blur Layer */}
      <div className="absolute inset-0 backdrop-blur-[14px] bg-black/35" />
    </div>
  );
}
