import ConsentSwitchRow from '@/components/shared/ConsentSwitchRow';
import { CONSENT_SCOPES } from '@/mocks/api/consent';

/**
 * Onboarding step 1 (PRD 3.2) — granular, individually revocable scopes.
 * Renders from the same CONSENT_SCOPES source as Settings, so the two screens
 * cannot describe the same permission differently.
 */
export default function ConsentStep({ consent, onToggle }) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="font-display text-display-md text-chalk-hi">What CashTwin can access</h2>
        <p className="text-body-md text-chalk-lo">
          Nothing is analysed until you allow it. You can change any of these later, and every
          change is written to your audit log.
        </p>
      </header>

      <div className="space-y-2">
        {CONSENT_SCOPES.map((scope) => (
          <ConsentSwitchRow
            key={scope.key}
            title={scope.title}
            description={scope.description}
            sensitive={scope.sensitive}
            checked={Boolean(consent?.[scope.key])}
            onCheckedChange={(value) => onToggle(scope.key, value)}
          />
        ))}
      </div>
    </div>
  );
}
