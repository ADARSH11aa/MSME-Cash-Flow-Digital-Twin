import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Minimal data-fetching hook over the mock API.
 *
 * React Query would be the right choice against a real backend, but the mock
 * layer has no cache-invalidation or retry story to justify it yet; this keeps
 * the call sites identical to a `useQuery` shape so swapping later is a local
 * change.
 *
 * @template T
 * @param {() => Promise<T>} fetcher
 * @param {Array<unknown>} deps
 * @returns {{ data: T|null, loading: boolean, error: Error|null, refetch: () => void }}
 */
export default function useAsync(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { ...state, refetch: run };
}
