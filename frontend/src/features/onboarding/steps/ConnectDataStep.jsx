import { FileSpreadsheet, Keyboard, Loader2, Plug, TriangleAlert, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import cn from '@/lib/cn';
import Pill from '@/components/shared/Pill';
import { uploadInvoices } from '@/mocks/api/data';

/**
 * Onboarding step 2 (PRD 3.2) — three import methods as selectable cards.
 *
 * The upload path calls the real pipeline (POST /api/data/upload-invoices,
 * same endpoint as Settings → Data Sources' InvoiceCsvUpload) — this
 * replaces AI_models/invoices.csv and reloads Model 1, so "Build my
 * cash-flow twin" on step 3 computes the Dashboard against whatever was
 * actually picked here, not a fixed demo dataset.
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

export default function ConnectDataStep({ method, onMethodChange, onUploadComplete }) {
  const inputRef = useRef(null);
  const [uploadState, setUploadState] = useState('idle'); // idle | reading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChosen = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadState('error');
      setError('Only .csv files are supported right now — PDF/image OCR (Model 4) isn’t wired into this step yet.');
      return;
    }

    setUploadState('reading');
    setError(null);
    try {
      const res = await uploadInvoices(file);
      setResult(res);
      setUploadState('done');
      onUploadComplete?.(res);
    } catch (e) {
      setUploadState('error');
      setError(e.message);
    }
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
            uploadState === 'done' && 'border-lime/50 bg-lime-8',
            uploadState === 'error' && 'border-caution/50 bg-caution/10',
            uploadState === 'idle' || uploadState === 'reading'
              ? 'border-edge-dark bg-surface'
              : null,
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
          />

          {uploadState === 'idle' ? (
            <>
              <FileSpreadsheet className="h-7 w-7 text-chalk-lo" aria-hidden="true" />
              <p className="text-body-md text-chalk-hi">Drag files here, or choose them</p>
              <p className="text-body-sm text-chalk-lo">CSV, PDF or images of invoices</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2 border border-edge-dark px-4 py-2 text-label-xs uppercase text-chalk-hi transition-colors hover:border-chalk-lo"
              >
                Choose files
              </button>
            </>
          ) : null}

          {uploadState === 'reading' ? (
            <div aria-live="polite" className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-info" aria-hidden="true" />
              <p className="text-body-md text-chalk-hi">Reading invoices…</p>
              <div className="h-1 w-56 overflow-hidden bg-surface-2">
                <div className="h-full w-1/3 animate-[reveal-up_1.2s_ease-in-out_infinite] bg-info" />
              </div>
              <p className="text-body-sm text-chalk-lo">
                Validating columns and rebuilding customer history
              </p>
            </div>
          ) : null}

          {uploadState === 'done' && result ? (
            <div aria-live="polite" className="space-y-2">
              <p className="text-body-md text-chalk-hi">
                {result.rowCount} invoices read, {result.customerCount} customers
              </p>
              <p className="text-body-sm text-chalk-lo">
                Your twin will be built from this dataset — you can replace it any time from
                Settings → Data Sources.
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-1 text-label-xs uppercase text-chalk-lo underline underline-offset-2 hover:text-chalk-hi"
              >
                Choose a different file
              </button>
            </div>
          ) : null}

          {uploadState === 'error' ? (
            <div aria-live="polite" className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-caution">
                <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
                <p className="text-body-md">Could not read this file</p>
              </div>
              <p className="max-w-md text-body-sm text-chalk-lo">{error}</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-1 border border-edge-dark px-4 py-2 text-label-xs uppercase text-chalk-hi transition-colors hover:border-chalk-lo"
              >
                Try another file
              </button>
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
