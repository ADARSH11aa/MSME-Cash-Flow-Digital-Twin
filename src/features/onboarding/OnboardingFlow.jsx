import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cn from '@/lib/cn';
import Button from '@/components/shared/Button';
import DisclaimerBar from '@/components/shared/DisclaimerBar';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import useConsent from '@/hooks/useConsent';
import { LogoMark } from '@/layouts/AppShell';
import ConnectDataStep from './steps/ConnectDataStep';
import ConsentStep from './steps/ConsentStep';
import ReviewStep from './steps/ReviewStep';

/**
 * Consent onboarding (PRD 3.2) — full-screen, dark, three steps, unskippable
 * before any data is imported.
 */

const STEPS = ['Consent', 'Connect data', 'Review'];

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { consent, setScope } = useConsent();
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState('upload');
  const [building, setBuilding] = useState(false);

  const build = () => {
    setBuilding(true);
    // The moment the twin is first computed — PRD 3.2 asks for a short branded
    // wait here rather than an instant jump, because the pause is what makes
    // the result feel derived from the owner's own data.
    setTimeout(() => navigate('/app'), 1800);
  };

  if (building) return <BuildingState />;

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <header className="border-b border-edge-dark px-5 py-5 md:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <LogoMark />
          <span className="font-display text-heading-md text-chalk-hi">CashTwin</span>
        </Link>
      </header>

      <main id="main" className="flex flex-1 items-start justify-center px-5 py-12 md:px-8">
        <div className="w-full max-w-2xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <EyebrowLabel>
              Step {step + 1} of {STEPS.length}
            </EyebrowLabel>

            {/* The full step list needs room to read; below sm the "Step 1 of 3"
                badge and the step heading already carry the same information. */}
            <ol className="hidden items-center gap-2 sm:flex" aria-label="Progress">
              {STEPS.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-1.5 w-1.5',
                      i < step ? 'bg-lime' : i === step ? 'bg-lime' : 'bg-edge-dark',
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      'text-label-xs uppercase',
                      i === step ? 'text-chalk-hi' : 'text-chalk-lo',
                    )}
                  >
                    {label}
                    {i === step ? <span className="sr-only"> (current step)</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="border border-edge-dark bg-surface p-6 md:p-8">
            {step === 0 ? <ConsentStep consent={consent} onToggle={setScope} /> : null}
            {step === 1 ? <ConnectDataStep method={method} onMethodChange={setMethod} /> : null}
            {step === 2 ? <ReviewStep consent={consent} method={method} /> : null}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-edge-dark pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  // Forecasting consent is what the twin is; without it there
                  // is nothing to build, so the flow cannot continue.
                  disabled={step === 0 && !consent?.allowForecasting}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={build}>
                  Build my cash-flow twin <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {step === 0 && !consent?.allowForecasting ? (
            <p className="mt-4 text-body-sm text-caution">
              Forecasting is what the twin does. Without it, CashTwin can only show you what has
              already happened.
            </p>
          ) : null}

          <div className="mt-8">
            <DisclaimerBar />
          </div>
        </div>
      </main>
    </div>
  );
}

function BuildingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-void px-5">
      <LogoMark className="h-9 w-9" />
      <div className="flex items-center gap-3" aria-live="polite">
        <Loader2 className="h-4 w-4 animate-spin text-lime" aria-hidden="true" />
        <p className="font-display text-heading-md text-chalk-hi">
          Mapping your inflows and outflows…
        </p>
      </div>
      <p className="max-w-sm text-center text-body-sm text-chalk-lo">
        Matching invoices to payment behaviour, then projecting your position forward 30 days.
      </p>
    </div>
  );
}
