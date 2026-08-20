import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * tailwind-merge has to be taught this project's scales.
 *
 * Out of the box it recognises Tailwind's stock `text-*` values and sorts them
 * into either the font-size group or the text-color group. Every one of our
 * sizes and colors is a custom name it has never seen — `text-display-lg`,
 * `text-chalk-hi` — so it filed both under the same group and treated them as
 * conflicting. The later class won and the earlier one was deleted outright:
 *
 *   cn('font-display text-display-lg', 'text-risk-ink')
 *     -> 'font-display text-risk-ink'      // the size is gone
 *
 * That silently stripped the size off the hero figures, the page titles and
 * every tone-colored number in the app — they fell back to inheriting 15px
 * body text, which is why the big numbers rendered smaller than their own
 * captions. Declaring the two groups explicitly is what keeps a size and a
 * color from cancelling each other out.
 *
 * Anything added to `fontSize` in tailwind.config.js must be added here too.
 */
const FONT_SIZES = [
  'display-xl',
  'display-lg',
  'display-md',
  'heading-md',
  'body-md',
  'body-sm',
  'label-xs',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
      'border-radius': [{ rounded: ['card', 'control'] }],
      shadow: [{ shadow: ['card', 'card-hover', 'card-dark', 'card-light'] }],
    },
  },
});

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
