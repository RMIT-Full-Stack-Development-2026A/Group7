import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation }    from 'react-router-dom'
import { validateLoginForm }           from '../modules/ValidationHandler'
import { loginPlayer }                 from '../services/authService'
import ROUTES                         from '../../../router/routes.config.js'

export const useLogin = () => {
  const [loading,     setLoading]     = useState(false)
  const [serverError, setServerError] = useState('')
  const [lockInfo,    setLockInfo]    = useState({ attempts: 0, locked: false, secondsLeft: 0 })
  const timerRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message || ''

  useEffect(() => {
    if (lockInfo.locked && lockInfo.secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setLockInfo(prev => {
          const next = prev.secondsLeft - 1
          if (next <= 0) { clearInterval(timerRef.current); return { attempts: 0, locked: false, secondsLeft: 0 } }
          return { ...prev, secondsLeft: next }
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [lockInfo.locked])

  const handleLogin = async (values, setErrors) => {
    if (lockInfo.locked) return
    const errs = validateLoginForm(values)
    if (Object.values(errs).some(e => e !== '')) { setErrors(errs); return }

    setLoading(true)
    setServerError('')
    try {
      const { data, ok, status } = await loginPlayer(values)
      if (ok) {
        if (data.token) localStorage.setItem('token', data.token)
        if (data.user)  localStorage.setItem('authUser', JSON.stringify(data.user))
        setLockInfo({ attempts: 0, locked: false, secondsLeft: 0 })
        // Admin → go straight to admin panel; everyone else → main menu
        const destination = data.user?.role === 'admin' ? ROUTES.ADMIN : ROUTES.MAIN_MENU
        navigate(destination, { replace: true })
      } else {
        const newAttempts = lockInfo.attempts + 1
        if (status === 403 && data.locked) {
          setLockInfo({
            attempts: newAttempts,
            locked: true,
            secondsLeft: data.secondsLeft || 60,
          })
          setServerError(data.message || 'Too many failed attempts. Please wait and try again.')
        } else if (status === 403) {
          setServerError(data.message || 'Your account has been deactivated. Contact support.')
        } else if (newAttempts >= 5) {
          setLockInfo({ attempts: newAttempts, locked: true, secondsLeft: 60 })
        } else {
          setLockInfo(prev => ({ ...prev, attempts: newAttempts }))
          setServerError(data.message || 'Invalid username/email or password.')
        }
      }
    } catch {
      setServerError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return { loading, serverError, lockInfo, successMessage, handleLogin }
}
