// Backend API helpers used by the Subscription page.
// Only the PayPal order + capture calls are still in use; everything else was
// dead and has been removed.
export const profileService = (api) => ({
  createPayPalSubscriptionOrder: (orderData) => api.call('/profile/subscription/paypal/order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  capturePayPalSubscriptionOrder: (captureData) => api.call('/profile/subscription/paypal/capture', {
    method: 'POST',
    body: JSON.stringify(captureData),
  }),
});
