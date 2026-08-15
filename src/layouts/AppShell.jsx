import {
  FileText,
  LayoutDashboard,
  Lightbulb,
  Settings,
  SlidersHorizontal,
  Waypoints,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import cn from '@/lib/cn';
import CalculationLineage from '@/components/shared/CalculationLineage';
import DisclaimerBar from '@/components/shared/DisclaimerBar';
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToastProvider } from '@/components/shared/Toast';
import { LineageContext } from '@/hooks/useLineage';
import { getLineage } from '@/mocks/api/lineage';

/**
 * Authenticated shell — the left icon rail from PRD 3.4, plus the contextual
 * lineage drawer that any <Figure figureId="…" /> in the tree can open.
 *
 * Hosting the drawer here is what makes PRD 3.7's "clicking any number
 * anywhere opens lineage" true without every screen wiring up its own sheet.
 */

const NAV = [
  { to: '/app', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/app/scenarios', label: 'Scenarios', Icon: SlidersHorizontal },
  { to: '/app/recommendations', label: 'Recommendations', Icon: Lightbulb },
  { to: '/app/explainability', label: 'Explainability', Icon: Waypoints },
  { to: '/app/invoices', label: 'Invoices', Icon: FileText },
  { to: '/app/settings', label: 'Settings', Icon: Settings },
];

export default function AppShell() {
  const [lineage, setLineage] = useState(null);
  const [open, setOpen] = useState(false);

  const openLineage = useCallback((figureId) => {
    setOpen(true);
    setLineage(null);
    getLineage(figureId).then(setLineage);
  }, []);

  const lineageValue = useMemo(() => ({ openLineage }), [openLineage]);

  return (
    <TooltipProvider delayDuration={150}>
      <ToastProvider>
        <LineageContext.Provider value={lineageValue}>
          <div className="min-h-screen bg-void">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-lime focus:px-4 focus:py-2 focus:text-label-xs focus:uppercase focus:text-ink-hi"
            >
              Skip to content
            </a>

            <IconRail />

            {/* Rail is fixed on desktop, a bottom tab bar below md (PRD §7).
                overflow-x-clip is a backstop: wide financial tables and the
                risk graph scroll inside their own containers, and nothing is
                allowed to make the page itself scroll sideways. */}
            <div className="overflow-x-clip pb-20 md:pb-0 md:pl-16">
              <main id="main" className="min-w-0">
                <Outlet />
              </main>

              <footer className="border-t border-edge-dark px-5 py-6 md:px-8">
                <DisclaimerBar />
              </footer>
            </div>

            <LineageDrawer open={open} onOpenChange={setOpen} lineage={lineage} />
          </div>
        </LineageContext.Provider>
      </ToastProvider>
    </TooltipProvider>
  );
}

function IconRail() {
  return (
    <nav
      aria-label="Main"
      className={cn(
        // Bottom tab bar on mobile, vertical icon rail from md up.
        'fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-edge-dark bg-surface px-2 py-2',
        'md:inset-y-0 md:left-0 md:right-auto md:w-16 md:flex-col md:justify-start md:gap-1 md:border-r md:border-t-0 md:py-5',
      )}
    >
      <span className="hidden md:mb-4 md:flex md:h-9 md:w-9 md:items-center md:justify-center">
        <LogoMark />
      </span>

      {NAV.map(({ to, label, Icon, end }) => (
        <Tooltip key={to}>
          <TooltipTrigger asChild>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center transition-colors',
                  isActive
                    ? 'bg-lime-16 text-lime'
                    : 'text-chalk-lo hover:bg-surface-2 hover:text-chalk-hi',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </NavLink>
          </TooltipTrigger>
          {/* Tooltip shows on focus as well as hover, so the icon-only rail is
              usable from the keyboard. */}
          <TooltipContent side="right" className="hidden md:block">
            {label}
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}

function LineageDrawer({ open, onOpenChange, lineage }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{lineage?.label ?? 'How this was calculated'}</SheetTitle>
          <SheetDescription>
            {lineage?.explanation ??
              'Tracing this figure back to the records it came from.'}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          {lineage ? (
            <CalculationLineage lineage={lineage} showRunningTotal={false} />
          ) : (
            <div className="space-y-2" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse border border-edge-dark bg-surface-2" />
              ))}
            </div>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export function LogoMark({ className }) {
  // Twin diamonds — the "digital twin" mark referenced in PRD 3.1.
  return (
    <svg viewBox="0 0 24 24" className={cn('h-6 w-6', className)} aria-hidden="true">
      <rect x="7" y="2" width="10" height="10" transform="rotate(45 12 7)" fill="var(--accent-lime)" />
      <rect
        x="7"
        y="12"
        width="10"
        height="10"
        transform="rotate(45 12 17)"
        fill="none"
        stroke="var(--accent-lime)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
