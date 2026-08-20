import { createContext, useContext } from 'react';

/**
 * Lets any figure anywhere in the tree request the lineage drawer without
 * threading callbacks down through every screen (PRD 3.7: "clicking any number
 * anywhere in the app opens this same lineage pattern in a right-side drawer").
 *
 * The provider lives in AppShell; <Figure /> is the only expected consumer.
 *
 * @type {React.Context<{ openLineage: (figureId: string) => void }|null>}
 */
export const LineageContext = createContext(null);

/**
 * @returns {{ openLineage: (figureId: string) => void, available: boolean }}
 */
export default function useLineage() {
  const ctx = useContext(LineageContext);
  // Marketing/onboarding screens render outside the provider — figures there
  // degrade to plain text rather than throwing.
  return {
    openLineage: ctx?.openLineage ?? (() => {}),
    available: Boolean(ctx),
  };
}
