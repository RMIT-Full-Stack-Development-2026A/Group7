const InputField = ({ label, name, type = 'text', value, onChange, error, placeholder, icon }) => (
  <div className="form-group">
    <label htmlFor={name}>
      {icon && <i className={`bi ${icon}`}></i>} {label}
    </label>
    <input
      id={name} name={name} type={type}
      value={value} onChange={onChange}
      placeholder={placeholder} autoComplete="off"
      className={`form-input ${error ? 'input-error' : ''}`}
    />
    {error && (
      <span className="field-error">
        <i className="bi bi-exclamation-circle"></i> {error}
      </span>
    )}
  </div>
)

export default InputField