import { FileSpreadsheet, Keyboard, Loader2, Plug, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import cn from '@/lib/cn';
import Pill from '@/components/shared/Pill';

/**
 * Onboarding step 2 (PRD 3.2) — three import methods as selectable cards, with
 * the upload path showing the OCR progress state described in PRD 3.3.
 */

const METHODS = [
  {
    id: 'upload',
    Icon: UploadCloud,
    title: 'Upload CSV or PDF',
    body: 'Drop in invoices, bank statements or expense sheets. We read them for you.',
  },
  {
    id: 'manual',
    Icon: Keyboard,
    title: 'Manual entry',
    body: 'Type in your invoices and recurring costs. Best if you keep books on paper.',
  },
  {
    id: 'connect',
    Icon: Plug,
    title: 'Connect accounting software',
    body: 'Sync directly from Tally or Zoho Books.',
    soon: true,
  },
];

export default function ConnectDataStep({ method, onMethodChange }) {
  const [ocrState, setOcrState] = useState('idle');

  const startUpload = () => {
    setOcrState('reading');
    // Stands in for the OCR round trip; the real flow replaces this with the
    // extraction job's progress.
    setTimeout(() => setOcrState('done'), 2200);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="font-display text-display-md text-chalk-hi">Connect your data</h2>
        <p className="text-body-md text-chalk-lo">
          Your twin needs invoices, recurring expenses and your current cash position to model
          anything. Pick whichever route matches how you keep records.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {METHODS.map((m) => {
          const selected = method === m.id;
          return (
            <button
              key={m.id}
              type="button"
              disabled={m.soon}
              aria-pressed={selected}
              onClick={() => onMethodChange(m.id)}
              className={cn(
                'flex h-full flex-col gap-3 border p-5 text-left transition-colors',
                m.soon && 'cursor-not-allowed opacity-50',
                selected
                  ? 'border-lime bg-lime-8'
                  : 'border-edge-dark bg-surface hover:border-chalk-lo',
              )}
            >
              <m.Icon
                className={cn('h-5 w-5', selected ? 'text-lime' : 'text-chalk-lo')}
                aria-hidden="true"
              />
              <span className="flex flex-wrap items-center gap-2 text-body-md text-chalk-hi">
                {m.title}
                {m.soon ? <Pill status="pending">Coming soon</Pill> : null}
              </span>
              <span className="text-body-sm text-chalk-lo">{m.body}</span>
            </button>
          );
        })}
      </div>

      {method === 'upload' ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-12 text-center',
            ocrState === 'done' ? 'border-lime/50 bg-lime-8' : 'border-edge-dark bg-surface',
          )}
        >
          {ocrState === 'idle' ? (
            <>
              <FileSpreadsheet className="h-7 w-7 text-chalk-lo" aria-hidden="true" />
              <p className="text-body-md text-chalk-hi">Drag files here, or choose them</p>
              <p className="text-body-sm text-chalk-lo">CSV, PDF or images of invoices</p>
              <button
                type="button"
                onClick={startUpload}
                className="mt-2 border border-edge-dark px-4 py-2 text-label-xs uppercase text-chalk-hi transition-colors hover:border-chalk-lo"
              >
                Choose files
              </button>
            </>
          ) : null}

          {ocrState === 'reading' ? (
            <div aria-live="polite" className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-info" aria-hidden="true" />
              <p className="text-body-md text-chalk-hi">Reading invoice…</p>
              <div className="h-1 w-56 overflow-hidden bg-surface-2">
                <div className="h-full w-1/3 animate-[reveal-up_1.2s_ease-in-out_infinite] bg-info" />
              </div>
              <p className="text-body-sm text-chalk-lo">
                Extracting amounts, due dates and customer names
              </p>
            </div>
          ) : null}

          {ocrState === 'done' ? (
            <div aria-live="polite" className="space-y-2">
              <p className="text-body-md text-chalk-hi">7 invoices read</p>
              <p className="text-body-sm text-chalk-lo">
                One field came back low-confidence — you can correct it after setup.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {method === 'manual' ? (
        <div className="border border-edge-dark bg-surface p-6">
          <p className="text-body-sm text-chalk-lo">
            We will start you with a blank invoice table after setup, and your twin updates as you
            add rows.
          </p>
        </div>
      ) : null}
    </div>
  );
}
