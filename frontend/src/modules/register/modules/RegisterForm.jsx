import InputField           from '../elements/InputField'
import PasswordField        from '../elements/PasswordField'
import ConfirmPasswordField from '../elements/ConfirmPasswordField'
import CountryDropdown      from '../elements/CountryDropdown'
import RegisterButton       from '../elements/RegisterButton'
import ErrorMessage         from '../elements/ErrorMessage'

const RegisterForm = ({ values, errors, serverError, loading, onChange, onSubmit }) => (
  <form className="modal-form" onSubmit={onSubmit} noValidate>
    <InputField
      label="Username" name="username" icon="bi-person-fill"
      value={values.username} onChange={onChange} error={errors.username}
      placeholder="Enter your username"
    />
    <InputField
      label="Email" name="email" type="email" icon="bi-envelope-fill"
      value={values.email} onChange={onChange} error={errors.email}
      placeholder="Enter your email"
    />
    <PasswordField
      label="Password" name="password"
      value={values.password} onChange={onChange} error={errors.password}
      placeholder="Enter your password"
    />
    <ConfirmPasswordField
      value={values.confirmPassword} onChange={onChange} error={errors.confirmPassword}
    />
    <CountryDropdown value={values.country} onChange={onChange} error={errors.country} />
    <ErrorMessage message={serverError} />
    <RegisterButton loading={loading} />
  </form>
)

export default RegisterForm