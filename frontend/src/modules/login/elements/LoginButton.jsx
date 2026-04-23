const LoginButton = ({ loading }) => (
  <button
    type="submit" className="btn-primary" disabled={loading}
    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
  >
    {loading
      ? <><i className="bi bi-hourglass-split"></i> Signing in...</>
      : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
    }
  </button>
)

export default LoginButton