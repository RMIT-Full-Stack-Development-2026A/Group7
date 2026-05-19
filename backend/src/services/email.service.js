const nodemailer = require('nodemailer')

const DEFAULT_SMTP_HOST = 'smtp.gmail.com'
const DEFAULT_SMTP_PORT = 465
const DEFAULT_SMTP_FAMILY = 4
const DEFAULT_SMTP_TIMEOUT_MS = 8000
const DEFAULT_MAIL_FROM_NAME = 'Team7-TicTacToangProject'
const DEFAULT_RESEND_FROM = 'TicTacToang <onboarding@resend.dev>'
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

const getEnvValue = (key, fallback = '') => {
  const value = process.env[key]
  return value === undefined || value === null ? fallback : String(value).trim()
}

const isResendConfigured = () => Boolean(getEnvValue('RESEND_API_KEY'))
const isSmtpConfigured = () => Boolean(getEnvValue('SMTP_USER') && getEnvValue('SMTP_PASS'))
const isEmailConfigured = () => isResendConfigured() || isSmtpConfigured()

const getTransporter = () => {
  if (!isEmailConfigured()) {
    return null
  }

  return nodemailer.createTransport({
    host: getEnvValue('SMTP_HOST', DEFAULT_SMTP_HOST),
    port: Number(getEnvValue('SMTP_PORT', DEFAULT_SMTP_PORT)),
    secure: getEnvValue('SMTP_SECURE', 'true').toLowerCase() !== 'false',
    family: Number(getEnvValue('SMTP_FAMILY', DEFAULT_SMTP_FAMILY)),
    connectionTimeout: Number(getEnvValue('SMTP_TIMEOUT_MS', DEFAULT_SMTP_TIMEOUT_MS)),
    greetingTimeout: Number(getEnvValue('SMTP_TIMEOUT_MS', DEFAULT_SMTP_TIMEOUT_MS)),
    socketTimeout: Number(getEnvValue('SMTP_TIMEOUT_MS', DEFAULT_SMTP_TIMEOUT_MS)),
    auth: {
      user: getEnvValue('SMTP_USER'),
      pass: getEnvValue('SMTP_PASS'),
    },
  })
}

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const formatCurrency = (amount = 0, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount) || 0)

const formatDate = (value) => {
  if (!value) {
    return 'the next billing date'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const buildPremiumReceiptEmail = ({
  amount,
  currency = 'USD',
  provider = 'PayPal',
  paypalEmail,
  subscriptionEndDate,
  userName = 'Player',
} = {}) => {
  const amountText = formatCurrency(amount, currency)
  const endDateText = formatDate(subscriptionEndDate)
  const safeProvider = escapeHtml(provider)
  const safePaypalEmail = escapeHtml(paypalEmail || 'Not provided')
  const safeUserName = escapeHtml(userName)

  return {
    subject: 'TicTacToang Premium receipt',
    text: [
      `Hi ${userName},`,
      '',
      `Your ${amountText} monthly premium subscription payment was processed successfully.`,
      `Provider: ${provider}`,
      `PayPal account: ${paypalEmail || 'Not provided'}`,
      `Premium active until: ${endDateText}`,
      '',
      'Thank you for supporting TicTacToang.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.55;max-width:560px">
        <h2 style="margin:0 0 12px;color:#111827">TicTacToang Premium receipt</h2>
        <p>Hi ${safeUserName},</p>
        <p>Your <strong>${amountText}</strong> monthly premium subscription payment was processed successfully.</p>
        <div style="background:#f3f6ff;border:1px solid #d8e1ff;border-radius:14px;padding:16px;margin:18px 0">
          <p style="margin:0 0 8px"><strong>Provider:</strong> ${safeProvider}</p>
          <p style="margin:0 0 8px"><strong>PayPal account:</strong> ${safePaypalEmail}</p>
          <p style="margin:0"><strong>Premium active until:</strong> ${endDateText}</p>
        </div>
        <p>Thank you for supporting TicTacToang.</p>
      </div>
    `,
  }
}


const verifySmtpConnection = async () => {
  const transporter = getTransporter()

  if (!transporter) {
    return {
      ok: false,
      skipped: true,
      reason: 'smtp-not-configured',
      message: 'SMTP credentials are not configured.',
    }
  }

  await transporter.verify()

  return {
    ok: true,
    message: 'SMTP connection verified successfully.',
  }
}

const sendViaResend = async ({ to, subject, text, html }) => {
  const apiKey = getEnvValue('RESEND_API_KEY')
  const from = getEnvValue('RESEND_FROM') || getEnvValue('MAIL_FROM') || DEFAULT_RESEND_FROM
  // Sandbox mode: Resend without a verified domain only delivers to the
  // account owner's email, so redirect every recipient there when this is set.
  const override = getEnvValue('RESEND_TO_OVERRIDE')
  const finalTo = override || to

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: finalTo, subject, text, html }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail = payload?.message || payload?.error || `HTTP ${response.status}`
    throw new Error(`Resend API error: ${detail}`)
  }

  return {
    ok: true,
    provider: 'resend',
    messageId: payload?.id,
    accepted: [finalTo],
    rejected: [],
    redirectedFrom: override ? to : undefined,
  }
}

const sendViaSmtp = async ({ to, subject, text, html }) => {
  const transporter = getTransporter()
  if (!transporter) {
    return {
      ok: false,
      skipped: true,
      reason: 'smtp-not-configured',
      message: 'SMTP credentials are not configured.',
    }
  }

  const info = await transporter.sendMail({
    from: getEnvValue('MAIL_FROM') || `"${DEFAULT_MAIL_FROM_NAME}" <${getEnvValue('SMTP_USER')}>`,
    to,
    subject,
    text,
    html,
  })

  return {
    ok: true,
    provider: 'smtp',
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  }
}

const sendMail = async ({ to, subject, text, html }) => {
  if (!to) {
    return {
      ok: false,
      skipped: true,
      reason: 'missing-recipient',
      message: 'No receipt recipient email was provided.',
    }
  }

  if (isResendConfigured()) {
    return sendViaResend({ to, subject, text, html })
  }

  if (isSmtpConfigured()) {
    return sendViaSmtp({ to, subject, text, html })
  }

  return {
    ok: false,
    skipped: true,
    reason: 'email-not-configured',
    message: 'No email provider (Resend or SMTP) is configured.',
  }
}

const sendPremiumReceipt = async ({ to, ...receiptData }) => {
  const email = buildPremiumReceiptEmail(receiptData)
  return sendMail({
    to,
    ...email,
  })
}

module.exports = {
  buildPremiumReceiptEmail,
  isEmailConfigured,
  sendMail,
  sendPremiumReceipt,
  verifySmtpConnection,
}
