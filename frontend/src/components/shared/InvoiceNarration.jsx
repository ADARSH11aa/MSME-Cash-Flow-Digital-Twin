import { useState } from 'react';
import cn from '@/lib/cn';
import Card from '@/components/shared/Card';
import useAsync from '@/hooks/useAsync';
import { getInvoiceNarration, getNarrationLanguages } from '@/mocks/api/narration';

/**
 * Model 6's plain-language explanation of one invoice's prediction (PRD 3.6).
 *
 * The rest of the product answers "what will happen" in numbers and charts.
 * This is the one surface that answers "why" in a sentence a business owner
 * can read — and, via the language picker, in the language they actually
 * think in. MSME owners outside metros are not the audience for an English
 * financial dashboard, and narration is the only output in the pipeline that
 * is prose rather than figures, so it is the only part translation reaches.
 *
 * Two states are surfaced deliberately rather than hidden:
 *
 *   - `source === 'fallback'` means the LLM was unreachable, too slow, or
 *     returned a number it was never given (Model 6 runs a numeric-fidelity
 *     check and rejects the response outright if so). The text is then from a
 *     deterministic template. Labelling that is the difference between a demo
 *     that degrades honestly and one that quietly pretends.
 *   - `confidence === 'low'` means Model 1 had too little history for this
 *     customer and leaned on a sector average, so the prediction being
 *     explained is itself a wider guess than usual.
 *
 * @param {{ invoiceId: string, className?: string }} props
 */
export default function InvoiceNarration({ invoiceId, className }) {
  const [language, setLanguage] = useState('en');

  const { data: languageInfo } = useAsync(() => getNarrationLanguages(), []);
  const {
    data: narration,
    loading,
    error,
  } = useAsync(
    () => (invoiceId ? getInvoiceNarration(invoiceId, language) : Promise.resolve(null)),
    [invoiceId, language],
  );

  // Narration needs an API key the other models don't. When it isn't
  // configured the honest thing is to show nothing at all, rather than an
  // error the viewer can do nothing about.
  if (languageInfo && !languageInfo.available) return null;

  const languages = languageInfo?.languages ?? {};

  return (
    <Card padding="lg" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-heading-sm text-chalk-hi">Why this prediction</h3>
          <p className="mt-1 text-body-sm text-chalk-lo">
            Generated from this invoice&rsquo;s own risk factors — {invoiceId}
          </p>
        </div>

        {Object.keys(languages).length > 0 ? (
          <label className="flex items-center gap-2 text-label-xs uppercase text-chalk-lo">
            <span className="sr-only sm:not-sr-only">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-control border border-edge-dark bg-surface-2 px-2 py-1.5 text-body-sm text-chalk-hi"
            >
              {Object.entries(languages).map(([code, label]) => (
                // The server's labels read "Hindi, in Devanagari script" —
                // useful as a model instruction, noise in a dropdown.
                <option key={code} value={code}>
                  {label.split(',')[0]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="mt-4 min-h-[4.5rem]">
        {loading ? (
          <div className="space-y-2" aria-busy="true">
            <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-surface-2" />
          </div>
        ) : error ? (
          <p className="text-body-sm text-chalk-lo">
            This explanation couldn&rsquo;t be generated right now. The figures above are
            unaffected — narration is a separate service.
          </p>
        ) : narration ? (
          <p className="text-body-md leading-relaxed text-chalk-hi">{narration.text}</p>
        ) : null}
      </div>

      {narration && !loading ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-edge-dark pt-3">
          <Badge tone={narration.source === 'llm' ? 'neutral' : 'caution'}>
            {narration.source === 'llm' ? 'AI-generated' : 'Template fallback'}
          </Badge>
          {narration.confidence === 'low' ? (
            <Badge tone="caution">Low-confidence prediction</Badge>
          ) : null}
          {/* Model 6 narrates numbers Models 1 and 5 computed; it never does
              arithmetic of its own, and any number it invents is rejected
              before it reaches this component. Worth stating on the surface
              where a jury will ask "is this just an LLM making things up?". */}
          <span className="text-label-xs text-chalk-lo">
            Explains computed figures only — never calculates them
          </span>
        </div>
      ) : null}
    </Card>
  );
}

function Badge({ tone, children }) {
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 text-label-xs uppercase',
        tone === 'caution'
          ? 'border-caution/50 bg-caution-8 text-caution'
          : 'border-edge-dark bg-surface-2 text-chalk-lo',
      )}
    >
      {children}
    </span>
  );
}
