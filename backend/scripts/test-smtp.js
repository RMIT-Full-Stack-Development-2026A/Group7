const path = require('node:path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const emailService = require('../src/services/email.service')

const maskEmail = (email = '') => {
  const [name, domain] = String(email).split('@')
  if (!domain) return '<not set>'
  return `${name.slice(0, 2)}***@${domain}`
}

const readEnv = (key, fallback = '') => {
  const value = process.env[key]
  return value === undefined || value === null ? fallback : String(value).trim()
}

const run = async () => {
  const smtpUser = readEnv('SMTP_USER') 
  const smtpPass = readEnv('SMTP_PASS')
  const smtpHost = readEnv('SMTP_HOST', 'smtp.gmail.com')
  const smtpPort = readEnv('SMTP_PORT', '465')
  const smtpSecure = readEnv('SMTP_SECURE', 'true')

  console.log('SMTP config check:')
  console.log(`- host: ${smtpHost}`)
  console.log(`- port: ${smtpPort}`)
  console.log(`- secure: ${smtpSecure}`)
  console.log(`- user: ${maskEmail(smtpUser)}`)
  console.log(`- password: ${smtpPass ? '<set>' : '<missing>'}`)
  console.log(`- from: ${readEnv('MAIL_FROM') || '<default>'}`)

  if (!emailService.isEmailConfigured()) {
    throw new Error('SMTP_USER and SMTP_PASS must be set in backend/.env')
  }

  await emailService.verifySmtpConnection()
  console.log('SMTP login verified successfully.')

  if (process.argv.includes('--send')) {
    const recipient = readEnv('SMTP_TEST_TO', smtpUser)
    const result = await emailService.sendPremiumReceipt({
      to: recipient,
      amount: 10,
      currency: 'USD',
      provider: 'SMTP test',
      paypalEmail: smtpUser,
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userName: 'SMTP Tester',
    })

    console.log(`Test receipt sent to ${maskEmail(recipient)}.`)
    console.log(`Message id: ${result.messageId}`)
  }
}

run().catch((error) => {
  console.error('SMTP test failed:')
  console.error(error.message)
  process.exit(1)
})
