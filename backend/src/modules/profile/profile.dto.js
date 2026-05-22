const PROFILE_FIELDS = [
  'userId',
  'name',
  'username',
  'email',
  'country',
  'role',
  'premiumStatus',
  'subscriptionEndDate',
  'isActive',
  'avatarUrl',
  'createdAt',
]

const PROFILE_UPDATE_FIELDS = [
  'name',
  'username',
  'email',
  'passwordHash',
  'country',
  'role',
  'premiumStatus',
  'subscriptionEndDate',
  'isActive',
  'avatarUrl',
]

const SETTINGS_UPDATE_FIELDS = [
  'theme',
  'notifications',
  'soundEnabled',
  'language',
  'twoFactorEnabled',
]

const SUBSCRIPTION_FIELDS = [
  'premiumStatus',
  'subscriptionEndDate',
  'amount',
  'currency',
  'provider',
  'paypalEmail',
  'billingCycle',
  'receiptEmail',
  'paypalOrderId',
  'paypalCaptureId',
  'paymentStatus',
]

const pickFields = (payload, allowedFields) => {
  return allowedFields.reduce((accumulator, field) => {
    if (payload[field] !== undefined) {
      accumulator[field] = payload[field]
    }

    return accumulator
  }, {})
}

const toProfileResponseDto = (profile) => pickFields(profile, PROFILE_FIELDS)

const fromUserDocument = (user) => ({
  userId: user._id?.toString(),
  name: user.name || user.username,
  username: user.username,
  email: user.email,
  country: user.country,
  role: user.role,
  premiumStatus: Boolean(user.isPremium),
  subscriptionEndDate: user.subscriptionEndDate || null,
  isActive: user.accountStatus !== 'inactive',
  avatarUrl: user.avatar || '',
  createdAt: user.createdAt,
})

const toProfileResponse = (user) => toProfileResponseDto(fromUserDocument(user))

const toProfileUpdateDto = (payload = {}) => pickFields(payload, PROFILE_UPDATE_FIELDS)

const toSettingsUpdateDto = (payload = {}) => pickFields(payload, SETTINGS_UPDATE_FIELDS)

const toSubscriptionDto = (payload = {}) => pickFields(payload, SUBSCRIPTION_FIELDS)

module.exports = {
  PROFILE_FIELDS,
  PROFILE_UPDATE_FIELDS,
  SETTINGS_UPDATE_FIELDS,
  SUBSCRIPTION_FIELDS,
  toProfileResponseDto,
  fromUserDocument,
  toProfileResponse,
  toProfileUpdateDto,
  toSettingsUpdateDto,
  toSubscriptionDto,
}
