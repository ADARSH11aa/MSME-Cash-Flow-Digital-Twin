/**
 * Approximates Python's round() (round-half-to-even), which JS's
 * Math.round (round-half-up) doesn't replicate. Money/percentage figures
 * here are large enough that the .5-at-exactly-n-decimals edge case this
 * exists for is rare, but matching Python's convention where it does occur
 * is cheaper than explaining the divergence.
 */
export function roundHalfEven(value, decimals = 0) {
  const factor = 10 ** decimals;
  const scaled = value * factor;
  const floor = Math.floor(scaled);
  const diff = scaled - floor;

  if (Math.abs(diff - 0.5) < 1e-9) {
    const rounded = floor % 2 === 0 ? floor : floor + 1;
    return rounded / factor;
  }
  return Math.round(scaled) / factor;
}

/** Thousands-separated integer string matching Python's f"{value:,.0f}"
 * (plain 3-digit Western grouping) - deliberately NOT toLocaleString('en-IN'),
 * which groups in lakhs/crores instead. */
export function formatThousands(value) {
  const rounded = Math.round(value);
  return rounded.toLocaleString('en-US');
}
