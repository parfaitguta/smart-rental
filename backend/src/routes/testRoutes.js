// backend/src/routes/testRoutes.js
import express from 'express'
import { sendTestEmail } from '../config/email.js'

const router = express.Router()

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body
    const toEmail = email || process.env.EMAIL_USER
    
    console.log('📧 Sending test email to:', toEmail)
    
    await sendTestEmail(toEmail)
    
    res.json({ 
      success: true, 
      message: `Test email sent to ${toEmail}` 
    })
  } catch (error) {
    console.error('Email test error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

export default router