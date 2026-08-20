import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import EyebrowLabel from '@/components/shared/EyebrowLabel';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-void py-16 px-5 md:px-8 text-chalk-hi">
      <div className="mx-auto max-w-4xl space-y-10">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-body-sm text-chalk-lo hover:text-lime transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to CashTwin
          </Link>
          <EyebrowLabel filled>Data Protection &amp; DPDP Act 2023</EyebrowLabel>
          <h1 className="mt-4 font-display text-display-lg text-chalk-hi">Privacy Policy</h1>
          <p className="mt-2 font-display text-lg text-lime">
            Consent-First Data Architecture for Indian MSMEs
          </p>
          <p className="mt-1 text-body-sm text-chalk-lo">
            Last updated: 16 August 2026
          </p>
        </div>

        {/* Commitment box */}
        <div className="rounded-xl border border-lime/30 bg-lime/10 p-5 text-body-sm text-chalk-hi flex items-start gap-3.5">
          <ShieldCheck className="h-5 w-5 text-lime shrink-0 mt-0.5" />
          <div className="space-y-1 text-body-sm leading-relaxed">
            <p className="font-semibold text-lime">Zero Third-Party Data Sharing by Default</p>
            <p className="text-chalk-lo">
              CashTwin treats your financial data with fiduciary responsibility. We never sell, monetize, or share your cash flow, customer lists, or tax records with lenders, brokers, or credit bureaus without explicit, itemized opt-in consent.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-chalk-hi/90 leading-relaxed border-t border-edge-dark pt-8">
          <section className="space-y-3">
            <h2 className="font-display text-heading-sm text-chalk-hi">1. Information We Collect</h2>
            <p className="text-body-sm text-chalk-lo">
              We collect information strictly necessary to provide cash-flow forecasting and digital twin simulations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-body-sm text-chalk-lo">
              <li><strong className="text-chalk-hi">Account Details:</strong> Business name, owner name, authorized email address, mobile number, and GSTIN/Udyam identifiers.</li>
              <li><strong className="text-chalk-hi">Financial Ingestion:</strong> Invoices (B2B buyer, amount, due date), historical payment records, and recurring operating expense schedules.</li>
              <li><strong className="text-chalk-hi">Digital Footprint:</strong> Consent preferences, login timestamps, and immutable audit logs of data modifications.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-heading-sm text-chalk-hi">2. How Your Data Is Used</h2>
            <p className="text-body-sm text-chalk-lo">Your financial data is processed solely for:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-body-sm text-chalk-lo">
              <li>Predicting rolling 90-day cash positions and days-to-liquidity-breach</li>
              <li>Analysing counterparty payment behaviour and identifying delayed receivables</li>
              <li>Simulating user-initiated &lsquo;What-if&rsquo; scenarios (e.g. buyer default or delayed payments)</li>
              <li>Recommending non-debt operational recovery options</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-heading-sm text-chalk-hi">3. Dynamic Consent &amp; Revocation (DPDP Act 2023)</h2>
            <p className="text-body-sm text-chalk-lo">
              In full accordance with India&apos;s Digital Personal Data Protection (DPDP) Act 2023, you retain sovereign control over your information:
            </p>
            <div className="rounded-lg border border-edge-dark bg-surface p-4 space-y-2 text-body-sm text-chalk-lo">
              <ul className="list-disc pl-5 space-y-1.5 text-chalk-lo">
                <li><strong className="text-chalk-hi">Granular Toggle Controls:</strong> Enable or disable specific data access categories in your Settings.</li>
                <li><strong className="text-chalk-hi">Instant Effect:</strong> Revoking access instantly halts processing for that data stream.</li>
                <li><strong className="text-chalk-hi">Immutable Audit Trail:</strong> Every consent change and access attempt is logged with timestamp verification.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-heading-sm text-chalk-hi">4. Data Security &amp; Encryption</h2>
            <p className="text-body-sm text-chalk-lo">
              We employ AES-256 encryption at rest and TLS 1.3 encryption in transit for all financial payloads. Strict access controls ensure that only authorized computational services can access encrypted tokens during forecast recalculations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-heading-sm text-chalk-hi">5. Right to Erasure</h2>
            <p className="text-body-sm text-chalk-lo">
              You may request complete erasure of your business data, uploaded invoice documents, and account records at any time by emailing{' '}
              <a href="mailto:privacy@cashtwin.in" className="text-lime underline underline-offset-2 hover:text-chalk-hi">
                privacy@cashtwin.in
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-heading-sm text-chalk-hi">6. Contact Our Grievance Officer</h2>
            <p className="text-body-sm text-chalk-lo">
              For any privacy inquiries, consent audits, or DPDP Act grievance redressal:
            </p>
            <p className="text-body-sm text-chalk-hi font-medium">
              Data Protection &amp; Grievance Officer<br />
              Email: <a href="mailto:grievance@cashtwin.in" className="text-lime underline underline-offset-2">grievance@cashtwin.in</a><br />
              Address: CashTwin Technologies, Mumbai, Maharashtra, India
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
