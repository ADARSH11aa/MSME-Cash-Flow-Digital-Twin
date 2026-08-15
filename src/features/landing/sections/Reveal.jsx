import { motion, useReducedMotion } from 'framer-motion';

/**
 * Scroll reveal per PRD 2.4 — fade plus 12px rise, 400ms, staggered 60ms.
 *
 * @param {{ children: React.ReactNode, index?: number, className?: string }} props
 */
export default function Reveal({ children, index = 0, className }) {
  const prefersReduced = useReducedMotion();

  // DELIBERATE DEVIATION from PRD 2.4, which asks for "opacity fades only"
  // under reduced motion. Do not "fix" this back to a fade.
  //
  // A whileInView fade — however short — still starts at opacity 0 and depends
  // on an IntersectionObserver callback to reach opacity 1. When that callback
  // does not fire, the section stays permanently invisible. This was observed,
  // not theorised: forcing reduced motion left the entire problem section blank.
  // Hiding content from the users who asked for less motion is a worse outcome
  // than the animation the rule exists to spare them, so under reduced motion
  // the content is rendered outright and no animation is attached at all.
  if (prefersReduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
