import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import cn from '@/lib/cn';
import Button from '@/components/shared/Button';
import DisclaimerBar from '@/components/shared/DisclaimerBar';
import SmoothScrollProvider from '@/components/shared/SmoothScrollProvider';
import { LogoMark } from './AppShell';

/**
 * Marketing shell — sticky dark top nav with pill buttons, 60fps smooth scrolling, and modern footer.
 */

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#scenarios', label: 'Scenarios' },
  { href: '#modules', label: 'Capabilities' },
  { href: '#consent', label: 'Consent' },
];

export default function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-void flex flex-col justify-between">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-lime focus:px-4 focus:py-2 focus:text-label-xs focus:uppercase focus:text-ink-hi"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-edge-dark bg-void/90 backdrop-blur-md">
          <nav
            aria-label="Main"
            className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8"
          >
            <Link to="/" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-heading-md font-bold text-chalk-hi">CashTwin</span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-body-sm text-chalk-lo transition-colors hover:text-chalk-hi"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/app"
                className="hidden text-body-sm text-chalk-lo transition-colors hover:text-chalk-hi sm:inline-block mr-2"
              >
                Sign in
              </Link>
              <Button asChild size="sm" className="hidden sm:inline-flex rounded-full px-5">
                <Link to="/onboarding">Get started</Link>
              </Button>
              <button
                type="button"
                className="p-2 text-chalk-hi md:hidden"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {menuOpen ? (
            <div className="border-t border-edge-dark bg-void px-5 py-4 md:hidden">
              <ul className="space-y-3">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block text-body-md text-chalk-lo"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li className="pt-2">
                  <Button asChild size="sm" className="w-full rounded-full">
                    <Link to="/onboarding">Get started</Link>
                  </Button>
                </li>
              </ul>
            </div>
          ) : null}
        </header>

        <main id="main" className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}

function Footer() {
  const columns = [
    { title: 'Product', links: ['How it works', 'Scenarios', 'Recommendations', 'Explainability'] },
    { title: 'Company', links: ['About', 'Careers', 'Contact'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'Consent policy'] },
    { title: 'Docs', links: ['Getting started', 'Data model', 'API'] },
  ];

  return (
    <footer className="border-t border-edge-dark bg-void">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-heading-md text-chalk-hi font-bold">CashTwin</span>
            </div>
            <p className="mt-3 text-body-sm text-chalk-lo">
              A cash-flow digital twin for Indian MSMEs.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className={cn('text-label-xs uppercase text-chalk-hi font-semibold')}>{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#main"
                      className="text-body-sm text-chalk-lo transition-colors hover:text-chalk-hi"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-edge-dark pt-6">
          <DisclaimerBar />
        </div>
      </div>
    </footer>
  );
}
