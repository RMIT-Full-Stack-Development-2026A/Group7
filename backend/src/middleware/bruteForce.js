const User = require('../modules/auth/auth.model')

const bruteForce = async (req, res, next) => {
  const { identifier } = req.body
  if (!identifier) return next()

  try {
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.trim() },
      ],
    })

    if (user?.lockUntil && user.lockUntil > new Date()) {
      const secondsLeft = Math.ceil((user.lockUntil - Date.now()) / 1000)
      return res.status(403).json({
        message: `Account locked. Try again in ${secondsLeft}s.`,
        locked: true,
        secondsLeft,
      })
    }
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = bruteForce
