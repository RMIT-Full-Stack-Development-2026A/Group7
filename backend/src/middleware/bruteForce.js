const User = require('../modules/auth/auth.model')

const bruteForce = async (req, res, next) => {
  // Phòng trường hợp client gửi identifier không phải string (number/object/null)
  // -> identifier.toLowerCase() throw làm middleware 500.
  const rawIdentifier = req.body?.identifier
  if (typeof rawIdentifier !== 'string') return next()
  const identifier = rawIdentifier.trim()
  if (!identifier) return next()

  try {
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
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
