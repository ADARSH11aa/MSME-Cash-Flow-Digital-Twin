import { NavLink, Outlet } from 'react-router-dom';
import cn from '@/lib/cn';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';

/**
 * Settings shell (PRD 3.8) — light canvas, docs-style left nav, reusing the
 * same square-bullet active marker as the reference's sidebar.
 */

const NAV = [
  { to: '/app/settings', label: 'Privacy & consent', end: true },
  { to: '/app/settings/audit', label: 'Audit log' },
  { to: '/app/settings/profile', label: 'Profile' },
  { to: '/app/settings/data-sources', label: 'Data sources' },
  { to: '/app/settings/notifications', label: 'Notifications' },
];

export default function SettingsLayout() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Settings"
        title="Account, data & privacy"
        subtitle="Control what CashTwin can see, who it can tell, and what it keeps."
      />

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings" className="lg:sticky lg:top-6 lg:self-start">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-control px-3 py-2.5 text-body-sm',
                      'transition-colors duration-hover ease-out',
                      isActive
                        ? 'bg-lime-8 font-semibold text-chalk-hi'
                        : 'text-chalk-lo hover:bg-surface-2 hover:text-chalk-hi',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', isActive ? 'bg-lime' : 'bg-edge-dark')}
                        aria-hidden="true"
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* No DisclaimerBar here: AppShell renders one in the page footer
            for every authenticated screen, and a second copy a few hundred
            pixels above it just read as a duplicate. */}
        <div className="min-w-0 space-y-8">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
}
