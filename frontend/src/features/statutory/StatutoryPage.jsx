import { AlertTriangle, CalendarClock, Scale } from 'lucide-react';
import Card from '@/components/shared/Card';
import DataTable from '@/components/shared/DataTable';
import EmptyState from '@/components/shared/EmptyState';
import Figure from '@/components/shared/Figure';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import Pill from '@/components/shared/Pill';
import { StaggerItem } from '@/components/shared/motion';
import useAsync from '@/hooks/useAsync';
import { formatCurrency, formatDateLong } from '@/lib/format';
import { getStatutoryExposure } from '@/mocks/api/dashboard';

/**
 * MSMED Act 2006 position (Sections 2(n), 15, 16, 18) — the one screen in the
 * product about entitlement rather than forecast.
 *
 * It is deliberately not part of the Dashboard's forecast story: everything
 * here is money the law already grants, not cash any customer has agreed to
 * pay, and mixing the two would invite an owner to bank on it. The Dashboard
 * carries only a link to this page.
 *
 * Buyers, not invoices, are the primary table: an MSEFC reference under
 * Section 18 is filed against a buyer, so "which buyer" is the decision this
 * page exists to support.
 */
export default function StatutoryPage() {
  const { data: exposure, loading } = useAsync(() => getStatutoryExposure(), []);

  if (loading && !exposure) return <StatutorySkeleton />;
  if (!exposure) return null;

  const {
    eligibility,
    totals,
    contingent,
    limitation,
    taxLeverage,
    statutoryTermDays,
    interestRateAnnualPct,
    customers,
    historical,
  } = exposure;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="MSMED Act 2006"
        title="Your legal position"
        subtitle={
          eligibility.isSupplier
            ? `The Act caps an enforceable payment term at ${statutoryTermDays} days, whatever the invoice says. Past that date a buyer owes interest at ${interestRateAnnualPct}% a year, compounded monthly, without you having to ask for it.`
            : 'Whether the Act’s payment protections reach your business at all, and why.'
        }
      />

      {/* Section 2(n): a medium enterprise is not a "supplier" and has no
          claim at all. Saying so is more useful than hiding the page — an
          owner who has heard of the 45-day rule needs to know why it does not
          reach them. */}
      {!eligibility.isSupplier ? (
        <StaggerItem>
          <Card padding="lg">
            <h2 className="font-display text-heading-md text-chalk-hi">
              The Act&rsquo;s payment protections do not cover you
            </h2>
            <p className="mt-2 max-w-2xl text-body-sm text-chalk-lo">{eligibility.basis}</p>
            <Footnote />
          </Card>
        </StaggerItem>
      ) : totals.invoicesPastStatutoryDue === 0 ? (
        <>
          <StaggerItem>
            <EmptyState
              title="Nothing is past its statutory due date"
              body={`Every open invoice is still inside the ${statutoryTermDays}-day window the Act allows a buyer, so no statutory interest has started accruing.`}
            />
          </StaggerItem>
          <HistoricalPanel historical={historical} />
        </>
      ) : (
        <>
          <StaggerItem as="section">
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                label="Statutory interest accrued"
                value={
                  <Figure
                    value={totals.interestOwed}
                    variant="currencyShort"
                    label="Statutory interest accrued"
                  />
                }
                caption={`On ${formatCurrency(totals.principalPastStatutoryDue)} of overdue principal`}
              />
              <Metric
                label="Buyers you can refer"
                value={totals.msefcEligibleCustomers}
                caption={`Across ${totals.invoicesPastStatutoryDue} open invoices past their statutory due date`}
              />
              <Metric
                label="Terms beyond the cap"
                value={totals.invoicesWithTermBeyondCap}
                caption={`Open invoices written longer than ${statutoryTermDays} days — unenforceable past it`}
              />
              <Metric
                label="Interest already forfeited"
                value={
                  historical ? (
                    <Figure
                      value={historical.interestForfeited}
                      variant="currencyShort"
                      label="Interest already forfeited"
                    />
                  ) : (
                    '—'
                  )
                }
                caption={
                  historical
                    ? `Never claimed on ${historical.invoiceCount.toLocaleString('en-IN')} invoices since paid late`
                    : 'No settled invoices were paid late'
                }
              />
            </dl>
          </StaggerItem>

          <TaxLeveragePanel taxLeverage={taxLeverage} />
          <ExpiryPanel limitation={limitation} />

          <StaggerItem as="section" className="space-y-3">
            <h2 className="font-display text-heading-md text-chalk-hi">Claims by buyer</h2>
            <p className="max-w-2xl text-body-sm text-chalk-lo">
              A reference to the Micro and Small Enterprise Facilitation Council is filed against a
              buyer, not an invoice — so this is the list to act from.
            </p>
            <DataTable
              caption="Statutory interest owed, by buyer"
              rows={customers}
              columns={[
                {
                  key: 'name',
                  header: 'Buyer',
                  sortable: true,
                  render: (row) => (
                    <span className="flex flex-wrap items-center gap-2">
                      {row.name}
                      {row.anyTermBeyondCap ? <Pill status="low">Term beyond cap</Pill> : null}
                    </span>
                  ),
                },
                { key: 'invoiceCount', header: 'Invoices', sortable: true, align: 'right' },
                {
                  key: 'principal',
                  header: 'Outstanding',
                  sortable: true,
                  align: 'right',
                  render: (row) => (
                    <span data-numeric className="tabular">
                      {formatCurrency(row.principal)}
                    </span>
                  ),
                },
                {
                  key: 'maxDaysPastStatutoryDue',
                  header: 'Worst delay',
                  sortable: true,
                  align: 'right',
                  render: (row) => (
                    <span data-numeric className="tabular">
                      {row.maxDaysPastStatutoryDue} days
                    </span>
                  ),
                },
                {
                  key: 'soonestClaimExpiryDays',
                  header: 'Claim expires in',
                  sortable: true,
                  align: 'right',
                  render: (row) => (
                    <span
                      data-numeric
                      className={row.soonestClaimExpiryDays <= 180 ? 'tabular text-risk-ink' : 'tabular'}
                    >
                      {row.soonestClaimExpiryDays} days
                    </span>
                  ),
                },
                {
                  key: 'interestOwed',
                  header: 'Interest owed',
                  sortable: true,
                  align: 'right',
                  render: (row) => (
                    <span data-numeric className="tabular font-semibold text-caution-ink">
                      {formatCurrency(row.interestOwed)}
                    </span>
                  ),
                },
              ]}
            />
          </StaggerItem>

          <ContingentPanel contingent={contingent} />
          <HistoricalPanel historical={historical} />

          <StaggerItem as="section">
            <Card padding="lg">
              <Footnote />
            </Card>
          </StaggerItem>
        </>
      )}
    </PageContainer>
  );
}

/**
 * Section 43B(h) of the Income Tax Act — the buyer cannot deduct the expense
 * until it actually pays. Given its own panel because it is the one lever
 * here with a hard external deadline, and the deadline is what makes it work.
 */
function TaxLeveragePanel({ taxLeverage }) {
  if (!taxLeverage || taxLeverage.principalAtStake <= 0) return null;

  return (
    <StaggerItem as="section">
      <Card padding="lg" className="border-lime/30 bg-lime-8">
        <p className="flex items-start gap-2.5 text-body-md text-chalk-hi">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
          <span>
            Your buyers cannot claim{' '}
            <span data-numeric className="tabular font-semibold">
              {formatCurrency(taxLeverage.principalAtStake)}
            </span>{' '}
            of these bills as a tax deduction until they actually pay you — and they have{' '}
            <span data-numeric className="tabular font-semibold text-lime-ink">
              {taxLeverage.daysUntilFiscalYearEnd} days
            </span>{' '}
            until {formatDateLong(taxLeverage.fiscalYearEndsOn)}.
          </span>
        </p>
        <p className="mt-2 pl-7 text-body-sm text-chalk-lo">
          Section 43B(h) of the Income Tax Act. For a buyer weighing whether to pay you, losing the
          deduction usually costs more than the interest does — which makes this the more persuasive
          thing to put in the reminder.
        </p>
      </Card>
    </StaggerItem>
  );
}

/** Claims run out at three years, and the largest ones are the oldest. */
function ExpiryPanel({ limitation }) {
  if (!limitation || limitation.expiringSoonCount === 0) return null;

  return (
    <StaggerItem as="section">
      <Card padding="lg" className="border-risk/30 bg-risk-8">
        <p className="flex items-start gap-2.5 text-body-md text-chalk-hi">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-risk" aria-hidden="true" />
          <span>
            <span data-numeric className="tabular font-semibold">
              {limitation.expiringSoonCount}
            </span>{' '}
            claim{limitation.expiringSoonCount === 1 ? '' : 's'} worth{' '}
            <span data-numeric className="tabular font-semibold text-risk-ink">
              {formatCurrency(limitation.expiringSoonInterest)}
            </span>{' '}
            become time-barred within {limitation.warningWindowDays} days.
            {limitation.soonest ? (
              <>
                {' '}
                The soonest is {limitation.soonest.id} ({limitation.soonest.customer}), which
                expires {formatDateLong(limitation.soonest.expiresOn)} —{' '}
                <span data-numeric className="tabular">
                  {limitation.soonest.daysLeft} days
                </span>{' '}
                from today.
              </>
            ) : null}
          </span>
        </p>
        <p className="mt-2 pl-7 text-body-sm text-chalk-lo">
          A money claim is time-barred after {limitation.years} years, counted from the day the
          payment became statutorily overdue. Your oldest claims are also your largest.
        </p>
      </Card>
    </StaggerItem>
  );
}

/**
 * Interest riding on disputed invoices. Held out of the headline because
 * Section 15's clock starts at acceptance or deemed acceptance, and a dispute
 * is precisely an objection to acceptance — so the entitlement stands or
 * falls with the dispute, and quoting it as owed would overstate the claim.
 */
function ContingentPanel({ contingent }) {
  if (!contingent || contingent.invoiceCount === 0) return null;

  return (
    <StaggerItem as="section">
      <Card padding="lg">
        <h2 className="font-display text-heading-md text-chalk-hi">Contingent on disputes</h2>
        <p className="mt-2 max-w-2xl text-body-md text-chalk-hi">
          A further{' '}
          <span data-numeric className="tabular font-semibold">
            {formatCurrency(contingent.interestOwed)}
          </span>{' '}
          would be owed on {contingent.invoiceCount} disputed invoice
          {contingent.invoiceCount === 1 ? '' : 's'} worth {formatCurrency(contingent.principal)} —
          but only if those disputes resolve your way.
        </p>
        <p className="mt-2 max-w-2xl text-body-sm text-chalk-lo">
          The Act&rsquo;s clock starts at acceptance, and a dispute is an objection to acceptance,
          so this is contingent rather than owed. It is excluded from the figures above
          deliberately. Referring the dispute to the MSEFC is how it gets settled either way.
        </p>
      </Card>
    </StaggerItem>
  );
}

/**
 * Interest on invoices that were eventually paid, but paid late. The
 * entitlement arose the day they went past the statutory date and was never
 * claimed — so this is the cost of not having known the rule, which is
 * usually the number that makes an owner act on the ones still open.
 */
function HistoricalPanel({ historical }) {
  if (!historical || historical.invoiceCount === 0) return null;

  return (
    <StaggerItem as="section">
      <Card padding="lg">
        <h2 className="font-display text-heading-md text-chalk-hi">What you have already given away</h2>
        <p className="mt-2 max-w-2xl text-body-md text-chalk-hi">
          <span data-numeric className="tabular font-semibold text-caution-ink">
            {formatCurrency(historical.interestForfeited)}
          </span>{' '}
          accrued on {historical.invoiceCount.toLocaleString('en-IN')} invoices you have since been
          paid for, but which were settled after their statutory due date.
        </p>
        <p className="mt-2 max-w-2xl text-body-sm text-chalk-lo">
          That entitlement was never invoiced, and claims older than {historical.limitationYears}{' '}
          years are already time-barred. Counted separately because it is money forfeited, not money
          still outstanding.
        </p>
      </Card>
    </StaggerItem>
  );
}

function Footnote() {
  return (
    <p className="flex items-start gap-2 text-body-sm text-chalk-lo">
      <Scale className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      Sections 2(n), 15, 16 and 18 of the MSMED Act 2006, and Section 43B(h) of the Income Tax Act.
      The Act runs its clock from acceptance of the goods, which your invoices do not record — issue
      date is used in its place, so a delay measured here can differ from one measured from
      delivery. Interest is computed, not claimed or collected — CashTwin does not act on your
      behalf.
    </p>
  );
}

function Metric({ label, value, caption }) {
  return (
    <div className="min-w-0 rounded-card border border-edge-dark bg-surface p-5 shadow-card">
      <dt className="text-label-xs uppercase text-chalk-lo">{label}</dt>
      <dd data-numeric className="mt-2 tabular font-display text-display-md text-chalk-hi">
        {value}
      </dd>
      <p className="mt-1.5 text-body-sm text-chalk-lo">{caption}</p>
    </div>
  );
}

function StatutorySkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1440px] space-y-8 px-5 py-8 md:px-8"
      aria-busy="true"
      aria-label="Loading your statutory position"
    >
      <div className="h-16 w-72 animate-pulse rounded-card bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-card border border-edge-dark bg-surface" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-card border border-edge-dark bg-surface" />
    </div>
  );
}
