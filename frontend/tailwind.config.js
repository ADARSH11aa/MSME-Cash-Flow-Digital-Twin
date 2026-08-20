import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */

/*
 * CashTwin Tailwind config — PRD Section 2.
 *
 * Every color/font/size below resolves to a CSS custom property declared in
 * src/styles/tokens.css. Tailwind is the ergonomic surface; tokens.css is the
 * source of truth.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Canvas
        void: 'var(--bg-void)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          2: 'var(--bg-surface-2)',
        },
        light: {
          DEFAULT: 'var(--bg-light)',
          card: 'var(--bg-light-card)',
        },
        // The one high-contrast ground in a light-on-cream product: used for
        // the single "read this" card on a screen, never for a whole surface.
        navy: {
          DEFAULT: 'var(--bg-navy)',
          surface: 'var(--bg-navy-surface)',
        },

        // Accent + risk semantics
        lime: {
          DEFAULT: 'var(--accent-lime)',
          dim: 'var(--accent-lime-dim)',
          ink: 'var(--accent-lime-ink)',
          8: 'var(--accent-lime-8)',
          16: 'var(--accent-lime-16)',
        },
        risk: {
          DEFAULT: 'var(--risk-red)',
          ink: 'var(--risk-red-ink)',
          8: 'var(--risk-red-8)',
          16: 'var(--risk-red-16)',
        },
        caution: {
          DEFAULT: 'var(--risk-amber)',
          ink: 'var(--risk-amber-ink)',
          8: 'var(--risk-amber-8)',
          16: 'var(--risk-amber-16)',
        },
        info: {
          DEFAULT: 'var(--info-blue)',
          8: 'var(--info-blue-8)',
          16: 'var(--info-blue-16)',
        },
        cyan: {
          DEFAULT: 'var(--accent-cyan)',
          8: 'var(--accent-cyan-8)',
          16: 'var(--accent-cyan-16)',
        },

        // Text
        ink: {
          hi: 'var(--text-onLight-hi)',
          lo: 'var(--text-onLight-lo)',
        },
        chalk: {
          hi: 'var(--text-onDark-hi)',
          lo: 'var(--text-onDark-lo)',
        },

        // Borders
        edge: {
          dark: 'var(--border-onDark)',
          light: 'var(--border-onLight)',
        },

        // Data viz
        viz: {
          optimistic: 'var(--viz-optimistic)',
          expected: 'var(--viz-expected)',
          pessimistic: 'var(--viz-pessimistic)',
          grid: 'var(--viz-grid)',
        },
      },

      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },

      /* Type scale — PRD Section 2.2 table.
         [size, { lineHeight, letterSpacing, fontWeight }] */
      fontSize: {
        'display-xl': ['56px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['40px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['28px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-md': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-md': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-xs': ['11px', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '600' }],
      },

      borderRadius: {
        // The reference frames were near-square, but the shell (sidebar nav,
        // avatar, toggle) had already settled at 8px and the two languages read
        // as two products. One scale now: controls 8px, cards a step softer.
        card: '10px',
        control: '8px',
      },

      boxShadow: {
        card: 'var(--shadow-card-rest)',
        'card-hover': 'var(--shadow-card-hover)',
        // Retained: the previous names are still referenced across the app and
        // both resolved to the same value anyway.
        'card-dark': 'var(--shadow-card-hover-dark)',
        'card-light': 'var(--shadow-card-hover-light)',
      },

      transitionTimingFunction: {
        out: 'var(--ease-out)',
        spring: 'var(--ease-spring)',
      },

      transitionDuration: {
        hover: 'var(--motion-hover-duration)',
      },

      keyframes: {
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },

      animation: {
        // Duration/stagger read from tokens so reduced-motion collapses them.
        'reveal-up': 'reveal-up var(--motion-reveal-duration) var(--ease-out) both',
        'fade-in': 'fade-in var(--motion-reveal-duration) var(--ease-out) both',
      },
    },
  },
  plugins: [
    // Small utility plugin: tabular numerals + the bracket-corner motif from
    // the reference frames, both used often enough to deserve a utility.
    function ({ addUtilities }) {
      addUtilities({
        '.tabular': { 'font-variant-numeric': 'tabular-nums' },
        '.focus-ring': {
          outline: 'var(--focus-ring-width) solid var(--focus-ring)',
          'outline-offset': 'var(--focus-ring-offset)',
        },
      });
    },
    animate,
  ],
};
