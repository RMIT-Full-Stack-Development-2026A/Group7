import { useNavigate } from 'react-router-dom'
import { useForm }     from '../hooks/useForm'
import { useLogin }    from '../hooks/useLogin'
import LoginForm       from '../modules/LoginForm'
import './LoginPage.css'

const INITIAL = { identifier: '', password: '' }

const LoginPage = () => {
  const { values, errors, setErrors, handleChange } = useForm(INITIAL)
  const { loading, serverError, lockInfo, successMessage, handleLogin } = useLogin()
  const navigate = useNavigate()

  return (
    <div className="login-page">
      <div className="reg-bg-gradient"></div>
      <div className="reg-bg-grid"></div>
      <div className="reg-shapes">
        <span>✕</span><span>○</span>
        <span>✕</span><span>○</span>
      </div>
      <div className="login-center">
        <div className="login-card glass-panel">
          <div className="reg-header">
            <div className="reg-logo">
              <span className="reg-logo-icon">✕○</span>
              <div>
                <span className="reg-logo-main">TicTacToang</span>
                <span className="reg-logo-sub">ONLINE GAMING PLATFORM</span>
              </div>
            </div>
            <p className="reg-desc">Welcome back! Sign in to continue</p>
          </div>
          {successMessage && (
            <div className="success-message">
              <i className="bi bi-check-circle-fill"></i> {successMessage}
            </div>
          )}
          <LoginForm
            values={values} errors={errors}
            serverError={serverError} loading={loading} lockInfo={lockInfo}
            onChange={handleChange}
            onSubmit={(e) => { e.preventDefault(); handleLogin(values, setErrors) }}
          />
          <div className="login-footer">
            <p className="reg-footer">Don't have an account?</p>
            <button type="button" className="btn-register-switch" onClick={() => navigate('/register')}>
              <i className="bi bi-person-plus-fill"></i> Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage