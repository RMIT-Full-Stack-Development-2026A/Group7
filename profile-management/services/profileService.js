// Service layer for Profile Management module
const profileModel = require('../models/profileModel');

const getUserProfile = async (userId) => {
  // Business logic for profile
  return await profileModel.getProfileByUserId(userId);
};

const updateUserProfile = async (userId, updates) => {
  // Business logic for updating profile
  return await profileModel.updateProfile(userId, updates);
};

const getUserSettings = async (userId) => {
  // Business logic for settings
  return await profileModel.getSettingsByUserId(userId);
};

const updateUserSettings = async (userId, updates) => {
  // Business logic for updating settings
  return await profileModel.updateSettings(userId, updates);
};

const getUserMailbox = async (userId) => {
  // Business logic for mailbox
  return await profileModel.getMailboxByUserId(userId);
};

const manageUserSubscription = async (userId, subscriptionData) => {
  // Business logic for subscription
  return await profileModel.manageSubscription(userId, subscriptionData);
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  getUserMailbox,
  manageUserSubscription
};