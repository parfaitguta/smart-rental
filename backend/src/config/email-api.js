// backend/src/config/email-api.js
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

// Call init on module load
await initBrevo()

export const sendOTPEmail = async (toEmail, otp, userName) => {
  try {
    if (!apiInstance) {
      await initBrevo()
    }
    
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
          <h2 style="color: #1f2937;">Verify Your Account</h2>
          <p style="color: #6b7280;">Hello <strong>${userName}</strong>, welcome to Smart Rental RW!</p>
          <p style="color: #6b7280;">Use the OTP below to verify your account:</p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="background: #1d4ed8; color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px 32px; border-radius: 12px; display: inline-block;">
              ${otp}
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #d1d5db; font-size: 12px; text-align: center;">Smart Rental Management System — Rwanda</p>
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
    if (!apiInstance) {
      await initBrevo()
    }
    
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.subject = 'Smart Rental RW — Password Reset Request'
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
          <h2 style="color: #1f2937;">Password Reset Request</h2>
          <p style="color: #6b7280;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #6b7280;">Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #1d4ed8; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 13px;">This link expires in <strong>1 hour</strong>.</p>
          <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, ignore this email.</p>
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
    if (!apiInstance) {
      await initBrevo()
    }
    
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.subject = 'Smart Rental RW — Test Email'
    sendSmtpEmail.to = [{ email: toEmail }]
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
          <h2>Email Configuration Test</h2>
          <p>If you received this email, your email configuration is working correctly!</p>
          <div style="background: #e5e7eb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Sent via:</strong> Brevo API</p>
            <p><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `
    
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Test email sent via Brevo API:', response.messageId)
    return response
  } catch (error) {
    console.error('❌ Brevo API error:', error.message)
    throw error
  }
}