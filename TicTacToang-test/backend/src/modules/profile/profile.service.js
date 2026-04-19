const profileRepository = require('./profile.repository')
const profileDto = require('./profile.dto')
const profileValidator = require('./profile.validator')

const getUserProfile = async (userId) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  const profile = await profileRepository.getProfileByUserId(validatedUserId)
  return profileDto.toProfileResponse(profile)
}

const updateUserProfile = async (userId, updates) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  const validatedUpdates = profileValidator.validateProfileUpdateDto(profileDto.toProfileUpdateDto(updates))
  const result = await profileRepository.updateProfileByUserId(validatedUserId, validatedUpdates)

  return {
    success: result.success,
    profile: profileDto.toProfileResponse(result.user),
  }
}

const getUserSettings = async (userId) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  return profileRepository.getSettingsByUserId(validatedUserId)
}

const updateUserSettings = async (userId, updates) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  const validatedUpdates = profileValidator.validateSettingsUpdateDto(profileDto.toSettingsUpdateDto(updates))
  return profileRepository.updateSettingsByUserId(validatedUserId, validatedUpdates)
}

const getUserMailbox = async (userId) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  return profileRepository.getMailboxByUserId(validatedUserId)
}

const manageUserSubscription = async (userId, subscriptionData) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  const validatedSubscription = profileValidator.validateSubscriptionDto(
    profileDto.toSubscriptionDto(subscriptionData)
  )

  return profileRepository.upsertSubscriptionByUserId(validatedUserId, validatedSubscription)
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  getUserMailbox,
  manageUserSubscription,
}
