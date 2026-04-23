import UsernameOrEmailInput from '../elements/UsernameOrEmailInput'
import PasswordField        from '../elements/PasswordField'
import LoginButton          from '../elements/LoginButton'
import ErrorMessage         from '../elements/ErrorMessage'

const LoginForm = ({ values, errors, serverError, loading, lockInfo, onChange, onSubmit }) => (
  <form className="modal-form" onSubmit={onSubmit} noValidate>
    <UsernameOrEmailInput value={values.identifier} onChange={onChange} error={errors.identifier} />
    <PasswordField        value={values.password}   onChange={onChange} error={errors.password} />
    {lockInfo.attempts > 0 && !lockInfo.locked && (
      <div className="attempt-warning">
        <i className="bi bi-exclamation-triangle-fill"></i>
        {5 - lockInfo.attempts} attempt(s) remaining before account is locked.
      </div>
    )}
    {lockInfo.locked && (
      <div className="lock-warning">
        <i className="bi bi-lock-fill"></i>
        Too many failed attempts. Try again in <span className="lock-countdown">{lockInfo.secondsLeft}s</span>
      </div>
    )}
    <ErrorMessage message={serverError} />
    <LoginButton loading={loading || lockInfo.locked} />
  </form>
)

export default LoginForm