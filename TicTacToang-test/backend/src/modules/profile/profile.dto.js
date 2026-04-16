const PROFILE_FIELDS = [
  'userId',
  'username',
  'email',
  'passwordHash',
  'country',
  'role',
  'premiumStatus',
  'subscriptionEndDate',
  'isActive',
  'avatarUrl',
  'createdAt',
];

const PROFILE_UPDATE_FIELDS = [
  'username',
  'email',
  'passwordHash',
  'country',
  'role',
  'premiumStatus',
  'subscriptionEndDate',
  'isActive',
  'avatarUrl',
];

const SETTINGS_UPDATE_FIELDS = [
  'theme',
  'notifications',
  'soundEnabled',
  'language',
  'twoFactorEnabled',
];

const SUBSCRIPTION_FIELDS = [
  'premiumStatus',
  'subscriptionEndDate',
];

const pickFields = (payload, allowedFields) => {
  return allowedFields.reduce((accumulator, field) => {
    if (payload[field] !== undefined) {
      accumulator[field] = payload[field];
    }

    return accumulator;
  }, {});
};

const toProfileResponseDto = (profile) => pickFields(profile, PROFILE_FIELDS);

const toProfileUpdateDto = (payload = {}) => pickFields(payload, PROFILE_UPDATE_FIELDS);

const toSettingsUpdateDto = (payload = {}) => pickFields(payload, SETTINGS_UPDATE_FIELDS);

const toSubscriptionDto = (payload = {}) => pickFields(payload, SUBSCRIPTION_FIELDS);

module.exports = {
  PROFILE_FIELDS,
  PROFILE_UPDATE_FIELDS,
  SETTINGS_UPDATE_FIELDS,
  SUBSCRIPTION_FIELDS,
  toProfileResponseDto,
  toProfileUpdateDto,
  toSettingsUpdateDto,
  toSubscriptionDto,
};
