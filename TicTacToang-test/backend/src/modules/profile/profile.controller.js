const profileService = require('./profile.service');

const resolveUserId = (req) => req.query.userId || req.body.userId || req.user?.id || 'user-001';
const getStatusCode = (error) => error.statusCode || 500;

const getProfile = async (req, res) => {
  try {
    const profile = await profileService.getUserProfile(resolveUserId(req));
    res.json(profile);
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const result = await profileService.updateUserProfile(resolveUserId(req), req.body);
    res.json(result);
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await profileService.getUserSettings(resolveUserId(req));
    res.json(settings);
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const result = await profileService.updateUserSettings(resolveUserId(req), req.body);
    res.json(result);
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
};

const getMailbox = async (req, res) => {
  try {
    const messages = await profileService.getUserMailbox(resolveUserId(req));
    res.json(messages);
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
};

const manageSubscription = async (req, res) => {
  try {
    const result = await profileService.manageUserSubscription(resolveUserId(req), req.body);
    res.json(result);
  } catch (error) {
    res.status(getStatusCode(error)).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  getMailbox,
  manageSubscription,
};
