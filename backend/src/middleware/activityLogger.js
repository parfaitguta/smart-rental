import { logActivity } from '../models/activityModel.js'

export const logUserActivity = (action, entity_type = null, entity_id = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send
    let responseBody = null
    
    // Override send to capture response
    res.send = function(body) {
      responseBody = body
      return originalSend.call(this, body)
    }
    
    // Wait for the response to be sent
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 400 && req.user) {
        let description = `${action} performed successfully`
        
        // Customize description based on action
        if (action === 'LOGIN') description = `User ${req.user.email} logged in`
        if (action === 'LOGOUT') description = `User ${req.user.email} logged out`
        if (action === 'INVOICE_CREATED') description = `Created new invoice`
        if (action === 'PAYMENT_INITIATED') description = `Initiated payment`
        if (action === 'PAYMENT_COMPLETED') description = `Payment completed successfully`
        if (action === 'RENTAL_CREATED') description = `Created new rental agreement`
        if (action === 'RENTAL_TERMINATED') description = `Terminated rental agreement`
        if (action === 'PROPERTY_ADDED') description = `Added new property`
        if (action === 'PROPERTY_UPDATED') description = `Updated property`
        if (action === 'PROPERTY_DELETED') description = `Deleted property`
        if (action === 'NOTE_ADDED') description = `Added note to tenant`
        if (action === 'PAYMENT_RECORDED') description = `Recorded payment`
        
        await logActivity(req.user.id, action, description, entity_type, entity_id, req.ip)
      }
    })
    
    next()
  }
}