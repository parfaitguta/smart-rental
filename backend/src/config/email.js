// backend/src/config/email.js - REPLACE ENTIRE FILE
import dotenv from 'dotenv'
dotenv.config()

let apiInstance = null
let brevo = null

// Initialize Brevo API
const initBrevo = async () => {
  try {
    brevo = await import('@getbrevo/brevo')
    const defaultClient = brevo.ApiClient.instance
    const apiKey = defaultClient.authentications['api-key']
    apiKey.apiKey = process.env.BREVO_API_KEY
    
    apiInstance = new brevo.TransactionalEmailsApi()
    console.log('✅ Brevo API initialized')
    return true
  } catch (error) {
    console.error('❌ Brevo API init failed:', error.message)
    return false
  }
}

// Initialize on module load
await initBrevo()

export const sendOTPEmail = async (toEmail, otp, userName) => {
  try {
    if (!apiInstance) await initBrevo()
    
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.subject = 'Smart Rental RW — Verify Your Account'
    sendSmtpEmail.to = [{ email: toEmail, name: userName }]
    sendSmtpEmail.sender = { 
      name: 'Smart Rental RW', 
      email: process.env.EMAIL_FROM || 'tuyisabeparfait888@gmail.com'
    }
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🏠 Smart Rental RW</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px;">
          <h2>Verify Your Account</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your verification code is:</p>
          <div style="background: #1d4ed8; color: white; font-size: 36px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px;">
            ${otp}
          </div>
          <p>This code expires in 10 minutes.</p>
        </div>
      </div>
    `
    
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ OTP email sent via Brevo API:', response.messageId)
    return response
  } catch (error) {
    console.error('❌ Brevo API error:', error.message)
    throw error
  }
}

export const sendResetEmail = async (toEmail, resetUrl, userName) => {
  try {
    if (!apiInstance) await initBrevo()
    
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.subject = 'Smart Rental RW — Password Reset'
    sendSmtpEmail.to = [{ email: toEmail, name: userName }]
    sendSmtpEmail.sender = { 
      name: 'Smart Rental RW', 
      email: process.env.EMAIL_FROM || 'tuyisabeparfait888@gmail.com'
    }
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white;">🏠 Smart Rental RW</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px;">
          <h2>Reset Your Password</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #1d4ed8; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px;">
              Reset Password
            </a>
          </div>
          <p>This link expires in 1 hour.</p>
        </div>
      </div>
    `
    
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Reset email sent via Brevo API:', response.messageId)
    return response
  } catch (error) {
    console.error('❌ Brevo API error:', error.message)
    throw error
  }
}

export const sendTestEmail = async (toEmail) => {
  try {
    if (!apiInstance) await initBrevo()
    
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.subject = 'Smart Rental RW — Test Email'
    sendSmtpEmail.to = [{ email: toEmail }]
    sendSmtpEmail.sender = { 
      name: 'Smart Rental RW', 
      email: process.env.EMAIL_FROM || 'tuyisabeparfait888@gmail.com'
    }
    sendSmtpEmail.htmlContent = '<h1>Test Successful!</h1><p>Your email configuration is working!</p>'
    
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Test email sent via Brevo API:', response.messageId)
    return response
  } catch (error) {
    console.error('❌ Brevo API error:', error.message)
    throw error
  }
}