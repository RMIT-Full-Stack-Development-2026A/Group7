const mongoose = require('mongoose')
const User = require('../modules/auth/auth.model')

const SUSPENDED_RESPONSE = {
  message: 'Your account is suspended by an administrator. Contact support to reactivate.',
  code: 'ACCOUNT_SUSPENDED',
}

// Express middleware: rejects requests from deactivated users.
// MUST be mounted after `authenticate` so req.user is populated.
// Tolerates absent req.user (e.g. routes using optionalAuthenticate) by
// only enforcing the check when a JWT identity is present.
const requireActiveAccount = async (req, res, next) => {
  const userId = req.user?.userId || req.user?.id
  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    return next()
  }

  try {
    const user = await User.findById(userId).select('accountStatus').lean()
    if (user?.accountStatus === 'inactive') {
      return res.status(403).json(SUSPENDED_RESPONSE)
    }
  } catch {
    // If the lookup fails, fall through — auth has already validated the token.
  }

  return next()
}

module.exports = {
  requireActiveAccount,
}
