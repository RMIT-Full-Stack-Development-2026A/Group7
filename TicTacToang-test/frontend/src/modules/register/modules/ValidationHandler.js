export const validatePassword = (p) => {
  if (!p)                return 'Password is required.'
  if (p.length < 8)      return 'At least 8 characters. E.g. MyPass1!'
  if (!/[0-9]/.test(p))  return 'At least 1 number.'
  if (!/[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(p)) return 'At least 1 special character.'
  if (!/[A-Z]/.test(p))  return 'At least 1 uppercase letter.'
  return ''
}

export const validateEmail = (e) => {
  if (!e) return 'Email is required.'
  if (e.length >= 255) return 'Email must be less than 255 characters.'
  if (/[();\s:]/.test(e)) return 'Email contains prohibited characters.'
  const parts = e.split('@')
  if (parts.length !== 2) return 'Must contain exactly one @ symbol.'
  if (!parts[1].includes('.')) return 'Must contain a dot after @.'
  return ''
}

export const validateUsername = (u) => {
  if (!u) return 'Username is required.'
  if (u.length < 3 || u.length > 30) return 'Username must be 3–30 characters.'
  if (!/^[a-zA-Z0-9_-]+$/.test(u)) return 'Only letters, numbers, _ and - allowed.'
  return ''
}

export const validateCountry = (c) => (!c ? 'Please select your country.' : '')

export const validateConfirmPassword = (p, cp) => {
  if (!cp)      return 'Please confirm your password.'
  if (p !== cp) return 'Passwords do not match.'
  return ''
}

export const validateRegisterForm = ({ username, email, password, confirmPassword, country }) => ({
  username:        validateUsername(username),
  email:           validateEmail(email),
  password:        validatePassword(password),
  confirmPassword: validateConfirmPassword(password, confirmPassword),
  country:         validateCountry(country),
})