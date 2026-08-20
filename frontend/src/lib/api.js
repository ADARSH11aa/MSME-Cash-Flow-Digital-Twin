/**
 * Thin transport wrapper. Every screen calls the mock modules through this, so
 * swapping to a real backend later means changing this file only — the call
 * sites and data shapes stay as they are.
 */

/** Simulated round-trip, so loading states are real rather than theoretical. */
const DEFAULT_LATENCY = 260;

/**
 * @template T
 * @param {() => T} produce
 * @param {{ latency?: number }} [options]
 * @returns {Promise<T>}
 */
export function mockRequest(produce, options = {}) {
  const { latency = DEFAULT_LATENCY } = options;
  return new Promise((resolve) => {
    setTimeout(() => resolve(produce()), latency);
  });
}

/**
 * Placeholder for the eventual HTTP client.
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function request(path, init) {
  const response = await fetch(path, init);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}
