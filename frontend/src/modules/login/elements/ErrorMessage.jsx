const ErrorMessage = ({ message }) => {
  if (!message) return null
  return <div className="server-error-box"><i className="bi bi-shield-exclamation"></i> {message}</div>
}

export default ErrorMessage