import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const [form, setForm]     = useState({ usernameOrEmail: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login: setUser }  = useAuth();
  const nav = useNavigate();

  function onChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { user } = await login(form);
      setUser(user);
      nav('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="page" style={{ maxWidth: 420, paddingTop: '4rem' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary2)' }}>Sign In</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Username or Email</label>
            <input name="usernameOrEmail" value={form.usernameOrEmail} onChange={onChange} required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={onChange} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
