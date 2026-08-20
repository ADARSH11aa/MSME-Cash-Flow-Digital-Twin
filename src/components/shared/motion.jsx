import { motion, useReducedMotion } from 'framer-motion';
import { createContext, useContext } from 'react';

/**
 * The app-side motion vocabulary. One file so every page animates on the same
 * curve and timing rather than each screen inventing its own.
 *
 * The landing page keeps its own scroll-driven `Reveal`; this is the set for
 * authenticated screens, where content arrives on mount (and on data load)
 * rather than on scroll.
 *
 * REDUCED MOTION — the same rule the landing `Reveal` learned the hard way:
 * never animate opacity from 0 behind a callback that may not fire. Under
 * reduced motion these components render their children outright with no
 * animation attached at all, so content can never be left invisible.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1];

/** Fade + rise. The default entrance for a card, row, or section. */
export const riseVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Parent that walks its children in, 60ms apart (the --motion-stagger token). */
export const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/**
 * Shared hover/press feel for anything clickable that is bigger than a button
 * — cards, list rows, table rows. Spread onto a motion element.
 */
export const interactiveMotion = {
  whileHover: { y: -2, transition: { duration: 0.18, ease: EASE_OUT } },
  whileTap: { y: 0, scale: 0.995, transition: { duration: 0.1 } },
};

/**
 * Lets a <Stagger> tell its <StaggerItem> children to fall back to plain divs,
 * so a reduced-motion page never mounts orphaned variant children that would
 * sit at `hidden` forever with no parent to drive them.
 */
const StaggerContext = createContext(false);

/**
 * Walks its children in one after another on mount.
 *
 * @param {{ children: React.ReactNode, className?: string, as?: string }} props
 */
export function Stagger({ children, className, as = 'div' }) {
  const prefersReduced = useReducedMotion();
  const Component = motion[as] ?? motion.div;

  if (prefersReduced) {
    const Plain = as;
    return (
      <StaggerContext.Provider value>
        <Plain className={className}>{children}</Plain>
      </StaggerContext.Provider>
    );
  }

  return (
    <StaggerContext.Provider value={false}>
      <Component
        className={className}
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </Component>
    </StaggerContext.Provider>
  );
}

/**
 * One step of a <Stagger>. Also usable standalone, where it simply rises in on
 * mount after an optional index-based delay.
 *
 * @param {{ children: React.ReactNode, className?: string, index?: number, as?: string }} props
 */
export function StaggerItem({ children, className, index, as = 'div', ...rest }) {
  const prefersReduced = useReducedMotion();
  const insideStagger = useContext(StaggerContext);
  const Component = motion[as] ?? motion.div;

  // `rest` has to reach the element: sections passed through here carry the
  // `id` that the on-page outline links point at, and swallowing it silently
  // breaks every anchor on the page.
  if (prefersReduced) {
    const Plain = as;
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    );
  }

  // Inside a <Stagger> the parent drives the timing; standalone, the item runs
  // itself off `index` so a page can reveal a handful of sections without
  // wrapping them all in a common parent.
  if (insideStagger || index == null) {
    return (
      <Component className={className} variants={riseVariants} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={className}
      initial="hidden"
      animate="visible"
      variants={riseVariants}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: index * 0.06 }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * The route-level transition. Deliberately smaller and faster than a card
 * reveal (6px / 260ms): a whole-page slide on every navigation reads as
 * sluggish, and the sidebar staying put is what makes it feel like an app.
 *
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export function PageTransition({ children, className }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
