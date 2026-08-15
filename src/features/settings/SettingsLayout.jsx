import { NavLink, Outlet } from 'react-router-dom';
import cn from '@/lib/cn';
import DisclaimerBar from '@/components/shared/DisclaimerBar';
import EyebrowLabel from '@/components/shared/EyebrowLabel';

/**
 * Settings shell (PRD 3.8) — light canvas, docs-style left nav, reusing the
 * same square-bullet active marker as the reference's sidebar.
 */

const NAV = [
  { to: '/app/settings', label: 'Privacy & consent', end: true },
  { to: '/app/settings/audit', label: 'Audit log' },
];

const DISABLED = ['Profile', 'Data sources', 'Notifications'];

export default function SettingsLayout() {
  return (
    <div className="min-h-screen bg-light">
      <div className="px-5 py-8 md:px-8">
        <header className="mb-8">
          <EyebrowLabel onLight filled>
            Settings
          </EyebrowLabel>
          <h1 className="mt-3 font-display text-display-md text-ink-hi">
            Your data, and who may see it
          </h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="Settings" className="lg:sticky lg:top-6 lg:self-start">
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 border-b py-3 text-body-sm transition-colors',
                        isActive
                          ? 'border-ink-hi text-ink-hi'
                          : 'border-edge-light text-ink-lo hover:text-ink-hi',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn('h-1.5 w-1.5 shrink-0', isActive ? 'bg-ink-hi' : 'bg-edge-light')}
                          aria-hidden="true"
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}

              {DISABLED.map((label) => (
                <li key={label}>
                  <span className="flex items-center gap-2.5 border-b border-edge-light py-3 text-body-sm text-ink-lo opacity-50">
                    <span className="h-1.5 w-1.5 shrink-0 bg-edge-light" aria-hidden="true" />
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-8">
            <Outlet />
            <div className="border-t border-edge-light pt-6">
              <DisclaimerBar onLight />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
