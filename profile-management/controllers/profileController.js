// Controller for Profile Management module
const profileService = require('../services/profileService');

const getProfile = async (req, res) => {
  try {
    // Get userId from query parameter, body, or default to admin
    const userId = req.query.userId || req.body.userId || 'user-001';
    const profile = await profileService.getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId || 'user-001';
    const updates = req.body;
    const result = await profileService.updateUserProfile(userId, updates);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId || 'user-001';
    const settings = await profileService.getUserSettings(userId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId || 'user-001';
    const updates = req.body;
    const result = await profileService.updateUserSettings(userId, updates);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMailbox = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId || 'user-001';
    const messages = await profileService.getUserMailbox(userId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const manageSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const subscriptionData = req.body;
    const result = await profileService.manageUserSubscription(userId, subscriptionData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  getMailbox,
  manageSubscription
};