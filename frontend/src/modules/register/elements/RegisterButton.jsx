const RegisterButton = ({ loading }) => (
  <button
    type="submit" className="btn-primary" disabled={loading}
    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
  >
    {loading
      ? <><i className="bi bi-hourglass-split"></i> Creating account...</>
      : <><i className="bi bi-person-plus-fill"></i> Create Account</>
    }
  </button>
)

export default RegisterButton