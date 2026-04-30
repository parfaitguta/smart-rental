import { createNotification } from '../models/notificationModel.js'

export const notify = async (user_id, title, message, type, link) => {
  try {
    await createNotification(user_id, title, message, type, link)
  } catch (err) {
    console.error('Notification failed:', err.message)
  }
}

export const NOTIF = {
  newRequest: (landlord_id, renter_name, property_title) =>
    notify(landlord_id,
      '🏠 New Rental Request',
      `${renter_name} sent a rental request for "${property_title}"`,
      'request', '/landlord/requests'
    ),

  requestAccepted: (renter_id, property_title) =>
    notify(renter_id,
      '✅ Request Accepted',
      `Your rental request for "${property_title}" was accepted!`,
      'request', '/my-requests'
    ),

  requestRejected: (renter_id, property_title) =>
    notify(renter_id,
      '❌ Request Rejected',
      `Your rental request for "${property_title}" was not accepted.`,
      'request', '/my-requests'
    ),

  agreementCreated: (tenant_id, property_title) =>
    notify(tenant_id,
      '📋 Rental Agreement Created',
      `A rental agreement has been created for "${property_title}". Welcome!`,
      'agreement', '/my-rentals'
    ),

  paymentRequested: (tenant_id, month_year, amount, property_title) =>
    notify(tenant_id,
      '💰 Payment Request',
      `${month_year} rent of RWF ${amount} requested for "${property_title}"`,
      'payment', '/my-rentals'
    ),

  paymentRecorded: (tenant_id, amount, property_title) =>
    notify(tenant_id,
      '✅ Payment Recorded',
      `Payment of RWF ${amount} recorded for "${property_title}"`,
      'payment', '/my-rentals'
    ),

  paymentOverdue: (tenant_id, month_year, property_title) =>
    notify(tenant_id,
      '⚠️ Payment Overdue',
      `${month_year} rent for "${property_title}" is now overdue!`,
      'alert', '/my-rentals'
    ),

  newMessage: (receiver_id, sender_name) =>
    notify(receiver_id,
      '💬 New Message',
      `${sender_name} sent you a message`,
      'message', '/messages'
    ),
}