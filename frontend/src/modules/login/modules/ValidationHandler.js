export const validateLoginForm = ({ identifier, password }) => ({
  identifier: !identifier?.trim() ? 'Please enter your username or email.' : '',
  password:   !password?.trim()   ? 'Please enter your password.'          : '',
})
