import { useNavigate } from 'react-router-dom'
import { useForm }     from '../hooks/useForm'
import { useRegister } from '../hooks/useRegister'
import RegisterForm    from '../modules/RegisterForm'
import './RegisterPage.css'

const INITIAL = { username: '', email: '', password: '', confirmPassword: '', country: '' }

const RegisterPage = () => {
  const { values, errors, setErrors, handleChange } = useForm(INITIAL)
  const { loading, serverError, handleRegister }    = useRegister()
  const navigate = useNavigate()

  return (
    <div className="reg-page">
      <div className="reg-bg-gradient"></div>
      <div className="reg-bg-grid"></div>
      <div className="reg-shapes">
        <span>✕</span><span>○</span>
        <span>✕</span><span>○</span>
      </div>
      <div className="reg-center">
        <div className="reg-card glass-panel">
          <div className="reg-header">
            <div className="reg-logo">
              <span className="reg-logo-icon">✕○</span>
              <div>
                <span className="reg-logo-main">TicTacToang</span>
                <span className="reg-logo-sub">ONLINE GAMING PLATFORM</span>
              </div>
            </div>
            <p className="reg-desc">Create your account to start playing</p>
          </div>
          <RegisterForm
            values={values} errors={errors}
            serverError={serverError} loading={loading}
            onChange={handleChange}
            onSubmit={(e) => { e.preventDefault(); handleRegister(values, setErrors) }}
          />
          <div className="login-footer">
            <p className="reg-footer">Already have an account?</p>
            <button type="button" className="btn-register-switch" onClick={() => navigate('/login')}>
              <i className="bi bi-box-arrow-in-right"></i> Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage