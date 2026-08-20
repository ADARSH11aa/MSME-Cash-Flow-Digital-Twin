import { ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/shared/Button';
import EyebrowLabel from '@/components/shared/EyebrowLabel';

export default function PrivacyPolicyModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] h-[85vh] flex flex-col !p-0 overflow-hidden rounded-2xl border border-edge-dark bg-surface shadow-2xl">
        {/* Modal Header */}
        <div className="shrink-0 p-6 pb-4 border-b border-edge-dark bg-surface-2/60">
          <EyebrowLabel filled>Data Protection &amp; DPDP Act 2023</EyebrowLabel>
          <DialogTitle className="mt-2 text-xl md:text-2xl font-display font-bold text-chalk-hi">
            Privacy Policy
          </DialogTitle>
          <p className="mt-1 text-xs text-lime font-semibold">
            CashTwin — Consent-Based Cash-Flow Digital Twin
          </p>
          <DialogDescription className="mt-0.5 text-[11px] text-chalk-lo">
            Last updated: 16 August 2026
          </DialogDescription>
        </div>

        {/* Scrollable Privacy Policy Content */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-6 text-body-sm text-chalk-lo scrollbar-thin"
        >
          {/* DPDP Act Legal Advisory Note */}
          <div className="rounded-xl border border-caution/30 bg-caution/10 p-4 text-xs text-caution-lo flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-caution shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-caution font-semibold">Note:</strong> This is a starting template drafted for a hackathon/demo product. Before using this with real users or real financial data, have it reviewed by a qualified lawyer familiar with the Digital Personal Data Protection Act, 2023 (DPDP Act) and any applicable RBI guidance for fintech/data-aggregation tools operating in India.
            </p>
          </div>

          {/* Section 1: Introduction */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">1. Introduction</h3>
            <p>
              This Privacy Policy explains how CashTwin (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, stores, shares, and protects information when you (&ldquo;you&rdquo;, &ldquo;your business&rdquo;) use our platform. CashTwin is built on a consent-first principle: we do not analyse any category of your data unless you have explicitly authorized it, and you may revoke that authorization at any time.
            </p>
            <p>
              This Privacy Policy should be read alongside our Terms and Conditions, which govern your overall use of the Platform.
            </p>
          </section>

          {/* Section 2: What Data We Collect */}
          <section className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">2. What Data We Collect</h3>
            <p>
              We only collect and process data within the categories you have explicitly enabled in your consent settings. These categories may include:
            </p>

            <div className="overflow-x-auto rounded-xl border border-edge-dark bg-surface-2/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-edge-dark bg-surface-2 text-chalk-hi">
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">What it includes</th>
                    <th className="p-3 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge-dark/60 text-chalk-lo">
                  <tr>
                    <td className="p-3 font-medium text-chalk-hi align-top">Invoice data</td>
                    <td className="p-3 align-top">Invoice numbers, amounts, due dates, customer names, uploaded documents/images</td>
                    <td className="p-3 align-top">To extract structured invoice information and calculate expected inflows</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-chalk-hi align-top">Payment history</td>
                    <td className="p-3 align-top">Actual payment dates, delays relative to due dates, partial payment records</td>
                    <td className="p-3 align-top">To learn real payment behaviour per customer, rather than relying on stated terms</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-chalk-hi align-top">Forecasting inputs</td>
                    <td className="p-3 align-top">Opening cash balance, recurring expenses, minimum buffer thresholds</td>
                    <td className="p-3 align-top">To project your cash position forward and flag potential shortfalls</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-chalk-hi align-top">Account information</td>
                    <td className="p-3 align-top">Name, business name, email, phone number, login credentials</td>
                    <td className="p-3 align-top">To create and secure your account</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs">
              We do not collect or access any data category you have not explicitly enabled, and nothing is analysed prior to your consent.
            </p>
          </section>

          {/* Section 3: How We Use Your Data */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">3. How We Use Your Data</h3>
            <p>We use collected data solely to:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Generate cash-flow forecasts and liquidity projections</li>
              <li>Analyse payment behaviour patterns specific to your business</li>
              <li>Detect unusual transactions or volatility (anomaly detection)</li>
              <li>Extract and structure data from uploaded invoices/documents (OCR)</li>
              <li>Rank non-debt recovery options based on your own data</li>
              <li>Explain the reasoning behind a given forecast or risk flag</li>
              <li>Maintain the security and integrity of your account</li>
              <li>Communicate with you about your account or material changes to our services</li>
            </ul>
            <p className="text-xs font-medium text-chalk-hi pt-1">
              We do not use your data to make, approve, or influence any lending decision. CashTwin is a decision-support tool, not a lender or credit intermediary.
            </p>
          </section>

          {/* Section 4: Consent and Your Controls */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">4. Consent and Your Controls</h3>
            <p>
              You control what CashTwin may access at all times through your account settings. Available controls include:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Allow invoice analysis — on/off</li>
              <li>Allow payment-history analysis — on/off</li>
              <li>Allow forecasting — on/off</li>
              <li>Share financial data with lenders/advisors — off by default; requires explicit opt-in</li>
            </ul>
            <p className="text-xs">
              Every change you make to these settings takes effect immediately and is recorded in your audit log, which you can review at any time from your account settings.
            </p>
          </section>

          {/* Section 5: How We Share Your Data */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">5. How We Share Your Data</h3>
            <p className="font-medium text-lime">We do not sell your data to any third party.</p>
            <p>We share your data only in the following circumstances:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li><strong className="text-chalk-hi">With your explicit consent:</strong> For example, if you choose to share a read-only summary with a lender or advisor via the &ldquo;Share financial data with lenders&rdquo; setting</li>
              <li><strong className="text-chalk-hi">With service providers:</strong> Who help us operate the Platform (e.g. cloud hosting, OCR processing), under contractual obligations to protect your data and use it only for the purpose we specify</li>
              <li><strong className="text-chalk-hi">When required by law:</strong> If we are legally compelled to disclose information by a court order, regulation, or government request</li>
            </ul>
            <p className="text-xs">
              Any third-party sharing beyond what you&apos;ve explicitly authorized will never happen without asking you first.
            </p>
          </section>

          {/* Section 6: Data Accuracy and Correction */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">6. Data Accuracy and Correction</h3>
            <p>
              Where we use automated extraction (OCR) to read data from your uploaded documents, we assign a confidence score to each extracted field and flag low-confidence values for your review. You may correct any extracted or entered value at any time; corrections take effect immediately and any downstream forecasts are recalculated accordingly.
            </p>
          </section>

          {/* Section 7: Data Retention */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">7. Data Retention</h3>
            <p>
              We retain your data for as long as your account remains active, or as needed to provide the Platform&apos;s services. If you delete your account or revoke consent for a data category, we will stop processing that category going forward. You may request full deletion of your data by contacting us (see Section 11) or through your account settings, subject to any legal retention requirements we may be obligated to follow.
            </p>
          </section>

          {/* Section 8: Data Security */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">8. Data Security</h3>
            <p>
              We apply reasonable technical and organizational measures to protect your data, including access controls and encryption in transit. However, no system can be guaranteed 100% secure, and we encourage you to use strong, unique credentials for your account and to notify us promptly of any suspected unauthorized access.
            </p>
          </section>

          {/* Section 9: Your Rights */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">9. Your Rights</h3>
            <p>Depending on applicable law (including the DPDP Act, 2023, if you are located in India), you may have the right to:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Withdraw consent for any data category at any time</li>
              <li>Request deletion of your data</li>
              <li>Receive a copy of your audit log</li>
              <li>Lodge a complaint with a relevant data protection authority</li>
            </ul>
            <p className="text-xs">
              To exercise any of these rights, contact us at <a href="mailto:privacy@cashtwin.in" className="text-lime underline hover:text-chalk-hi">privacy@cashtwin.in</a>.
            </p>
          </section>

          {/* Section 10: Changes to This Policy */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-chalk-hi">10. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated to you through the Platform or via your registered contact details. Continued use of the Platform after changes take effect constitutes acceptance of the revised Policy.
            </p>
          </section>

          <p className="text-[11px] text-chalk-lo/70 pt-2 border-t border-edge-dark/60">
            This document was drafted as a starting template and does not constitute legal advice. Please consult a qualified legal professional — particularly regarding DPDP Act compliance — before publishing this Policy for real users.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-edge-dark bg-surface-2/40 flex justify-end">
          <DialogClose asChild>
            <Button size="sm" className="rounded-lg px-5 font-semibold">
              I Understand &amp; Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
