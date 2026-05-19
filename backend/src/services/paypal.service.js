const PAYPAL_AMOUNT = '10.00'
const PAYPAL_CURRENCY = 'USD'
const PAYPAL_PRODUCT_NAME = 'TicTacToang Premium Monthly'

const createPaymentError = (message, statusCode = 400, details = null) => {
  const error = new Error(message)
  error.statusCode = statusCode
  if (details) error.details = details
  return error
}

const getEnvValue = (key, fallback = '') => {
  const value = process.env[key]
  return value === undefined || value === null ? fallback : String(value).trim()
}

const getPayPalMode = () => {
  const mode = getEnvValue('PAYPAL_ENV', 'sandbox').toLowerCase()
  return mode === 'live' ? 'live' : 'sandbox'
}

const getPayPalBaseUrl = () => (
  getPayPalMode() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
)

const assertConfigured = () => {
  const clientId = getEnvValue('PAYPAL_CLIENT_ID')
  const clientSecret = getEnvValue('PAYPAL_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw createPaymentError(
      'PayPal checkout is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET on the backend.',
      503
    )
  }

  return { clientId, clientSecret }
}

const readPayPalJson = async (response) => {
  const text = await response.text()

  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { raw: text }
  }
}

const requestPayPal = async (path, options = {}) => {
  const accessToken = options.accessToken || await getAccessToken()
  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await readPayPalJson(response)

  if (!response.ok) {
    throw createPaymentError(data?.message || data?.name || 'PayPal request failed.', response.status, data)
  }

  return data
}

const getAccessToken = async () => {
  const { clientId, clientSecret } = assertConfigured()
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await readPayPalJson(response)

  if (!response.ok || !data.access_token) {
    throw createPaymentError('Could not authenticate with PayPal.', response.status || 503, data)
  }

  return data.access_token
}

const normalizeUrl = (value, fallback) => {
  try {
    const parsed = new URL(value || fallback)
    if (!['http:', 'https:'].includes(parsed.protocol)) return fallback
    return parsed.toString()
  } catch {
    return fallback
  }
}

const getDefaultFrontendOrigin = () => {
  const firstConfiguredOrigin = getEnvValue('CORS_ORIGIN')
    .split(',')
    .map((origin) => origin.trim())
    .find(Boolean)

  return firstConfiguredOrigin || 'http://localhost:3000'
}

const getDefaultSubscriptionUrl = (paypalState) => {
  const url = new URL('/subscription', getDefaultFrontendOrigin())
  url.searchParams.set('paypal', paypalState)
  return url.toString()
}

const createPremiumOrder = async ({ userId, returnUrl, cancelUrl }) => {
  const safeUserId = String(userId || 'unknown-user').slice(0, 64)
  const fallbackReturnUrl = getEnvValue('PAYPAL_RETURN_URL', getDefaultSubscriptionUrl('success'))
  const fallbackCancelUrl = getEnvValue('PAYPAL_CANCEL_URL', getDefaultSubscriptionUrl('cancel'))
  const invoiceId = `premium-${Date.now()}-${safeUserId}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 127)

  const order = await requestPayPal('/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'PayPal-Request-Id': invoiceId,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      payment_source: {
        paypal: {
          experience_context: {
            // NO_PREFERENCE lets PayPal show both "Log in" AND "Pay with debit/credit card"
            // as a guest, so users (or sandbox testers on a new machine) can complete checkout
            // even when they don't have a working PayPal account / sandbox login.
            landing_page: 'NO_PREFERENCE',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: normalizeUrl(returnUrl, fallbackReturnUrl),
            cancel_url: normalizeUrl(cancelUrl, fallbackCancelUrl),
          },
        },
      },
      purchase_units: [
        {
          invoice_id: invoiceId,
          custom_id: safeUserId,
          description: PAYPAL_PRODUCT_NAME,
          amount: {
            currency_code: PAYPAL_CURRENCY,
            value: PAYPAL_AMOUNT,
            breakdown: {
              item_total: {
                currency_code: PAYPAL_CURRENCY,
                value: PAYPAL_AMOUNT,
              },
            },
          },
          items: [
            {
              name: PAYPAL_PRODUCT_NAME,
              description: 'One month of TicTacToang Premium access',
              sku: 'premium-monthly',
              quantity: '1',
              category: 'DIGITAL_GOODS',
              unit_amount: {
                currency_code: PAYPAL_CURRENCY,
                value: PAYPAL_AMOUNT,
              },
            },
          ],
        },
      ],
    }),
  })
  const approveUrl = order.links?.find((link) => ['payer-action', 'approve'].includes(link.rel))?.href

  if (!order.id || !approveUrl) {
    throw createPaymentError('PayPal did not return an approval link.', 502, order)
  }

  return {
    orderId: order.id,
    approveUrl,
    status: order.status,
    amount: Number(PAYPAL_AMOUNT),
    currency: PAYPAL_CURRENCY,
    mode: getPayPalMode(),
  }
}

const capturePremiumOrder = async (orderId) => {
  if (!orderId || typeof orderId !== 'string') {
    throw createPaymentError('A valid PayPal order ID is required.')
  }

  const capture = await requestPayPal(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: {
      'PayPal-Request-Id': `capture-${orderId}`.slice(0, 108),
      Prefer: 'return=representation',
    },
  })
  const purchaseUnit = capture.purchase_units?.[0]
  const paymentCapture = purchaseUnit?.payments?.captures?.[0]
  const capturedAmount = paymentCapture?.amount || purchaseUnit?.amount
  const payerEmail = capture.payer?.email_address || ''
  const payerName = [capture.payer?.name?.given_name, capture.payer?.name?.surname].filter(Boolean).join(' ')

  if (capture.status !== 'COMPLETED' || paymentCapture?.status !== 'COMPLETED') {
    throw createPaymentError('PayPal payment was not completed.', 402, capture)
  }

  if (capturedAmount?.currency_code !== PAYPAL_CURRENCY || Number(capturedAmount?.value) !== Number(PAYPAL_AMOUNT)) {
    throw createPaymentError('PayPal payment amount does not match the premium subscription price.', 400, capture)
  }

  return {
    orderId: capture.id,
    captureId: paymentCapture.id,
    status: capture.status,
    amount: Number(capturedAmount.value),
    currency: capturedAmount.currency_code,
    payerEmail,
    payerName,
    provider: 'PayPal',
    raw: capture,
  }
}

module.exports = {
  PAYPAL_AMOUNT,
  PAYPAL_CURRENCY,
  capturePremiumOrder,
  createPremiumOrder,
  getPayPalMode,
}
