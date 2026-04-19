const validateRegisterInput = ({ name, username, email, password, country }) => {
  const errors = {}

  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.name = 'Name must be a string.'
    } else if (name.trim().length < 3 || name.trim().length > 50) {
      errors.name = 'Name must be 3-50 characters.'
    }
  }

  if (!username) {
    errors.username = 'Username is required.'
  } else if (username.length < 3 || username.length > 30) {
    errors.username = 'Username must be 3-30 characters.'
  } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.username = 'Only letters, numbers, _ and - allowed.'
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (email.length >= 255) {
    errors.email = 'Email must be less than 255 characters.'
  } else if (/[();\s:]/.test(email)) {
    errors.email = 'Email contains prohibited characters.'
  } else {
    const parts = email.split('@')
    if (parts.length !== 2) errors.email = 'Must contain exactly one @.'
    else if (!parts[1].includes('.')) errors.email = 'Must contain a dot after @.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 8) {
    errors.password = 'At least 8 characters.'
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'At least 1 number.'
  } else if (!/[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(password)) {
    errors.password = 'At least 1 special character.'
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'At least 1 uppercase letter.'
  }

  if (!country) errors.country = 'Country is required.'

  return { isValid: Object.keys(errors).length === 0, errors }
}

const validateLoginInput = ({ identifier, password }) => {
  const errors = {}
  if (!identifier?.trim()) errors.identifier = 'Username or email is required.'
  if (!password) errors.password = 'Password is required.'
  return { isValid: Object.keys(errors).length === 0, errors }
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
}
