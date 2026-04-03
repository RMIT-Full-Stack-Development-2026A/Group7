import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const nav = useNavigate();

  const cards = [
    { label: '🎮 Local 2-Player', desc: 'Play on this PC with a friend', action: () => nav('/game/local'), btn: 'Play Local' },
    { label: '🌐 Online Arena',   desc: 'Create or join an online room',  action: () => nav('/game/arena'), btn: 'Go Online' },
    { label: '👤 My Profile',     desc: 'View stats and game history',    action: () => nav('/profile'),    btn: 'Open Profile' },
    ...(!user?.premiumStatus ? [{ label: '⭐ Go Premium', desc: 'Unlock online play & more', action: () => nav('/premium'), btn: 'View Plans' }] : []),
    ...(user?.role === 'admin'  ? [{ label: '🛡 Admin Panel', desc: 'Manage users & games',   action: () => nav('/admin'),   btn: 'Admin Panel', admin: true }] : []),
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary2)' }}>
          Welcome back, {user?.username}!
          {user?.premiumStatus && <span className="badge-premium" style={{ marginLeft: 12 }}>PREMIUM</span>}
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Ready to play some Tic-Tac-Toe?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: c.admin ? '#f59e0b' : 'var(--primary2)' }}>{c.label}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', flexGrow: 1 }}>{c.desc}</p>
            <button className={c.admin ? 'btn-ghost' : 'btn-primary'} onClick={c.action}>{c.btn}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
