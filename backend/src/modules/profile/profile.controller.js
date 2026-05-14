const profileService = require('./profile.service')

const DEFAULT_PROFILE_USER_ID = 'admin'
const PROFILE_PLACEHOLDER_USER_ID = 'TheOneWhoAsked'

const resolveUserId = (req) => {
  const userId = req.user?.userId || req.user?.id || req.query?.userId || req.body?.userId
  return userId && userId !== PROFILE_PLACEHOLDER_USER_ID ? userId : DEFAULT_PROFILE_USER_ID
}
const getStatusCode = (error) => error.statusCode || 500

const getProfile = async (req, res) => {
  try {
    const profile = await profileService.getUserProfile(resolveUserId(req))
    res.json(profile)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const result = await profileService.updateUserProfile(resolveUserId(req), req.body)
    res.json(result)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const getSettings = async (req, res) => {
  try {
    const settings = await profileService.getUserSettings(resolveUserId(req))
    res.json(settings)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const updateSettings = async (req, res) => {
  try {
    const result = await profileService.updateUserSettings(resolveUserId(req), req.body)
    res.json(result)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const getMailbox = async (req, res) => {
  try {
    const messages = await profileService.getUserMailbox(resolveUserId(req))
    res.json(messages)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

const manageSubscription = async (req, res) => {
  try {
    const result = await profileService.manageUserSubscription(resolveUserId(req), req.body)
    res.json(result)
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  getMailbox,
  manageSubscription,
}
