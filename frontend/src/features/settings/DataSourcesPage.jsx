import { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Database,
  FileText,
  Landmark,
  Plus,
  RefreshCw,
} from 'lucide-react';
import Button from '@/components/shared/Button';
import { useToast } from '@/components/shared/Toast';
import { recordAuditEvent } from '@/mocks/api/auditLog';
import InvoiceCsvUpload from './components/InvoiceCsvUpload';

const DATA_SOURCES = [
  {
    id: 'src-tally',
    name: 'Tally Prime / ERP 9 Connector',
    type: 'Accounting Software',
    Icon: Database,
    status: 'connected',
    lastSync: '14 minutes ago',
    records: '142 sales & purchase vouchers',
    health: '99.8% match rate',
    scope: 'Ledger, Invoices, Recurring Outflows',
  },
  {
    id: 'src-gstn',
    name: 'GSTN E-Invoice & E-Way Bill Portal',
    type: 'Government Tax Gateway',
    Icon: Landmark,
    status: 'connected',
    lastSync: '1 hour ago',
    records: '84 B2B e-invoices with IRN verified',
    health: '100% verified',
    scope: 'Output Tax, E-Invoices, Buyer GSTINs',
  },
  {
    id: 'src-hdfc',
    name: 'HDFC Current Account (Account Aggregator)',
    type: 'Banking & Cash Ledger',
    Icon: Building,
    status: 'connected',
    lastSync: 'Live sync (2 mins ago)',
    records: 'Daily balance & settled collections',
    health: 'Valid until 14 Feb 2027 (180d)',
    scope: 'Bank balance, clearing inflows, debits',
  },
  {
    id: 'src-ocr',
    name: 'Invoice OCR & Document Parser (AI Model 4)',
    type: 'Manual Document Ingestion',
    Icon: FileText,
    status: 'active',
    lastSync: 'Ready for upload',
    records: '7 documents processed today',
    health: 'High confidence rate',
    scope: 'PDFs, Scanned Bills, Photos, CSV',
  },
];

export default function DataSourcesPage() {
  const { toast } = useToast();
  const [syncingId, setSyncingId] = useState(null);
  const [sources, setSources] = useState(DATA_SOURCES);

  const handleSync = (src) => {
    setSyncingId(src.id);

    setTimeout(() => {
      setSyncingId(null);
      setSources((prev) =>
        prev.map((s) => (s.id === src.id ? { ...s, lastSync: 'Just now' } : s)),
      );

      recordAuditEvent({
        event: 'Data source re-synced',
        actor: 'owner',
        detail: `Manual sync triggered for ${src.name}.`,
      });

      toast({
        title: `${src.name} synced`,
        description: 'New records imported and forecast recalculated.',
        tone: 'healthy',
      });
    }, 800);
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-heading-md text-chalk-hi">Connected Data Sources</h2>
          <p className="mt-2 max-w-2xl text-body-sm text-chalk-lo">
            CashTwin connects to your accounting system, GST portal, and bank feeds with consent-first privacy.
          </p>
        </div>

        <Button variant="secondary" size="md" className="rounded-control">
          <Plus className="h-4 w-4 mr-1.5" /> Connect new source
        </Button>
      </div>

      <InvoiceCsvUpload />

      {/* Summary stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-card border border-edge-dark bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <p className="text-label-xs uppercase tracking-wider text-chalk-lo font-semibold">Connected Connectors</p>
            <p className="mt-2 font-display text-2xl font-bold text-chalk-hi tracking-tight">3 Active</p>
          </div>
          <p className="mt-3 text-[12px] text-lime flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> All pipelines operational
          </p>
        </div>

        <div className="rounded-card border border-edge-dark bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <p className="text-label-xs uppercase tracking-wider text-chalk-lo font-semibold">Total Records Monitored</p>
            <p className="mt-2 font-display text-2xl font-bold text-chalk-hi tracking-tight">233 Invoices &amp; POs</p>
          </div>
          <p className="mt-3 text-[12px] text-chalk-lo font-normal">Across 5 primary customers</p>
        </div>

        <div className="rounded-card border border-edge-dark bg-surface p-6 shadow-card flex flex-col justify-between">
          <div>
            <p className="text-label-xs uppercase tracking-wider text-chalk-lo font-semibold">Forecast Recompute</p>
            <p className="mt-2 font-display text-2xl font-bold text-lime tracking-tight">Automated (Real-time)</p>
          </div>
          <p className="mt-3 text-[12px] text-chalk-lo font-normal">Instant delta update on changes</p>
        </div>
      </div>

      {/* Data Source Cards List */}
      <div className="space-y-4 pt-2">
        {sources.map((src) => {
          const isSyncing = syncingId === src.id;

          return (
            <div
              key={src.id}
              className="rounded-card border border-edge-dark bg-surface p-6 shadow-card transition-all hover:border-edge-dark/80"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-surface-2 border border-edge-dark text-lime">
                    <src.Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-display text-base font-semibold text-chalk-hi">{src.name}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-lime-16 border border-lime/30 px-2.5 py-0.5 text-[11px] font-semibold text-lime">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </span>
                    </div>

                    <p className="mt-1 text-body-sm text-chalk-lo">{src.type}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-body-sm text-chalk-lo">
                      <span>
                        <strong className="text-chalk-hi font-medium">Scope:</strong> {src.scope}
                      </span>
                      <span>
                        <strong className="text-chalk-hi font-medium">Synced:</strong> {src.records}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] text-chalk-lo font-mono">Last sync: {src.lastSync}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isSyncing}
                      onClick={() => handleSync(src)}
                      className="rounded-control text-xs"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isSyncing ? 'animate-spin text-lime' : ''}`} />
                      {isSyncing ? 'Syncing…' : 'Sync now'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
