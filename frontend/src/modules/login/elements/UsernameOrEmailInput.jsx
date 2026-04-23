const UsernameOrEmailInput = ({ value, onChange, error }) => (
  <div className="form-group">
    <label htmlFor="identifier">
      <i className="bi bi-person-fill"></i> Username or Email
    </label>
    <input
      id="identifier" name="identifier" type="text"
      value={value} onChange={onChange}
      placeholder="Enter your username or email"
      className={`form-input ${error ? 'input-error' : ''}`}
    />
    {error && <span className="field-error"><i className="bi bi-exclamation-circle"></i> {error}</span>}
  </div>
)

export default UsernameOrEmailInput