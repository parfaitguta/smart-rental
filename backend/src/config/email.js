// backend/src/config/email.js
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

// Create transporter with better configuration for Brevo
const createTransporter = () => {
  console.log('📧 Configuring email transporter...')
  console.log('📧 Host:', process.env.EMAIL_HOST)
  console.log('📧 Port:', process.env.EMAIL_PORT)
  console.log('📧 User:', process.env.EMAIL_USER)
  console.log('📧 From:', process.env.EMAIL_FROM)
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // false for 587, true for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Helps with some connection issues
    },
    connectionTimeout: 30000,
    socketTimeout: 30000
  })
}

const transporter = createTransporter()

// Verify connection on startup
const verifyConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email transporter verified and ready!')
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error.message)
  }
}

verifyConnection()

export const sendResetEmail = async (toEmail, resetUrl, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Smart Rental RW <noreply@smartrental.com>',
      to: toEmail,
      subject: 'Smart Rental RW — Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🏠 Smart Rental RW</h1>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937;">Password Reset Request</h2>
            <p style="color: #6b7280;">Hello <strong>${userName}</strong>,</p>
            <p style="color: #6b7280;">Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}"
                 style="background: #1d4ed8; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Reset My Password
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px;">This link expires in <strong>1 hour</strong>.</p>
            <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `
    }
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Reset email sent to:', toEmail, 'Message ID:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Reset email failed:', error.message)
    throw error
  }
}

export const sendOTPEmail = async (toEmail, otp, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Smart Rental RW <noreply@smartrental.com>',
      to: toEmail,
      subject: 'Smart Rental RW — Verify Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🏠 Smart Rental RW</h1>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937;">Verify Your Account</h2>
            <p style="color: #6b7280;">Hello <strong>${userName}</strong>, welcome to Smart Rental RW!</p>
            <p style="color: #6b7280;">Use the OTP below to verify your account:</p>
            <div style="text-align: center; margin: 32px 0;">
              <div style="background: #1d4ed8; color: white; font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 20px 32px; border-radius: 12px; display: inline-block;">
                ${otp}
              </div>
            </div>
            <p style="color: #9ca3af; font-size: 13px; text-align: center;">This OTP expires in <strong>10 minutes</strong>.</p>
            <p style="color: #9ca3af; font-size: 13px; text-align: center;">If you didn't create this account, ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #d1d5db; font-size: 12px; text-align: center;">Smart Rental Management System — Rwanda</p>
          </div>
        </div>
      `
    }
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ OTP email sent to:', toEmail, 'Message ID:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ OTP email failed:', error.message)
    throw error
  }
}

export const sendTestEmail = async (toEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Smart Rental RW <noreply@smartrental.com>',
      to: toEmail,
      subject: 'Smart Rental RW — Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1d4ed8; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🏠 Smart Rental RW</h1>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937;">Email Configuration Test</h2>
            <p style="color: #6b7280;">Hello,</p>
            <p style="color: #6b7280;">This is a test email from your Smart Rental platform.</p>
            <p style="color: #6b7280;">If you received this email, your email configuration is working correctly!</p>
            <div style="background: #e5e7eb; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;"><strong>Configuration Details:</strong></p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 13px;">SMTP Host: ${process.env.EMAIL_HOST || 'smtp-relay.brevo.com'}</p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 13px;">From Email: ${process.env.EMAIL_FROM}</p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 13px;">Sent at: ${new Date().toLocaleString()}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Smart Rental Management System — Rwanda</p>
          </div>
        </div>
      `
    }
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent to:', toEmail)
    return info
  } catch (error) {
    console.error('❌ Test email failed:', error.message)
    throw error
  }
}