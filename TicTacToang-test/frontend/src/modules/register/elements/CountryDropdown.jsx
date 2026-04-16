const COUNTRIES = [
  'Vietnam', 'United States', 'United Kingdom', 'Australia', 'Canada',
  'France', 'Germany', 'Japan', 'South Korea', 'China', 'Singapore',
  'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'India', 'Brazil',
  'Italy', 'Spain', 'Netherlands', 'Sweden', 'New Zealand', 'Other',
]

const CountryDropdown = ({ value, onChange, error }) => (
  <div className="form-group">
    <label htmlFor="country"><i className="bi bi-globe"></i> Country</label>
    <select
      id="country"
      name="country"
      value={value}
      onChange={onChange}
      className={`form-input form-select ${!value ? 'select-placeholder' : ''} ${error ? 'input-error' : ''}`}
    >
      <option value="">-- Select your country --</option>
      {COUNTRIES.map((country) => (
        <option key={country} value={country}>{country}</option>
      ))}
    </select>
    {error && <span className="field-error"><i className="bi bi-exclamation-circle"></i> {error}</span>}
  </div>
)

export default CountryDropdown
