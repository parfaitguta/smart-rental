import { logActivity } from '../models/activityModel.js'

export const LOG = {
  login: (user_id, ip) =>
    logActivity(user_id, 'LOGIN', 'User logged in', 'auth', null, ip),

  logout: (user_id, ip) =>
    logActivity(user_id, 'LOGOUT', 'User logged out', 'auth', null, ip),

  register: (user_id, ip) =>
    logActivity(user_id, 'REGISTER', 'New account created', 'auth', null, ip),

  passwordChanged: (user_id, ip) =>
    logActivity(user_id, 'PASSWORD_CHANGED', 'Password was changed', 'auth', null, ip),

  profileUpdated: (user_id, ip) =>
    logActivity(user_id, 'PROFILE_UPDATED', 'Profile information updated', 'user', user_id, ip),

  propertyAdded: (user_id, property_id, title, ip) =>
    logActivity(user_id, 'PROPERTY_ADDED', `Added property: "${title}"`, 'property', property_id, ip),

  propertyUpdated: (user_id, property_id, title, ip) =>
    logActivity(user_id, 'PROPERTY_UPDATED', `Updated property: "${title}"`, 'property', property_id, ip),

  propertyDeleted: (user_id, title, ip) =>
    logActivity(user_id, 'PROPERTY_DELETED', `Deleted property: "${title}"`, 'property', null, ip),

  requestSent: (user_id, property_title, ip) =>
    logActivity(user_id, 'REQUEST_SENT', `Sent rental request for: "${property_title}"`, 'request', null, ip),

  requestAccepted: (user_id, renter_name, property_title, ip) =>
    logActivity(user_id, 'REQUEST_ACCEPTED', `Accepted request from ${renter_name} for: "${property_title}"`, 'request', null, ip),

  requestRejected: (user_id, renter_name, property_title, ip) =>
    logActivity(user_id, 'REQUEST_REJECTED', `Rejected request from ${renter_name} for: "${property_title}"`, 'request', null, ip),

  rentalCreated: (user_id, tenant_name, property_title, rental_id, ip) =>
    logActivity(user_id, 'RENTAL_CREATED', `Created rental agreement for ${tenant_name} at "${property_title}"`, 'rental', rental_id, ip),

  rentalTerminated: (user_id, property_title, rental_id, ip) =>
    logActivity(user_id, 'RENTAL_TERMINATED', `Terminated rental at "${property_title}"`, 'rental', rental_id, ip),

  paymentRecorded: (user_id, amount, property_title, ip) =>
    logActivity(user_id, 'PAYMENT_RECORDED', `Recorded payment of RWF ${amount} for "${property_title}"`, 'payment', null, ip),

  paymentRequested: (user_id, month_year, property_title, ip) =>
    logActivity(user_id, 'PAYMENT_REQUESTED', `Requested ${month_year} rent for "${property_title}"`, 'payment', null, ip),

  messageSent: (user_id, receiver_name, ip) =>
    logActivity(user_id, 'MESSAGE_SENT', `Sent message to ${receiver_name}`, 'message', null, ip),

  reviewSubmitted: (user_id, property_title, rating, ip) =>
    logActivity(user_id, 'REVIEW_SUBMITTED', `Submitted ${rating}★ review for "${property_title}"`, 'review', null, ip),

  userDeleted: (admin_id, user_name, ip) =>
    logActivity(admin_id, 'USER_DELETED', `Deleted user: ${user_name}`, 'user', null, ip),

  roleChanged: (admin_id, user_name, new_role, ip) =>
    logActivity(admin_id, 'ROLE_CHANGED', `Changed ${user_name}'s role to ${new_role}`, 'user', null, ip),
}