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

/** The backend gateway in backend/app/main.py — see its module docstring for how to run it. */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:9000';

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function request(path, init) {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    // FastAPI's HTTPException body is {"detail": "..."} — surface that
    // instead of just the status code, since e.g. an upload's "missing
    // required columns" message is the whole point of the error.
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed: ${response.status}`);
  }
  return response.json();
}
