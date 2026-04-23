import { useState } from 'react'

const PasswordField = ({ value, onChange, error }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="form-group">
      <label htmlFor="password"><i className="bi bi-lock-fill"></i> Password</label>
      <div style={{ position: 'relative' }}>
        <input
          id="password" name="password"
          type={show ? 'text' : 'password'}
          value={value} onChange={onChange}
          placeholder="Enter your password"
          className={`form-input ${error ? 'input-error' : ''}`}
          style={{ paddingRight: '44px' }}
        />
        <button type="button" onClick={() => setShow(s => !s)} className="pw-toggle-btn">
          <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`}></i>
        </button>
      </div>
      {error && <span className="field-error"><i className="bi bi-exclamation-circle"></i> {error}</span>}
    </div>
  )
}

export default PasswordField