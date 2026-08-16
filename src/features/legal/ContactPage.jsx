import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import Button from '@/components/shared/Button';
import EyebrowLabel from '@/components/shared/EyebrowLabel';
import { useToast } from '@/components/shared/Toast';

export default function ContactPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: 'Message sent successfully',
        description: 'Our team will get back to you within 24 business hours.',
        tone: 'healthy',
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-void py-16 px-5 md:px-8 text-chalk-hi">
      <div className="mx-auto max-w-4xl space-y-10">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-body-sm text-chalk-lo hover:text-lime transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to CashTwin
          </Link>
          <EyebrowLabel filled>Get In Touch</EyebrowLabel>
          <h1 className="mt-4 font-display text-display-lg text-chalk-hi">Contact CashTwin</h1>
          <p className="mt-2 text-body-sm text-chalk-lo max-w-xl">
            Have questions about our cash-flow forecasting platform, consent governance, or pilot deployments for your MSME? We&apos;re here to help.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
          {/* Contact Details Column */}
          <div className="space-y-6">
            <div className="rounded-xl border border-edge-dark bg-surface p-6 shadow-sm space-y-5">
              <h2 className="font-display text-base font-semibold text-chalk-hi">Contact Details</h2>

              <div className="space-y-4 text-body-sm">
                <div className="flex items-start gap-3">
                  <Mail className="h-4.5 w-4.5 text-lime shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label-xs uppercase text-chalk-lo font-semibold">General Support</p>
                    <a href="mailto:support@cashtwin.in" className="text-chalk-hi hover:text-lime transition-colors">
                      support@cashtwin.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label-xs uppercase text-chalk-lo font-semibold">Grievance &amp; Privacy</p>
                    <a href="mailto:privacy@cashtwin.in" className="text-chalk-hi hover:text-lime transition-colors">
                      privacy@cashtwin.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4.5 w-4.5 text-lime shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label-xs uppercase text-chalk-lo font-semibold">Phone Inquiries</p>
                    <p className="text-chalk-hi font-mono">+91 (022) 6940 3200</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4.5 w-4.5 text-lime shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label-xs uppercase text-chalk-lo font-semibold">Headquarters</p>
                    <p className="text-chalk-lo">
                      CashTwin Financial Technologies<br />
                      BKC Commercial Complex, Bandra East<br />
                      Mumbai, Maharashtra 400051, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-edge-dark bg-surface-2/60 p-5 text-body-sm text-chalk-lo">
              <p className="font-semibold text-chalk-hi mb-1">Operating Hours</p>
              <p>Monday to Friday: 9:00 AM – 6:00 PM IST</p>
              <p className="text-[12px] mt-1 text-lime font-medium">Average email response time: &lt; 4 hours</p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="rounded-xl border border-edge-dark bg-surface p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime-16 text-lime">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-bold text-chalk-hi">Thank you for reaching out!</h2>
                <p className="text-body-sm text-chalk-lo max-w-md mx-auto">
                  We have received your message. Our team will review your inquiry and connect with you shortly.
                </p>
                <Button variant="secondary" onClick={() => setSubmitted(false)} className="rounded-lg mt-4">
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-display text-lg font-semibold text-chalk-hi">Send us a message</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-label-xs uppercase text-chalk-lo font-semibold mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mark Hussain"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-edge-dark bg-surface-2 px-3.5 py-2.5 text-body-sm text-chalk-hi focus:border-lime focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-label-xs uppercase text-chalk-lo font-semibold mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. mark@business.in"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-lg border border-edge-dark bg-surface-2 px-3.5 py-2.5 text-body-sm text-chalk-hi focus:border-lime focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-label-xs uppercase text-chalk-lo font-semibold mb-1.5">
                      Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shree Balaji Furniture"
                      value={form.businessName}
                      onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                      className="w-full rounded-lg border border-edge-dark bg-surface-2 px-3.5 py-2.5 text-body-sm text-chalk-hi focus:border-lime focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-label-xs uppercase text-chalk-lo font-semibold mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98200 00000"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-lg border border-edge-dark bg-surface-2 px-3.5 py-2.5 text-body-sm text-chalk-hi focus:border-lime focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-xs uppercase text-chalk-lo font-semibold mb-1.5">
                    Your Message / Inquiry *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we assist your business or address your questions?"
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full rounded-lg border border-edge-dark bg-surface-2 px-3.5 py-2.5 text-body-sm text-chalk-hi focus:border-lime focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="md" disabled={loading} className="rounded-lg px-6 font-semibold">
                    {loading ? (
                      'Sending message…'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1.5" /> Send message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
