import { useCallback, useEffect, useState } from 'react';
import { getConsent, updateConsent } from '@/mocks/api/consent';

/**
 * Consent state shared by onboarding (PRD 3.2) and settings (PRD 3.8).
 *
 * Updates are optimistic — the switch moves immediately and reconciles with
 * the stored state — because a privacy control that lags feels broken.
 *
 * @returns {{ consent: object|null, loading: boolean, setScope: (key: string, value: boolean) => Promise<void> }}
 */
export default function useConsent() {
  const [consent, setConsent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getConsent().then((state) => {
      if (!cancelled) {
        setConsent(state);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setScope = useCallback(async (key, value) => {
    setConsent((current) => ({ ...current, [key]: value }));
    const next = await updateConsent({ [key]: value });
    setConsent(next);
  }, []);

  return { consent, loading, setScope };
}
