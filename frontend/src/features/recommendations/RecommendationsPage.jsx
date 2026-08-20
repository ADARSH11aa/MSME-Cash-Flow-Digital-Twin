import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/shared/DataTable';
import DisclaimerBar from '@/components/shared/DisclaimerBar';
import Figure from '@/components/shared/Figure';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import Pill from '@/components/shared/Pill';
import RecommendationCard from '@/components/shared/RecommendationCard';
import { Stagger, StaggerItem } from '@/components/shared/motion';
import useAsync from '@/hooks/useAsync';
import { getRecommendations } from '@/mocks/api/recommendations';

/**
 * Recommendation engine (PRD 3.6) — recovery strategies as comparable
 * "plans", ordered non-debt first, with the cheapest non-debt option taking
 * the elevated middle slot.
 */
export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { data: recommendations, loading } = useAsync(() => getRecommendations(), []);

  const simulate = (rec) => navigate(`/app/scenarios?apply=${rec.id}`);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Recovery options"
        title="Your cheapest ways out, in order"
        subtitle="Actions that cost nothing come first. Financing is shown last, and only so you can compare it — not because we think you should take it."
      />

      {/* Escalated to a banner here rather than only the footer: this is the
          screen where an owner is closest to acting (PRD 3.6). */}
      <DisclaimerBar variant="banner" />

      {loading || !recommendations ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-card border border-edge-dark bg-surface"
            />
          ))}
        </div>
      ) : (
        <>
          <Stagger className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((rec) => (
              <StaggerItem key={rec.id} className="flex">
                <RecommendationCard recommendation={rec} onSimulate={simulate} />
              </StaggerItem>
            ))}
          </Stagger>

          <StaggerItem as="section" index={4} className="space-y-3">
            <h2 className="font-display text-heading-md text-chalk-hi">Compare side by side</h2>
            <DataTable
              caption="Recovery strategies compared"
              rows={recommendations}
              columns={[
                { key: 'strategy', header: 'Strategy', sortable: true },
                {
                  key: 'illustrativeCost',
                  header: 'Cost',
                  sortable: true,
                  align: 'right',
                  render: (row) =>
                    row.illustrativeCost === 0 ? (
                      <span data-numeric className="tabular font-medium text-lime-ink">
                        ₹0
                      </span>
                    ) : (
                      <Figure value={row.illustrativeCost} variant="currency" />
                    ),
                },
                {
                  key: 'recoveryTimeDays',
                  header: 'Recovery time',
                  sortable: true,
                  align: 'right',
                  render: (row) => (
                    <span data-numeric className="tabular">
                      {row.recoveryTimeDays} days
                    </span>
                  ),
                },
                { key: 'liquidityImpact', header: 'Liquidity impact' },
                {
                  key: 'risk',
                  header: 'Risk',
                  render: (row) => (
                    <span className="flex items-center gap-2">
                      <Pill
                        status={
                          row.category === 'working_capital'
                            ? 'low'
                            : row.category === 'invoice_finance'
                              ? 'medium'
                              : 'high'
                        }
                      >
                        {row.risk.split('—')[0].trim()}
                      </Pill>
                    </span>
                  ),
                },
              ]}
            />
          </StaggerItem>
        </>
      )}
    </PageContainer>
  );
}
