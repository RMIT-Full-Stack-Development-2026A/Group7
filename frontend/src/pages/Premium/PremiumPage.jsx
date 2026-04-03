import { useEffect, useState } from 'react';
import { listPlans, purchase, mySubscription } from '../../services/subscription.service';
import { useAuth } from '../../hooks/useAuth';
import { getMe } from '../../services/auth.service';

export default function PremiumPage() {
  const { user, setUser }       = useAuth();
  const [plans, setPlans]       = useState([]);
  const [sub, setSub]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [buying, setBuying]     = useState(null);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    Promise.all([listPlans(), mySubscription().catch(() => null)])
      .then(([p, s]) => { setPlans(p); setSub(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handlePurchase(planId) {
    setBuying(planId); setError(''); setSuccess('');
    try {
      const result = await purchase({ planId, paymentMethod: 'wallet' });
      setSuccess(result.message || 'Subscription activated!');
      setSub(result.subscription);
      // Refresh user
      const me = await getMe();
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
    } catch (e) {
      setError(e.message);
    } finally { setBuying(null); }
  }

  if (loading) return <div className="spinner" />;

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h2 style={{ color: 'var(--primary2)', marginBottom: '0.5rem' }}>Premium Plans</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        Unlock online multiplayer, game replay, and custom markers.
      </p>

      {user?.premiumStatus && sub && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: '#d97706' }}>
          <p style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ You have an active Premium subscription</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Expires: {new Date(sub.endDate || user.subscriptionEndDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {error   && <p className="error-msg"   style={{ marginBottom: '1rem' }}>{error}</p>}
      {success && <p className="success-msg" style={{ marginBottom: '1rem' }}>{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
        {plans.map((plan) => (
          <div key={plan.planId} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderColor: plan.planId === 'monthly-gold' ? '#d97706' : 'var(--border)' }}>
            <h3 style={{ color: plan.planId === 'monthly-gold' ? '#f59e0b' : 'var(--primary2)' }}>
              {plan.planId === 'monthly-gold' ? '⭐ ' : ''}{plan.name}
            </h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              ${plan.price} <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 400 }}>/ {plan.durationDays} days</span>
            </p>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {plan.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <button
              className="btn-primary"
              onClick={() => handlePurchase(plan.planId)}
              disabled={!!buying || user?.premiumStatus}
              style={{ marginTop: 'auto' }}
            >
              {buying === plan.planId ? 'Processing…' : user?.premiumStatus ? 'Already subscribed' : 'Subscribe (simulated)'}
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
        ℹ️ Payment is simulated — no real charges are made.
      </p>
    </div>
  );
}
