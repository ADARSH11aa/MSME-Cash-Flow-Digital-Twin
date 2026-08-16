import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import DisclaimerBar from '@/components/shared/DisclaimerBar';
import SmoothScrollProvider from '@/components/shared/SmoothScrollProvider';
import TermsModal from '@/features/legal/TermsModal';
import PrivacyPolicyModal from '@/features/legal/PrivacyPolicyModal';
import { LogoMark } from './AppShell';

/**
 * Marketing shell — sticky dark top nav with pill buttons, 60fps smooth scrolling, and modern footer.
 */

const LINKS = [
  { href: '#how-it-works', label: 'HOW IT WORKS' },
  { href: '#scenarios', label: 'SCENARIOS' },
  { href: '#modules', label: 'CAPABILITIES' },
  { href: '#consent', label: 'CONSENT' },
  { href: '#trust', label: 'TRUST' },
];

export function CashTwinLogo({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <rect x="7" y="2" width="10" height="10" rx="1.5" transform="rotate(45 12 7)" fill="#b6ff3b" />
      <rect
        x="7"
        y="12"
        width="10"
        height="10"
        rx="1.5"
        transform="rotate(45 12 17)"
        stroke="#ffffff"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export default function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-black flex flex-col justify-between">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-lime focus:px-4 focus:py-2 focus:text-label-xs focus:uppercase focus:text-ink-hi"
        >
          Skip to content
        </a>

        {/* Daytona Style Dark Top Navbar with CashTwin Content */}
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-neutral-900/60">
          <nav
            aria-label="Main"
            className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8"
          >
            {/* Left brand & monospace nav links */}
            <div className="flex items-center gap-6 md:gap-7">
              <Link to="/" className="flex items-center gap-3 group">
                <CashTwinLogo className="h-6 w-6 transition-transform group-hover:scale-110 duration-300" />
                <span className="text-[18px] font-bold tracking-tight text-white font-sans">
                  CashTwin
                </span>
              </Link>

              <span className="text-neutral-600 font-mono text-base select-none" aria-hidden="true">
                /
              </span>

              <div className="hidden items-center gap-6 lg:gap-8 md:flex">
                {LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="font-mono text-[12px] font-medium tracking-[0.08em] text-neutral-400 transition-colors hover:text-white uppercase"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/app"
                className="inline-flex items-center justify-center rounded-md bg-lime/10 border border-lime/30 px-4 py-2 text-[13px] font-semibold text-lime shadow-sm transition-all hover:bg-lime hover:text-ink-hi hover:border-lime"
              >
                Sign in
              </Link>

              <Link
                to="/onboarding"
                className="hidden sm:inline-flex items-center justify-center rounded-md bg-lime px-4 py-2 text-[13px] font-bold text-ink-hi shadow-sm transition-all hover:bg-lime-dim"
              >
                Get started
              </Link>

              <button
                type="button"
                className="p-1.5 text-neutral-400 hover:text-white md:hidden"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {/* Mobile menu drawer */}
          {menuOpen ? (
            <div className="border-t border-neutral-900 bg-black px-5 py-4 md:hidden">
              <ul className="space-y-3 font-mono text-xs uppercase">
                {LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block text-neutral-300 hover:text-white py-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li className="pt-2">
                  <Link
                    to="/app"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-md bg-lime/10 border border-lime/30 py-2 text-xs font-semibold text-lime hover:bg-lime hover:text-ink-hi"
                  >
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
          ) : null}
        </header>

        <main id="main" className="flex-1">
          <Outlet />
        </main>

        <Footer
          onOpenTerms={() => setTermsModalOpen(true)}
          onOpenPrivacy={() => setPrivacyModalOpen(true)}
        />
        <TermsModal open={termsModalOpen} onOpenChange={setTermsModalOpen} />
        <PrivacyPolicyModal open={privacyModalOpen} onOpenChange={setPrivacyModalOpen} />
      </div>
    </SmoothScrollProvider>
  );
}

function Footer({ onOpenTerms, onOpenPrivacy }) {
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'How it works', to: '/#how-it-works' },
        { label: 'Scenarios', to: '/#scenarios' },
        { label: 'Capabilities', to: '/#capabilities' },
        { label: 'Trust & Privacy', to: '/#trust' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', to: '/#problem' },
        { label: 'Contact', to: '/contact' },
        { label: 'Onboarding', to: '/onboarding' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms & Conditions', onClick: onOpenTerms },
        { label: 'Privacy Policy', onClick: onOpenPrivacy },
        { label: 'Consent Policy', to: '/app/settings' },
      ],
    },
    {
      title: 'App & Demo',
      links: [
        { label: 'Launch Twin App', to: '/app' },
        { label: 'Invoice Review', to: '/app/invoices' },
        { label: 'Audit Log', to: '/app/settings/audit' },
      ],
    },
  ];

  return (
    <footer className="border-t border-edge-dark bg-void">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-heading-md text-chalk-hi font-bold">CashTwin</span>
            </Link>
            <p className="mt-3 text-body-sm text-chalk-lo">
              A consent-first cash-flow digital twin for Indian MSMEs.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-label-xs uppercase text-chalk-hi font-semibold tracking-wider">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        type="button"
                        onClick={link.onClick}
                        className="text-body-sm text-chalk-lo transition-colors hover:text-lime text-left"
                      >
                        {link.label}
                      </button>
                    ) : link.to.startsWith('/#') ? (
                      <a
                        href={link.to.replace('/', '')}
                        className="text-body-sm text-chalk-lo transition-colors hover:text-lime"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-body-sm text-chalk-lo transition-colors hover:text-lime"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-edge-dark pt-8 space-y-4">
          <DisclaimerBar />

          {/* User Requested Copyright & Legal Sub-Bar */}
          <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-chalk-lo pt-2 border-t border-edge-dark/50">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>&copy; 2026 CashTwin</span>
              <span>&middot;</span>
              <button
                type="button"
                onClick={onOpenTerms}
                className="hover:text-lime transition-colors underline-offset-2 hover:underline"
              >
                Terms &amp; Conditions
              </button>
              <span>&middot;</span>
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="hover:text-lime transition-colors underline-offset-2 hover:underline"
              >
                Privacy Policy
              </button>
              <span>&middot;</span>
              <Link to="/contact" className="hover:text-lime transition-colors">
                Contact
              </Link>
            </div>
            <span className="text-[11px] text-chalk-lo/80">
              Built for Indian MSMEs &middot; DPDP Act 2023 Compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
