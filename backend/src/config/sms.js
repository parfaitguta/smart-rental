import AfricasTalking from 'africastalking'
import dotenv from 'dotenv'
dotenv.config()

const AT = AfricasTalking({
  username: process.env.AT_USERNAME,
  apiKey: process.env.AT_API_KEY
})

const sms = AT.SMS

export const sendSMS = async (phone, message) => {
  try {
    // Skip SMS if phone looks like an email
    if (!phone || phone.includes('@')) {
      console.log('⚠️ Skipping SMS — invalid phone:', phone)
      return null
    }

    // Format Rwanda phone number
    let formattedPhone = phone.trim().replace(/\s+/g, '')
    if (formattedPhone.startsWith('07')) {
      formattedPhone = '+250' + formattedPhone.slice(1)
    } else if (formattedPhone.startsWith('7')) {
      formattedPhone = '+250' + formattedPhone
    } else if (formattedPhone.startsWith('250')) {
      formattedPhone = '+' + formattedPhone
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+250' + formattedPhone
    }

    console.log(`📱 Sending SMS to ${formattedPhone}: ${message}`)

    const result = await sms.send({
      to: [formattedPhone],
      message,
      from: process.env.AT_SENDER_ID
    })

    console.log(`✅ SMS sent to ${formattedPhone}`)
    return result
  } catch (error) {
    console.error('❌ SMS failed:', error.message)
    // Don't throw — SMS failure shouldn't break the main flow
    return null
  }
}

// SMS Templates
export const SMS_TEMPLATES = {
  rentalRequestReceived: (renterName, propertyTitle) =>
    `Smart Rental RW: ${renterName} sent a rental request for "${propertyTitle}". Login to review.`,

  requestAccepted: (propertyTitle, landlordPhone) =>
    `Smart Rental RW: Your request for "${propertyTitle}" was ACCEPTED! Contact landlord: ${landlordPhone}`,

  requestRejected: (propertyTitle) =>
    `Smart Rental RW: Your request for "${propertyTitle}" was not accepted. Browse other properties.`,

  rentDueReminder: (propertyTitle, amount, dueDate) =>
    `Smart Rental RW: Rent reminder! RWF ${amount} due for "${propertyTitle}" on ${dueDate}.`,

  paymentRecorded: (amount, propertyTitle, method) =>
    `Smart Rental RW: Payment of RWF ${amount} recorded for "${propertyTitle}" via ${method}. Thank you!`,

  rentalAgreementCreated: (propertyTitle, startDate, amount) =>
    `Smart Rental RW: Rental agreement for "${propertyTitle}" starts ${startDate}. Monthly: RWF ${amount}.`,

  welcomeSMS: (name) =>
    `Welcome to Smart Rental RW, ${name}! Find and manage rental properties easily.`
}