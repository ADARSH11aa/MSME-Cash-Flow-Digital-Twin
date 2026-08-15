import { createBrowserRouter } from 'react-router-dom';
import AppShell from '@/layouts/AppShell';
import MarketingLayout from '@/layouts/MarketingLayout';
import LandingPage from '@/features/landing/LandingPage';
import OnboardingFlow from '@/features/onboarding/OnboardingFlow';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ScenarioSimulatorPage from '@/features/scenarios/ScenarioSimulatorPage';
import RecommendationsPage from '@/features/recommendations/RecommendationsPage';
import ExplainabilityPage from '@/features/explainability/ExplainabilityPage';
import InvoiceReviewPage from '@/features/invoices/InvoiceReviewPage';
import SettingsLayout from '@/features/settings/SettingsLayout';
import PrivacyConsentPage from '@/features/settings/PrivacyConsentPage';
import AuditLogPage from '@/features/settings/AuditLogPage';

/**
 * Route table. Marketing and onboarding sit outside the authenticated shell;
 * everything under /app gets the icon rail and the lineage drawer.
 */
export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [{ path: '/', element: <LandingPage /> }],
  },
  { path: '/onboarding', element: <OnboardingFlow /> },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'scenarios', element: <ScenarioSimulatorPage /> },
      { path: 'recommendations', element: <RecommendationsPage /> },
      { path: 'explainability', element: <ExplainabilityPage /> },
      { path: 'invoices', element: <InvoiceReviewPage /> },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <PrivacyConsentPage /> },
          { path: 'audit', element: <AuditLogPage /> },
        ],
      },
    ],
  },
]);

export default router;
