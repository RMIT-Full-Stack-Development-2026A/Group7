import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/auth.service';

const COUNTRIES = [
  'Vietnam','Australia','United States','United Kingdom','Canada','Singapore',
  'Japan','South Korea','Germany','France','India','Brazil','Other',
];

function validate({ username, email, password, confirmPassword }) {
  const errs = {};
  if (!/^[a-zA-Z0-9_-]+$/.test(username))
    errs.username = 'Only letters, numbers, _ and - allowed. Example: john_doe';
  if (!/^[^\s@();\:]+@[^\s@();\:]+\.[^\s@();\:]+$/.test(email) || email.length > 254)
    errs.email = 'Enter a valid email under 254 characters. Example: user@email.com';
  if (password.length < 8 || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password) || !/[A-Z]/.test(password))
    errs.password = 'Min 8 chars, 1 number, 1 special char (!@#$%^&*), 1 uppercase. Example: Hello@123';
  if (password !== confirmPassword)
    errs.confirmPassword = 'Passwords do not match';
  return errs;
}

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', country: '' });
  const [errs, setErrs] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrs((e) => ({ ...e, [name]: undefined }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const clientErrs = validate(form);
    if (Object.keys(clientErrs).length) { setErrs(clientErrs); return; }
    setServerError(''); setLoading(true);
    try {
      await register(form);
      nav('/login', { state: { registered: true } });
    } catch (err) {
      setServerError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="page" style={{ maxWidth: 480, paddingTop: '3rem' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary2)' }}>Create Account</h2>
        <form onSubmit={onSubmit}>
          {[
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'email',    label: 'Email',    type: 'email' },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'confirmPassword', label: 'Confirm Password', type: 'password' },
          ].map(({ name, label, type }) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input name={name} type={type} value={form[name]} onChange={onChange} required />
              {errs[name] && <span className="error-msg">{errs[name]}</span>}
            </div>
          ))}

          <div className="form-group">
            <label>Country</label>
            <select name="country" value={form.country} onChange={onChange} required>
              <option value="">Select country…</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errs.country && <span className="error-msg">{errs.country}</span>}
          </div>

          {serverError && <p className="error-msg">{serverError}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
