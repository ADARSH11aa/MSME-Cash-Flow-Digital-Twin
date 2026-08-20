import { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Save,
  ShieldAlert,
  Smartphone,
  TrendingDown,
} from 'lucide-react';
import Button from '@/components/shared/Button';
import Switch from '@/components/ui/switch';
import { useToast } from '@/components/shared/Toast';
import { recordAuditEvent } from '@/mocks/api/auditLog';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [channels, setChannels] = useState({
    email: true,
    whatsapp: true,
    sms: false,
  });

  const [alerts, setAlerts] = useState({
    liquidityBreach: true,
    breachHorizon: '30',
    overdueAnomalies: true,
    largeOutflows: true,
    weeklyDigest: true,
    digestDay: 'Monday',
  });

  const handleChannelToggle = (key) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAlertToggle = (key) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      recordAuditEvent({
        event: 'Notification preferences updated',
        actor: 'owner',
        detail: 'Updated breach warning channels and frequency settings.',
      });

      toast({
        title: 'Notification preferences saved',
        description: 'Your cash crunch alerts and digest triggers have been updated.',
        tone: 'healthy',
      });
    }, 400);
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-heading-md text-chalk-hi">Alerts &amp; Notifications</h2>
        <p className="mt-2 max-w-2xl text-body-sm text-chalk-lo">
          Configure proactive cash crunch warnings, payment anomaly alerts (AI Model 3), and executive digests.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Delivery Channels */}
        <div className="rounded-card border border-edge-dark bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3 border-b border-edge-dark pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-control bg-lime-16 text-lime">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-chalk-hi">Delivery Channels</h3>
              <p className="text-body-sm text-chalk-lo">Where CashTwin sends early liquidity warnings</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-card border border-edge-dark bg-surface-2/60">
              <div className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-control bg-surface border border-edge-dark text-lime">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-chalk-hi">Email Alerts</p>
                  <p className="text-[12px] text-chalk-lo">mark@hussaincrafts.in (Verified)</p>
                </div>
              </div>
              <Switch checked={channels.email} onCheckedChange={() => handleChannelToggle('email')} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-card border border-edge-dark bg-surface-2/60">
              <div className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-control bg-surface border border-edge-dark text-emerald-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-chalk-hi">WhatsApp Business Alerts</p>
                  <p className="text-[12px] text-chalk-lo">+91 98201 44521 (Instant critical alerts)</p>
                </div>
              </div>
              <Switch checked={channels.whatsapp} onCheckedChange={() => handleChannelToggle('whatsapp')} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-card border border-edge-dark bg-surface-2/60">
              <div className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-control bg-surface border border-edge-dark text-chalk-lo">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-chalk-hi">SMS Alerts</p>
                  <p className="text-[12px] text-chalk-lo">Standard carrier SMS for urgent breach triggers</p>
                </div>
              </div>
              <Switch checked={channels.sms} onCheckedChange={() => handleChannelToggle('sms')} />
            </div>
          </div>
        </div>

        {/* Trigger Rules */}
        <div className="rounded-card border border-edge-dark bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3 border-b border-edge-dark pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-control bg-risk-16 text-risk">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-chalk-hi">Proactive Warning Rules</h3>
              <p className="text-body-sm text-chalk-lo">Configure what triggers an alert before trouble hits</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Rule 1: Liquidity Breach */}
            <div className="p-5 rounded-card border border-edge-dark bg-surface-2/60 space-y-3 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <TrendingDown className="h-4.5 w-4.5 text-risk shrink-0" />
                  <div>
                    <p className="text-body-sm font-semibold text-chalk-hi">Days-to-Breach Early Warning</p>
                    <p className="mt-0.5 text-[12px] text-chalk-lo">
                      Trigger alert when projected balance falls below ₹2,00,000 buffer.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={alerts.liquidityBreach}
                  onCheckedChange={() => handleAlertToggle('liquidityBreach')}
                />
              </div>

              {alerts.liquidityBreach ? (
                <div className="mt-3 pl-8 pt-3 border-t border-edge-dark/60 flex items-center gap-3">
                  <span className="text-label-xs uppercase text-chalk-lo font-semibold tracking-wider">Alert horizon:</span>
                  {/* appearance-none + our own chevron: the native control was
                      the only OS-chrome element left on a page of custom
                      toggles, and it rendered at a different height than
                      everything around it. */}
                  <span className="relative inline-flex items-center">
                    <select
                      value={alerts.breachHorizon}
                      onChange={(e) =>
                        setAlerts((prev) => ({ ...prev, breachHorizon: e.target.value }))
                      }
                      className="appearance-none rounded-control border border-edge-dark bg-surface py-2 pl-3 pr-9 text-body-sm text-chalk-hi transition-colors duration-hover ease-out hover:border-chalk-lo/40 focus:border-lime focus:outline-none"
                    >
                      <option value="15">15 days before breach</option>
                      <option value="30">30 days before breach (Recommended)</option>
                      <option value="60">60 days before breach</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-chalk-lo"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              ) : null}
            </div>

            {/* Rule 2: Overdue Invoices */}
            <div className="flex items-center justify-between p-5 rounded-card border border-edge-dark bg-surface-2/60 shadow-card">
              <div className="flex items-center gap-3.5">
                <AlertTriangle className="h-4.5 w-4.5 text-caution shrink-0" />
                <div>
                  <p className="text-body-sm font-semibold text-chalk-hi">Payment Delay Anomaly (AI Model 3)</p>
                  <p className="mt-0.5 text-[12px] text-chalk-lo">
                    Alert when customer delay diverges by &gt; 14 days beyond their typical payment pattern.
                  </p>
                </div>
              </div>
              <Switch
                checked={alerts.overdueAnomalies}
                onCheckedChange={() => handleAlertToggle('overdueAnomalies')}
              />
            </div>

            {/* Rule 3: Large Outflows */}
            <div className="flex items-center justify-between p-5 rounded-card border border-edge-dark bg-surface-2/60 shadow-card">
              <div className="flex items-center gap-3.5">
                <Clock className="h-4.5 w-4.5 text-info shrink-0" />
                <div>
                  <p className="text-body-sm font-semibold text-chalk-hi">Large Outflow Reminders</p>
                  <p className="mt-0.5 text-[12px] text-chalk-lo">
                    Notify 5 days prior to recurring obligations (Salaries ₹2.68L, GST ₹48k).
                  </p>
                </div>
              </div>
              <Switch
                checked={alerts.largeOutflows}
                onCheckedChange={() => handleAlertToggle('largeOutflows')}
              />
            </div>

            {/* Rule 4: Weekly Digest */}
            <div className="flex items-center justify-between p-5 rounded-card border border-edge-dark bg-surface-2/60 shadow-card">
              <div className="flex items-center gap-3.5">
                <FileText className="h-4.5 w-4.5 text-lime shrink-0" />
                <div>
                  <p className="text-body-sm font-semibold text-chalk-hi">Weekly Executive Cash Digest</p>
                  <p className="mt-0.5 text-[12px] text-chalk-lo">
                    Receive a 1-page executive liquidity summary every Monday at 8:00 AM.
                  </p>
                </div>
              </div>
              <Switch
                checked={alerts.weeklyDigest}
                onCheckedChange={() => handleAlertToggle('weeklyDigest')}
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" size="md" disabled={saving} className="rounded-control px-6 font-semibold">
            {saving ? (
              'Saving changes…'
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" /> Save notification rules
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
