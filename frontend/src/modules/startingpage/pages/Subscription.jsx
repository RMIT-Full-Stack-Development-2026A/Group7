import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Crown, ExternalLink, Mail, ShieldCheck, Star, WalletCards } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import { useSubscription } from '../hooks/useSubscription.js';

const BENEFITS = [
  'Premium icon badge',
  'Special UI themes',
  'Advanced match insights',
  'Priority support',
];

const formatDate = (value) => new Intl.DateTimeFormat('en', {
  month: 'short', day: 'numeric', year: 'numeric',
}).format(value);

const StatusAlert = ({ status }) => {
  if (!status.message) return null;
  const tone = status.type === 'error'
    ? 'subscription-alert-error border-red-400/40 bg-red-500/10 text-red-100'
    : status.type === 'success'
      ? 'subscription-alert-success border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
      : 'subscription-alert-info border-cyan-400/40 bg-cyan-500/10 text-cyan-100';
  return <div className={`subscription-alert mt-6 rounded-2xl border px-4 py-3 text-sm ${tone}`}>{status.message}</div>;
};

const ReceiptCard = ({ receipt }) => {
  if (!receipt) return null;
  return (
    <div className="subscription-receipt mt-6 rounded-2xl p-4 text-sm text-slate-200">
      <p className="font-semibold text-white">Payment receipt</p>
      <p className="mt-2">Amount: ${Number(receipt.amount).toFixed(2)} {receipt.currency}</p>
      <p>Provider: {receipt.provider}</p>
      <p>PayPal account: {receipt.paypalEmail}</p>
      <p>Order ID: {receipt.orderId}</p>
      <p>Capture ID: {receipt.captureId}</p>
      <p>Premium until: {formatDate(receipt.endDate)}</p>
      <p>Email receipt: {receipt.emailReceipt?.ok ? `Sent to ${receipt.email}` : 'Not sent'}</p>
    </div>
  );
};

export function Subscription() {
  const navigate = useNavigate();
  const { apiLoading, status, receipt, handlePayWithPayPal } = useSubscription();

  return (
    <div className="full-bleed-page neon-page p-6 lg:px-10">
      <div className="neon-shell w-full">
        <button
          onClick={() => navigate(ROUTES.MAIN_MENU)}
          className="neon-outline-button neon-back-button mb-6 inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to menu
        </button>

        <div className="neon-card neon-card-strong rounded-[2rem] p-8 shadow-2xl lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">
                <Star className="w-4 h-4" /> Premium feature
              </div>
              <h1 className="mt-5 text-4xl font-bold text-white">Monthly subscription</h1>
              <p className="neon-helper-text mt-3 max-w-3xl">
                Pay $10 USD monthly with a real PayPal wallet checkout. Premium status is recorded on your profile only after PayPal confirms the payment.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="subscription-panel neon-secondary-panel rounded-3xl border p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <Crown className="h-6 w-6 text-amber-300" />
                    <h2 className="text-2xl font-bold text-white">Premium Monthly</h2>
                  </div>
                  <p className="neon-helper-text mt-2">Billed monthly through PayPal Checkout.</p>
                </div>
                <div className="rounded-2xl bg-amber-400 px-4 py-2 text-xl font-bold text-slate-950">$10</div>
              </div>

              <ul className="mt-6 grid gap-3 text-sm neon-helper-text sm:grid-cols-2">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="subscription-payment-form mt-8 rounded-3xl border p-5">
                <div className="flex items-center gap-3">
                  <WalletCards className="h-5 w-5 text-amber-300" />
                  <div>
                    <p className="font-semibold text-white">PayPal wallet</p>
                    <p className="subscription-muted text-xs">You will sign in on PayPal and approve the $10 USD payment.</p>
                  </div>
                </div>
                <div className="subscription-alert subscription-alert-info mt-5 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                  After approval, PayPal returns you here so the backend can capture the order and activate Premium.
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayWithPayPal}
                disabled={apiLoading}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-4 text-base font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {apiLoading ? 'Processing PayPal checkout...' : 'Pay $10 with PayPal wallet'}
                <ExternalLink className="h-4 w-4" />
              </button>
            </section>

            <section className="subscription-panel neon-secondary-panel rounded-3xl border p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-cyan-300" />
                <h2 className="text-2xl font-bold text-white">Checkout record</h2>
              </div>

              <div className="mt-6 space-y-4 text-sm neon-helper-text">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Billing cycle</span>
                  <span className="font-semibold text-white">Monthly</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Provider</span>
                  <span className="font-semibold text-white">PayPal</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Payment method</span>
                  <span className="font-semibold text-white">PayPal wallet</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Premium status</span>
                  <span className="font-semibold text-emerald-300">{receipt ? 'Active' : 'Pending payment'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Email notification</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-white">
                    <Mail className="h-4 w-4" />
                    {receipt?.emailReceipt?.ok ? 'Sent' : receipt ? 'Not sent' : 'Ready'}
                  </span>
                </div>
              </div>

              <StatusAlert status={status} />
              <ReceiptCard receipt={receipt} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subscription;
