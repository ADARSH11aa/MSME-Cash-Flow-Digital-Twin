import { ArrowRight, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/shared/Button';
import DataTable from '@/components/shared/DataTable';
import DisclaimerBar from '@/components/shared/DisclaimerBar';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import Pill from '@/components/shared/Pill';
import { useToast } from '@/components/shared/Toast';
import useAsync from '@/hooks/useAsync';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { getImportedFields } from '@/mocks/api/lineage';
import { recordAuditEvent } from '@/mocks/api/auditLog';

/**
 * Data import & invoice review (PRD 3.3) — the correction surface.
 *
 * Light canvas per PRD 2.1: this is the table-heavy, long-reading screen where
 * lighter contrast helps scanning columns of figures.
 */
export default function InvoiceReviewPage() {
  const { toast } = useToast();
  const { data, loading } = useAsync(() => getImportedFields(), []);
  const [rows, setRows] = useState(null);
  const [lastEdit, setLastEdit] = useState(null);

  const invoices = rows ?? data ?? [];

  const handleEdit = (id, key, value) => {
    const numeric = Number(String(value).replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(numeric)) return;

    const before = invoices.find((r) => r.id === id)?.amount;
    setRows(invoices.map((r) => (r.id === id ? { ...r, amount: numeric } : r)));
    setLastEdit({ id, before, after: numeric });

    recordAuditEvent({
      event: 'Invoice value corrected',
      actor: 'owner',
      detail: `${id} changed from ${formatCurrency(before)} to ${formatCurrency(numeric)}.`,
    });

    toast({
      title: 'Saved. Forecast recalculating…',
      description: `${id}: ${formatCurrency(before)} → ${formatCurrency(numeric)}`,
      tone: 'pending',
    });
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="space-y-6 px-5 py-8 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <EyebrowLabel onLight filled>
              Imported data
            </EyebrowLabel>
            <h1 className="mt-3 font-display text-display-md text-ink-hi">Review your invoices</h1>
            <p className="mt-1 max-w-2xl text-body-sm text-ink-lo">
              Check what we read from your documents. Correcting any value re-runs your forecast
              straight away.
            </p>
          </div>
          <Button variant="secondaryLight">
            <UploadCloud className="h-4 w-4" /> Import more
          </Button>
        </header>

        {lastEdit ? (
          <div className="flex items-center gap-3 border border-edge-light bg-light-card px-4 py-3">
            <span className="text-label-xs uppercase text-ink-lo">Last correction</span>
            <span data-numeric className="flex items-center gap-2 text-body-sm tabular text-ink-hi">
              {lastEdit.id}: <span className="line-through">{formatCurrency(lastEdit.before)}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-ink-hi">{formatCurrency(lastEdit.after)}</span>
            </span>
          </div>
        ) : null}

        {loading && !data ? (
          <div className="h-96 animate-pulse border border-edge-light bg-light-card" />
        ) : (
          <DataTable
            onLight
            caption="Imported invoices, with OCR confidence and editable amounts"
            rows={invoices}
            onCellEdit={handleEdit}
            columns={[
              { key: 'id', header: 'Invoice', sortable: true, width: '120px' },
              { key: 'customer', header: 'Customer', sortable: true },
              {
                key: 'amount',
                header: 'Amount',
                sortable: true,
                align: 'right',
                editable: true,
                render: (row) => (
                  <span data-numeric className="tabular">
                    {formatCurrency(row.amount)}
                    {row.importedAmount !== row.amount ? (
                      <span className="ml-2 text-body-sm text-ink-lo line-through">
                        {formatCurrency(row.importedAmount)}
                      </span>
                    ) : null}
                  </span>
                ),
              },
              {
                key: 'confidence',
                header: 'Confidence',
                render: (row) => <Pill status={row.confidence} onLight />,
              },
              {
                key: 'dueDate',
                header: 'Due date',
                sortable: true,
                render: (row) => (
                  <span data-numeric className="tabular">
                    {formatDateShort(row.dueDate)}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <span className="flex items-center gap-2">
                    <Pill status={row.status} onLight />
                    {row.daysOverdue > 0 ? (
                      <span data-numeric className="tabular text-body-sm text-ink-lo">
                        {row.daysOverdue}d
                      </span>
                    ) : null}
                  </span>
                ),
              },
              { key: 'source', header: 'Source' },
            ]}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-edge-light pt-6">
          <p className="text-body-sm text-ink-lo">
            Amounts are editable — select any figure in the Amount column to correct it.
          </p>
          <DisclaimerBar onLight />
        </div>
      </div>
    </div>
  );
}
