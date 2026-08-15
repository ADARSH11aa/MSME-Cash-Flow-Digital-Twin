import { Link } from 'react-router-dom';
import Button from '@/components/shared/Button';
import ConsentSwitchRow from '@/components/shared/ConsentSwitchRow';
import { useToast } from '@/components/shared/Toast';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import useConsent from '@/hooks/useConsent';
import { CONSENT_SCOPES } from '@/mocks/api/consent';

/**
 * Privacy & consent panel (PRD 3.8) — the same ConsentSwitchRow component as
 * onboarding step 1, so the two surfaces stay identical.
 *
 * Revoking a scope routes through a confirmation, because it silently changes
 * what the forecast is allowed to use; granting one does not.
 */
export default function PrivacyConsentPage() {
  const { consent, setScope } = useConsent();
  const { toast } = useToast();
  const [pendingRevoke, setPendingRevoke] = useState(null);

  const handleToggle = (scope, value) => {
    if (!value) {
      setPendingRevoke(scope);
      return;
    }
    setScope(scope.key, true);
    toast({ title: `${scope.title} allowed`, description: 'Written to your audit log.', tone: 'success' });
  };

  const confirmRevoke = () => {
    setScope(pendingRevoke.key, false);
    toast({
      title: `${pendingRevoke.title} revoked`,
      description: 'Written to your audit log. Forecast updated.',
      tone: 'warning',
    });
    setPendingRevoke(null);
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-heading-md text-ink-hi">Privacy &amp; consent</h2>
        <p className="mt-2 max-w-2xl text-body-sm text-ink-lo">
          Change what CashTwin may analyse at any time. Every change takes effect immediately and is
          recorded in your{' '}
          <Link to="/app/settings/audit" className="underline underline-offset-2">
            audit log
          </Link>
          .
        </p>
      </div>

      <div className="space-y-2">
        {CONSENT_SCOPES.map((scope) => (
          <ConsentSwitchRow
            key={scope.key}
            onLight
            title={scope.title}
            description={scope.description}
            sensitive={scope.sensitive}
            checked={Boolean(consent?.[scope.key])}
            onCheckedChange={(value) => handleToggle(scope, value)}
          />
        ))}
      </div>

      <Dialog open={Boolean(pendingRevoke)} onOpenChange={(open) => !open && setPendingRevoke(null)}>
        <DialogContent>
          <DialogTitle>Revoke {pendingRevoke?.title.toLowerCase()}?</DialogTitle>
          <DialogDescription>
            CashTwin will stop using this data immediately, and parts of your forecast may become
            unavailable. You can turn it back on whenever you like.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Keep it on</Button>
            </DialogClose>
            {/* Destructive action uses the red outline, never the lime fill. */}
            <Button variant="destructive" onClick={confirmRevoke}>
              Revoke access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
