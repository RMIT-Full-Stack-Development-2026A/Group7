import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  async function handleLogout() {
    await logout();
    nav('/login');
  }

  return (
    <nav style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
    }}>
      <Link to="/dashboard" style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary2)', letterSpacing: 1 }}>
        TicTacToang
      </Link>

      {user && (
        <>
          <Link to="/dashboard">Home</Link>
          <Link to="/game/local">Local Game</Link>
          <Link to="/game/arena">Online</Link>
          {!user.premiumStatus && <Link to="/premium">⭐ Go Premium</Link>}
          <Link to="/profile">Profile</Link>
          {user.role === 'admin' && <Link to="/admin" style={{ color: '#f59e0b' }}>Admin</Link>}
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user.premiumStatus && <span className="badge-premium">PREMIUM</span>}
            <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
              {user.avatar && <img src={user.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle', marginRight: 6 }} />}
              {user.username}
            </span>
            <button className="btn-ghost" style={{ padding: '0.3rem 0.8rem', fontSize: '0.82rem' }} onClick={handleLogout}>
              Logout
            </button>
          </span>
        </>
      )}
    </nav>
  );
}
