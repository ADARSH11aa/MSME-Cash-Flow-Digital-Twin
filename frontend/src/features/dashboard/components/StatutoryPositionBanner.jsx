import { ArrowRight, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/shared/Card';
import { StaggerItem } from '@/components/shared/motion';
import { formatCurrency } from '@/lib/format';

/**
 * One line on the Dashboard pointing at the Legal Position page.
 *
 * The full statutory breakdown lives on its own page — this exists only so
 * the headline entitlement stays discoverable from the home screen. An owner
 * who never opens that tab would otherwise never learn the money exists,
 * which is the whole point of computing it.
 *
 * Kept deliberately plain rather than styled as a stat card: statutory
 * interest is an entitlement, not a forecast figure, and it should not read
 * as one more number in the cash-flow story above it.
 */
export default function StatutoryPositionBanner({ exposure }) {
  if (!exposure?.eligibility?.isSupplier) return null;
  const { totals } = exposure;
  if (!totals || totals.interestOwed <= 0) return null;

  return (
    <StaggerItem as="section" index={6}>
      <Card
        as={Link}
        to="/app/statutory"
        interactive
        className="group flex flex-wrap items-center gap-x-4 gap-y-2"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-caution-8 text-caution-ink">
          <Scale className="h-5 w-5" aria-hidden="true" />
        </span>

        <p className="min-w-0 flex-1 text-body-md text-chalk-hi">
          The MSMED Act already entitles you to{' '}
          <span data-numeric className="tabular font-semibold text-caution-ink">
            {formatCurrency(totals.interestOwed)}
          </span>{' '}
          in interest from {totals.msefcEligibleCustomers} buyers.
          <span className="mt-0.5 block text-body-sm text-chalk-lo">
            Never invoiced, and owed automatically — see what you can claim and from whom.
          </span>
        </p>

        <ArrowRight
          className="h-4 w-4 shrink-0 text-chalk-lo transition-transform duration-hover ease-out group-hover:translate-x-1 group-hover:text-chalk-hi"
          aria-hidden="true"
        />
      </Card>
    </StaggerItem>
  );
}
