const profileRepository = require('./profile.repository')
const profileDto = require('./profile.dto')
const profileValidator = require('./profile.validator')
const emailService = require('../../services/email.service')
const paypalService = require('../../services/paypal.service')

const getUserProfile = async (userId) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  const profile = await profileRepository.getProfileByUserId(validatedUserId)
  return profileDto.toProfileResponse(profile)
}

const resolveExistingUserId = async ({ authenticatedUserId, userId, username, email } = {}) => {
  const identifiers = [authenticatedUserId, userId, username, email].filter(Boolean)

  for (const identifier of identifiers) {
    const user = await profileRepository.findUserByIdentifier(identifier)
    if (user) {
      return user._id.toString()
    }
  }

  return null
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

const manageUserSubscription = async (userId, subscriptionData) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  const validatedSubscription = profileValidator.validateSubscriptionDto(
    profileDto.toSubscriptionDto(subscriptionData)
  )

  const result = await profileRepository.upsertSubscriptionByUserId(validatedUserId, validatedSubscription)
  const profile = profileDto.toProfileResponse(result.user)
  const receiptRecipient = validatedSubscription.receiptEmail
    || validatedSubscription.paypalEmail
    || profile.email
  let emailReceipt = null

  try {
    emailReceipt = await emailService.sendPremiumReceipt({
      to: receiptRecipient,
      amount: validatedSubscription.amount || 10,
      currency: validatedSubscription.currency || 'USD',
      provider: validatedSubscription.provider || 'PayPal',
      paypalEmail: validatedSubscription.paypalEmail,
      subscriptionEndDate: result.subscriptionEndDate,
      userName: profile.name || profile.username || 'Player',
    })
  } catch (error) {
    emailReceipt = {
      ok: false,
      skipped: false,
      reason: 'send-failed',
      message: error.message || 'Receipt email could not be sent.',
    }
  }

  return {
    success: result.success,
    premiumStatus: result.premiumStatus,
    subscriptionEndDate: result.subscriptionEndDate,
    profile,
    emailReceipt,
  }
}

const createPayPalSubscriptionOrder = async (userId, orderData = {}) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  return paypalService.createPremiumOrder({
    userId: validatedUserId,
    returnUrl: orderData.returnUrl,
    cancelUrl: orderData.cancelUrl,
  })
}

const capturePayPalSubscriptionOrder = async (userId, captureData = {}) => {
  const validatedUserId = profileValidator.validateUserId(userId)
  const payment = await paypalService.capturePremiumOrder(captureData.orderId)
  const subscriptionEndDate = new Date()

  subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)

  return manageUserSubscription(validatedUserId, {
    premiumStatus: true,
    subscriptionEndDate: subscriptionEndDate.toISOString(),
    amount: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    paypalEmail: payment.payerEmail || undefined,
    billingCycle: 'monthly',
    receiptEmail: payment.payerEmail || undefined,
    paypalOrderId: payment.orderId,
    paypalCaptureId: payment.captureId,
    paymentStatus: payment.status,
  }).then((result) => ({
    ...result,
    payment: {
      orderId: payment.orderId,
      captureId: payment.captureId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      payerEmail: payment.payerEmail,
      payerName: payment.payerName,
      provider: payment.provider,
    },
  }))
}

module.exports = {
  getUserProfile,
  resolveExistingUserId,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  manageUserSubscription,
  createPayPalSubscriptionOrder,
  capturePayPalSubscriptionOrder,
}
