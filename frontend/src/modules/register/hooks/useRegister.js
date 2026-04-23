import { useState }    from 'react'
import { useNavigate } from 'react-router-dom'
import { validateRegisterForm } from '../modules/ValidationHandler'
import { registerPlayer }       from '../services/authService'

export const useRegister = () => {
  const [loading,     setLoading]     = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (values, setErrors) => {
    const errs = validateRegisterForm(values)
    if (Object.values(errs).some(e => e !== '')) {
      setErrors(errs)
      return
    }
    setLoading(true)
    setServerError('')
    try {
      const { data, ok } = await registerPlayer(values)
      if (ok) {
        navigate('/login', { state: { message: 'Account created! Please sign in.' } })
      } else {
        setServerError(data.message || 'Registration failed.')
      }
    } catch {
      setServerError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return { loading, serverError, handleRegister }
}