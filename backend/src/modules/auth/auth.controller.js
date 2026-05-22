const authService = require('./auth.service')
const { validateRegisterInput, validateLoginInput, validateChangePasswordInput } = require('./auth.validator')

const getAllUsers = async (_, res, next) => {
  try {
    const users = await authService.getAllUsers()
    return res.status(200).json(users)
  } catch (err) {
    next(err)
  }
}

const register = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegisterInput(req.body)
    if (!isValid) return res.status(400).json({ message: 'Validation failed.', errors })

    const { name, username, email, password, country } = req.body
    const user = await authService.register({ name, username, email, password, country })
    return res.status(201).json({ message: 'Account created successfully.', user })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLoginInput(req.body)
    if (!isValid) return res.status(400).json({ message: 'Validation failed.', errors })

    const { identifier, password } = req.body
    const result = await authService.login(identifier, password)
    return res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    const result = authService.logout(req.token)
    return res.status(200).json({ success: true, message: 'Logged out.', revoked: Boolean(result?.revoked) })
  } catch (err) {
    next(err)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body || {}
    const { isValid, errors } = validateChangePasswordInput({ oldPassword, newPassword, confirmNewPassword })
    if (!isValid) return res.status(400).json({ message: 'Validation failed.', errors })

    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ message: 'Authentication required.' })

    await authService.changePassword(userId, { oldPassword, newPassword })
    return res.status(200).json({ success: true, message: 'Password updated successfully.' })
  } catch (err) {
    if (err.statusCode && err.statusCode < 500) {
      return res.status(err.statusCode).json({
        message: err.message,
        errors: err.errors || undefined,
      })
    }
    next(err)
  }
}

module.exports = {
  getAllUsers,
  register,
  login,
  logout,
  changePassword,
}
