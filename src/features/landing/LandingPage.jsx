import ConsentTiers from './sections/ConsentTiers';
import Hero from './sections/Hero';
import HowItWorks from './sections/HowItWorks';
import ModulesGrid from './sections/ModulesGrid';
import ProblemSection from './sections/ProblemSection';
import ScenarioTeaser from './sections/ScenarioTeaser';
import SectorStrip from './sections/SectorStrip';
import TrustSection from './sections/TrustSection';

/**
 * Marketing landing page (PRD 3.1). Section order follows the PRD, and the
 * dark/light alternation follows PRD 2.1's mapping of canvas to task type —
 * the problem section is the one long-reading block, so it takes the light
 * canvas.
 */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <SectorStrip />
      <ProblemSection />
      <HowItWorks />
      <ScenarioTeaser />
      <ModulesGrid />
      <TrustSection />
      <ConsentTiers />
    </>
  );
}
