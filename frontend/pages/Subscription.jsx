import { useNavigate } from 'react-router';
import { Star, ArrowLeft } from 'lucide-react';

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
    description: 'Everything in Starter plus rank boosts and exclusive rewards.',
    features: ['Ranked performance analytics', 'Special UI themes'],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to menu
        </button>

        <div className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl ring-1 ring-white/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">
                <Star className="w-4 h-4" /> Premium feature
              </div>
              <h1 className="mt-5 text-4xl font-bold">Subscription access</h1>
              <p className="mt-3 max-w-2xl text-slate-400">Unlock premium features, get priority benefits, and support the game with a subscription.</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-6 text-slate-300">
              <p className="font-semibold text-slate-100">Instant access to premium content</p>
              <p className="mt-2 text-sm">Choose a plan below to upgrade your account and enjoy exclusive perks.</p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-xl transition hover:-translate-y-1 hover:border-amber-400">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <div className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950">Popular</div>
                </div>
                <p className="mt-4 text-3xl font-bold">{plan.price}</p>
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                <ul className="mt-5 space-y-3 text-sm text-slate-300">
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
