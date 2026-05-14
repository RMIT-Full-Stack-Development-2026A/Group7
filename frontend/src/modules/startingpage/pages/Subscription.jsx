import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Crown, Mail, ShieldCheck, Star } from 'lucide-react';
import ROUTES from '../../../router/routes.config';
import { useApi } from '../hooks/useApi';
import { profileService } from '../services/apiServices';

const MONTHLY_PRICE = 10;
const PAYPAL_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const benefits = [
  'Premium icon badge',
  'Special UI themes',
  'Advanced match insights',
  'Priority support',
];

const formatDate = (value) => new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(value);

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('authUser') || '{}');
  } catch {
    return {};
  }
};

export function Subscription() {
  const navigate = useNavigate();
  const api = useApi();
  const profileApi = useMemo(() => profileService(api), [api]);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [receipt, setReceipt] = useState(null);

  const hasValidPaypalEmail = PAYPAL_EMAIL_PATTERN.test(paypalEmail.trim());
  const canPay = Boolean(paymentMethod) && !api.loading;

  const persistProfileUpdate = (profile) => {
    if (!profile) {
      return;
    }

    const storedUser = getStoredUser();
    const nextUser = {
      ...storedUser,
      id: profile.userId || storedUser.id,
      name: profile.name || storedUser.name,
      username: profile.username || storedUser.username,
      email: profile.email || storedUser.email,
      avatar: profile.avatarUrl || storedUser.avatar,
      role: profile.role || storedUser.role,
      isPremium: Boolean(profile.premiumStatus),
      premiumStatus: Boolean(profile.premiumStatus),
      subscriptionEndDate: profile.subscriptionEndDate || null,
    };

    localStorage.setItem('authUser', JSON.stringify(nextUser));
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { profile } }));
  };

  const handleAddPaymentMethod = (event) => {
    event.preventDefault();

    if (!hasValidPaypalEmail) {
      setStatus({
        type: 'error',
        message: 'Enter a valid PayPal email address before adding the payment method.',
      });
      return;
    }

    setPaymentMethod({
      provider: 'paypal',
      label: 'PayPal',
      email: paypalEmail.trim().toLowerCase(),
    });
    setStatus({
      type: 'ready',
      message: 'PayPal payment method added. You can now activate the monthly subscription.',
    });
  };

  const handleSubscribe = async () => {
    if (!canPay) {
      setStatus({
        type: 'error',
        message: 'Add a PayPal payment method before starting the monthly subscription.',
      });
      return;
    }

    setStatus({ type: 'processing', message: `Processing $${MONTHLY_PRICE.toFixed(2)} with PayPal...` });

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    const storedUser = getStoredUser();

    const result = await profileApi.manageSubscription({
      userId: storedUser.id || storedUser.userId,
      username: storedUser.username,
      email: storedUser.email,
      premiumStatus: true,
      subscriptionEndDate: subscriptionEndDate.toISOString(),
      amount: MONTHLY_PRICE,
      currency: 'USD',
      provider: 'paypal',
      paypalEmail: paymentMethod.email,
      billingCycle: 'monthly',
    });

    if (!result?.success) {
      setStatus({
        type: 'error',
        message: api.error || 'Payment could not be completed. Please try again.',
      });
      return;
    }

    const profile = result.profile || {
      ...(result.user || {}),
      userId: result.user?._id || result.user?.id,
      premiumStatus: result.premiumStatus,
      subscriptionEndDate: result.subscriptionEndDate,
      avatarUrl: result.user?.avatar,
    };

    persistProfileUpdate(profile);
    setReceipt({
      provider: 'PayPal',
      amount: MONTHLY_PRICE,
      endDate: subscriptionEndDate,
      email: profile.email || 'your account email',
      paypalEmail: paymentMethod.email,
    });
    setStatus({
      type: 'success',
      message: 'Payment processed. Premium status is now active on your profile.',
    });
  };

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
              <h1 className="mt-5 text-4xl font-bold">Monthly subscription</h1>
              <p className="neon-helper-text mt-3 max-w-3xl">
                Pay $10 USD monthly with a simulated PayPal payment method. Premium status is recorded on your profile after checkout.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="neon-secondary-panel rounded-3xl border p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <Crown className="h-6 w-6 text-amber-300" />
                    <h2 className="text-2xl font-bold">Premium Monthly</h2>
                  </div>
                  <p className="neon-helper-text mt-2">Billed monthly with simulated PayPal checkout.</p>
                </div>
                <div className="rounded-2xl bg-amber-400 px-4 py-2 text-xl font-bold text-slate-950">$10</div>
              </div>

              <ul className="mt-6 grid gap-3 text-sm neon-helper-text sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <form className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5" onSubmit={handleAddPaymentMethod}>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-amber-300" />
                  <div>
                    <p className="font-semibold text-white">Add payment method</p>
                    <p className="text-xs text-slate-400">PayPal is the only supported provider for now.</p>
                  </div>
                </div>

                <label className="mt-5 block text-sm font-semibold text-white" htmlFor="paypal-email">
                  PayPal email
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="paypal-email"
                    type="email"
                    value={paypalEmail}
                    onChange={(event) => setPaypalEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300"
                  />
                  <button
                    type="submit"
                    className="min-h-12 rounded-2xl bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasValidPaypalEmail}
                  >
                    Add PayPal
                  </button>
                </div>

                {paymentMethod ? (
                  <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    PayPal added: {paymentMethod.email}
                  </div>
                ) : null}
              </form>

              <button
                type="button"
                onClick={handleSubscribe}
                disabled={!canPay}
                className="mt-8 w-full rounded-2xl bg-amber-400 px-4 py-4 text-base font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {api.loading ? 'Processing payment...' : 'Pay $10 and activate premium'}
              </button>
            </section>

            <section className="neon-secondary-panel rounded-3xl border p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-cyan-300" />
                <h2 className="text-2xl font-bold">Checkout record</h2>
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
                  <span className="font-semibold text-white">{paymentMethod?.email || 'Not added'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Premium status</span>
                  <span className="font-semibold text-emerald-300">{receipt ? 'Active' : 'Pending payment'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Email notification</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-white">
                    <Mail className="h-4 w-4" />
                    {receipt ? 'Sent' : 'Ready'}
                  </span>
                </div>
              </div>

              {status.message ? (
                <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                  status.type === 'error'
                    ? 'border-red-400/40 bg-red-500/10 text-red-100'
                    : status.type === 'success'
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                      : 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100'
                }`}
                >
                  {status.message}
                </div>
              ) : null}

              {receipt ? (
                <div className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">Payment receipt</p>
                  <p className="mt-2">Amount: ${receipt.amount.toFixed(2)} USD</p>
                  <p>Provider: {receipt.provider}</p>
                  <p>PayPal account: {receipt.paypalEmail}</p>
                  <p>Premium until: {formatDate(receipt.endDate)}</p>
                  <p>Email sent to: {receipt.email}</p>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
