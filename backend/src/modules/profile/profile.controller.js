const profileService = require('./profile.service')

const DEFAULT_PROFILE_USER_ID = 'admin'
const PROFILE_PLACEHOLDER_USER_ID = 'TheOneWhoAsked'

const resolveUserId = async (req) => {
  const resolvedUserId = await profileService.resolveExistingUserId({
    authenticatedUserId: req.user?.userId || req.user?.id,
    userId: req.query?.userId || req.body?.userId,
    username: req.query?.username || req.body?.username,
    email: req.query?.email || req.body?.email,
  })

  if (resolvedUserId && resolvedUserId !== PROFILE_PLACEHOLDER_USER_ID) {
    return resolvedUserId
  }

  return DEFAULT_PROFILE_USER_ID
}
const getStatusCode = (error) => error.statusCode || 500

const getProfile = async (req, res) => {
  try {
    const profile = await profileService.getUserProfile(await resolveUserId(req))
    res.json(profile)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const result = await profileService.updateUserProfile(await resolveUserId(req), req.body)
    res.json(result)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const getSettings = async (req, res) => {
  try {
    const settings = await profileService.getUserSettings(await resolveUserId(req))
    res.json(settings)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const updateSettings = async (req, res) => {
  try {
    const result = await profileService.updateUserSettings(await resolveUserId(req), req.body)
    res.json(result)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const manageSubscription = async (req, res) => {
  try {
    const result = await profileService.manageUserSubscription(await resolveUserId(req), req.body)
    res.json(result)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const createPayPalSubscriptionOrder = async (req, res) => {
  try {
    const result = await profileService.createPayPalSubscriptionOrder(await resolveUserId(req), req.body)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message, details: error.details })
  }
}

const capturePayPalSubscriptionOrder = async (req, res) => {
  try {
    const result = await profileService.capturePayPalSubscriptionOrder(await resolveUserId(req), req.body)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message, details: error.details })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  manageSubscription,
  createPayPalSubscriptionOrder,
  capturePayPalSubscriptionOrder,
}
