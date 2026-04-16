import PasswordField from './PasswordField'

const ConfirmPasswordField = ({ value, onChange, error }) => (
  <PasswordField
    label="Confirm Password" name="confirmPassword"
    value={value} onChange={onChange} error={error}
    placeholder="Re-enter your password"
  />
)

export default ConfirmPasswordField