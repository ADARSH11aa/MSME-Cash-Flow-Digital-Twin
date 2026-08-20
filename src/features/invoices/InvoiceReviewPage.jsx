import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/shared/Button';
import DataTable from '@/components/shared/DataTable';
import PageContainer from '@/components/shared/PageContainer';
import PageHeader from '@/components/shared/PageHeader';
import Pill from '@/components/shared/Pill';
import { StaggerItem } from '@/components/shared/motion';
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
    <PageContainer>
      <PageHeader
        eyebrow="Imported data"
        title="Review your invoices"
        subtitle="Check what we read from your documents. Correcting any value re-runs your forecast straight away."
        actions={
          <Button variant="secondary">
            <UploadCloud className="h-4 w-4" /> Import more
          </Button>
        }
      />

      {/* AnimatePresence so the confirmation slides in on a correction and
          out again when it is replaced, instead of popping between values. */}
      <AnimatePresence mode="wait">
        {lastEdit ? (
          <motion.div
            key={`${lastEdit.id}-${lastEdit.after}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-3 rounded-card border border-edge-dark bg-surface-2 px-4 py-3 shadow-card"
          >
            <span className="text-label-xs uppercase text-chalk-lo">Last correction</span>
            <span
              data-numeric
              className="flex items-center gap-2 text-body-sm tabular text-chalk-hi"
            >
              {lastEdit.id}:{' '}
              <span className="text-chalk-lo line-through">
                {formatCurrency(lastEdit.before)}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-lime-ink" aria-hidden="true" />
              <span className="font-semibold text-lime-ink">
                {formatCurrency(lastEdit.after)}
              </span>
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {loading && !data ? (
        <div className="h-96 animate-pulse rounded-card border border-edge-dark bg-surface" />
      ) : (
        <StaggerItem index={1}>
          <DataTable
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
                  <span data-numeric className="tabular font-medium">
                    {formatCurrency(row.amount)}
                    {row.importedAmount !== row.amount ? (
                      <span className="ml-2 text-body-sm text-chalk-lo line-through">
                        {formatCurrency(row.importedAmount)}
                      </span>
                    ) : null}
                  </span>
                ),
              },
              {
                key: 'confidence',
                header: 'Confidence',
                render: (row) => <Pill status={row.confidence} />,
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
                    <Pill status={row.status} />
                    {row.daysOverdue > 0 ? (
                      <span data-numeric className="tabular text-body-sm font-semibold text-risk-ink">
                        +{row.daysOverdue}d
                      </span>
                    ) : null}
                  </span>
                ),
              },
              { key: 'source', header: 'Source' },
            ]}
          />
        </StaggerItem>
      )}

      {/* The shell footer already carries the disclaimer on every screen. */}
      <p className="border-t border-edge-dark pt-6 text-body-sm text-chalk-lo">
        Amounts are editable — select any figure in the Amount column to correct it.
      </p>
    </PageContainer>
  );
}
