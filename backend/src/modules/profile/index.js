// Public interface for the Profile module. Other modules MUST import from this
// file (e.g. require('../profile')) instead of reaching into profile.service.js
// or profile.repository.js directly. A.3.1 boundary file.

const profileService = require('./profile.service')

module.exports = {
  getUserProfile: profileService.getUserProfile,
  resolveExistingUserId: profileService.resolveExistingUserId,
  updateUserProfile: profileService.updateUserProfile,
  getUserSettings: profileService.getUserSettings,
  updateUserSettings: profileService.updateUserSettings,
  manageUserSubscription: profileService.manageUserSubscription,
  createPayPalSubscriptionOrder: profileService.createPayPalSubscriptionOrder,
  capturePayPalSubscriptionOrder: profileService.capturePayPalSubscriptionOrder,
}
