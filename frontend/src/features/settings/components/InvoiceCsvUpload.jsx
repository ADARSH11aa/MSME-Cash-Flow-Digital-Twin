import { useRef, useState } from 'react';
import { CheckCircle2, Upload } from 'lucide-react';
import Button from '@/components/shared/Button';
import { useToast } from '@/components/shared/Toast';
import { recordAuditEvent } from '@/mocks/api/auditLog';
import { uploadInvoices } from '@/mocks/api/data';

/**
 * The one genuinely functional data-source control on this page — unlike
 * the connector cards above it (Tally, GSTN, HDFC), which are a demo
 * narrative with no real backend behind them, this actually replaces
 * AI_models/invoices.csv and reloads Model 1, so the Dashboard,
 * Recommendations, and Scenario Simulator screens reflect it immediately
 * after upload (see backend/app/routers/data.py).
 */
export default function InvoiceCsvUpload() {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const res = await uploadInvoices(file);
      setResult(res);
      recordAuditEvent({
        event: 'Invoice CSV uploaded',
        actor: 'owner',
        detail: `${res.rowCount} invoices across ${res.customerCount} customers replaced the active dataset.`,
      });
      toast({
        title: 'Dataset replaced',
        description: `${res.rowCount} invoices loaded — forecast, risk graph and recommendations now reflect this data.`,
        tone: 'success',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        tone: 'warning',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-card border border-lime/40 bg-surface-2 p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-semibold text-chalk-hi">
            Upload invoice CSV
          </h3>
          <p className="mt-1 max-w-xl text-body-sm text-chalk-lo">
            Replaces the AI pipeline's active dataset. Required columns: invoice_id,
            cust_number, customer_name, sector, payment_term_days, invoice_amount,
            issue_date, due_date, status.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button
            variant="secondary"
            size="sm"
            className="rounded-control text-xs"
            onClick={() => inputRef.current?.click()}
          >
            {file ? file.name : 'Choose file'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="rounded-control text-xs"
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            <Upload className="mr-1 h-3.5 w-3.5" />
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </div>

      {result ? (
        <p className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-lime">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {result.rowCount} invoices, {result.customerCount} customers now active.
        </p>
      ) : null}
    </div>
  );
}
