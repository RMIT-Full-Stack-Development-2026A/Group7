const authService = require('./auth.service')
const { validateRegisterInput, validateLoginInput } = require('./auth.validator')

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

module.exports = {
  getAllUsers,
  register,
  login,
}
