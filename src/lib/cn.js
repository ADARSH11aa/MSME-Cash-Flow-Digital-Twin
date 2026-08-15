import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names, with later Tailwind utilities winning over
 * earlier conflicting ones. Used by every shared component to accept a
 * `className` override without fighting its own base classes.
 *
 * @param {...(string|false|null|undefined|Record<string, boolean>)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
