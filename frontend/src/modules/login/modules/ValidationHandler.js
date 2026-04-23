export const validateLoginForm = ({ identifier, password }) => ({
  identifier: !identifier?.trim() ? 'Please enter your username or email.' : '',
  password:   !password           ? 'Please enter your password.'          : '',
})