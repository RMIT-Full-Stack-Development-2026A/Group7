import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import ROUTES from '../../../router/routes.config';

const plans = [
  {
    name: 'Starter',
    price: '$4.99',
    description: 'Access to premium avatars and seasonal events.',
    features: ['Premium icon badge', 'Early game access'],
  },
  {
    name: 'Pro',
    price: '$9.99',
    description: 'Everything in Starter plus exclusive rewards and custom themes.',
    features: ['Advanced match insights', 'Special UI themes'],
  },
  {
    name: 'Elite',
    price: '$14.99',
    description: 'Full access to all premium content and admin perks.',
    features: ['Priority support', 'Golden badge', 'Unlimited subscriptions'],
  },
];

export function Subscription() {
  const navigate = useNavigate();

  return (
    <div className="full-bleed-page neon-page p-6 lg:px-10">
      <div className="neon-shell w-full">
        <button
          onClick={() => navigate(ROUTES.MAIN_MENU)}
          className="neon-outline-button neon-back-button mb-6 inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to menu
        </button>

        <div className="neon-card neon-card-strong rounded-[2rem] p-10 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">
                <Star className="w-4 h-4" /> Premium feature
              </div>
              <h1 className="mt-5 text-4xl font-bold">Subscription access</h1>
              <p className="neon-helper-text mt-3 max-w-3xl">Unlock premium features, get priority benefits, and support the game with a subscription.</p>
            </div>
            <div className="neon-secondary-panel rounded-3xl p-6">
              <p className="font-semibold text-white">Instant access to premium content</p>
              <p className="neon-helper-text mt-2 text-sm">Choose a plan below to upgrade your account and enjoy exclusive perks.</p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="neon-secondary-panel rounded-3xl border p-6 shadow-xl transition hover:-translate-y-1 hover:border-amber-400">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <div className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950">Popular</div>
                </div>
                <p className="mt-4 text-3xl font-bold">{plan.price}</p>
                <p className="neon-helper-text mt-2 text-sm">{plan.description}</p>
                <ul className="mt-5 space-y-3 text-sm neon-helper-text">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => alert(`You selected the ${plan.name} plan!`)}
                  className="mt-8 w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300"
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

