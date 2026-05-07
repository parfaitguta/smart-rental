import paypack from '../config/paypack.js'
import {
  createInvoice, getInvoiceById, getTenantInvoices,
  getLandlordInvoices, getInvoicePayments, createInvoicePayment,
  updateInvoicePaymentStatus, updateInvoiceAmounts
} from '../models/invoiceModel.js'
import { NOTIF } from '../utils/notify.js'
import pool from '../config/db.js'
import { logActivity } from '../models/activityModel.js'

// POST /api/invoices — RENTER creates invoice (self-billing)
export const createNewInvoice = async (req, res) => {
  try {
    const { rental_id, amount, month_year, due_date, notes } = req.body

    if (!rental_id || !amount || !month_year || !due_date) {
      return res.status(400).json({ message: 'rental_id, amount, month_year and due_date are required' })
    }

    // Check if invoice already exists for this month
    const [existing] = await pool.query(
      `SELECT id, status FROM invoices WHERE rental_id = ? AND month_year = ? AND status NOT IN ('cancelled', 'paid')`,
      [rental_id, month_year]
    )
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Invoice already exists for this month' });
    }

    const [rentals] = await pool.query(
      `SELECT r.*, p.landlord_id, r.tenant_id, p.title as property_title
       FROM rentals r
       JOIN properties p ON r.property_id = p.id
       WHERE r.id = ? AND r.tenant_id = ?`,
      [rental_id, req.user.id]
    )

    if (!rentals[0]) {
      return res.status(403).json({ message: 'Rental not found or not yours' })
    }
    if (rentals[0].status !== 'active') {
      return res.status(400).json({ message: 'Rental is not active' })
    }

    const id = await createInvoice({
      rental_id,
      tenant_id: req.user.id,
      landlord_id: rentals[0].landlord_id,
      amount,
      month_year,
      due_date,
      notes
    })

    await NOTIF.paymentRequested(
      rentals[0].landlord_id,
      month_year,
      amount,
      rentals[0].property_title
    )

    const invoice = await getInvoiceById(id)
    
    await logActivity(req.user.id, 'INVOICE_CREATED', `Created invoice for ${month_year} - RWF ${amount}`, 'invoice', id, req.ip)
    
    res.status(201).json({ message: 'Invoice created successfully', invoice })
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/invoices/tenant — tenant views invoices
export const tenantInvoices = async (req, res) => {
  try {
    const invoices = await getTenantInvoices(req.user.id)
    res.json({ count: invoices.length, invoices })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/invoices/landlord — landlord views invoices
export const landlordInvoices = async (req, res) => {
  try {
    const invoices = await getLandlordInvoices(req.user.id)
    res.json({ count: invoices.length, invoices })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/invoices/:id — get invoice details
export const getInvoice = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id)
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }
    if (invoice.tenant_id !== req.user.id && invoice.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    const payments = await getInvoicePayments(req.params.id)
    res.json({ invoice, payments })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/invoices/:id/status — Check invoice status
export const getInvoiceStatus = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    if (invoice.tenant_id !== req.user.id && invoice.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({
      id: invoice.id,
      status: invoice.status,
      can_pay: invoice.status === 'unpaid' || invoice.status === 'partial',
      can_cancel: (invoice.status === 'unpaid' || invoice.status === 'partial'),
      message: invoice.status === 'cancelled' ? 'Invoice has been cancelled' : null
    });
  } catch (error) {
    console.error('Error checking invoice status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// PUT /api/invoices/:id/cancel — Cancel an invoice
export const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Get invoice details
    const invoice = await getInvoiceById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Check authorization (tenant or landlord can cancel)
    if (invoice.tenant_id !== userId && invoice.landlord_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this invoice' });
    }
    
    // Check if invoice can be cancelled (only unpaid or partial)
    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Cannot cancel a paid invoice' });
    }
    
    if (invoice.status === 'cancelled') {
      return res.status(400).json({ message: 'Invoice is already cancelled' });
    }
    
    // Update invoice status to cancelled
    await pool.query(
      `UPDATE invoices SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );
    
    await logActivity(userId, 'INVOICE_CANCELLED', `Cancelled invoice for ${invoice.month_year}`, 'invoice', id, req.ip);
    
    res.json({ 
      success: true, 
      message: 'Invoice cancelled successfully',
      invoice_id: id
    });
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/invoices/:id/pay — tenant initiates payment (REAL PAYMENTS)
export const payInvoice = async (req, res) => {
  try {
    const { amount, phone, method } = req.body

    if (!amount || !phone || !method) {
      return res.status(400).json({ message: 'amount, phone and method are required' })
    }

    const invoice = await getInvoiceById(req.params.id)
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }
    if (invoice.tenant_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    // Check if invoice is cancelled
    if (invoice.status === 'cancelled') {
      return res.status(400).json({ message: 'Invoice has been cancelled' })
    }
    
    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice is already fully paid' })
    }
    if (parseFloat(amount) > parseFloat(invoice.remaining)) {
      return res.status(400).json({ message: `Amount exceeds remaining balance of RWF ${invoice.remaining}` })
    }

    // Format phone number for Rwanda
    let formattedPhone = phone.trim().replace(/\s+/g, '')
    if (formattedPhone.startsWith('07')) {
      formattedPhone = '250' + formattedPhone.slice(1)
    } else if (formattedPhone.startsWith('+250')) {
      formattedPhone = formattedPhone.slice(1)
    } else if (formattedPhone.startsWith('7')) {
      formattedPhone = '250' + formattedPhone
    }

    // Create payment record
    const paymentId = await createInvoicePayment({
      invoice_id: invoice.id,
      amount,
      phone: formattedPhone,
      method
    })

    try {
      // Initiate REAL Paypack cashin
      const paypackResponse = await paypack.cashin({
        amount: parseFloat(amount),
        number: formattedPhone,
        mode: process.env.PAYPACK_MODE || 'live'
      })

      console.log('✅ REAL Payment initiated successfully')
      console.log('   Status:', paypackResponse?.status)
      console.log('   Ref:', paypackResponse?.data?.ref)
      console.log('   Amount:', paypackResponse?.data?.amount)
      console.log('   Provider:', paypackResponse?.data?.provider)

      await updateInvoicePaymentStatus(
        paymentId,
        'pending',
        paypackResponse?.data?.ref || paypackResponse?.ref
      )
      
      await logActivity(req.user.id, 'PAYMENT_INITIATED', `Initiated payment of RWF ${amount} for invoice #${invoice.id}`, 'payment', paymentId, req.ip)

      res.json({
        message: 'Payment initiated! Check your phone to confirm the payment.',
        payment_id: paymentId,
        paypack_ref: paypackResponse?.data?.ref || paypackResponse?.ref,
        amount,
        phone: formattedPhone,
        warning: 'Real money will be deducted from your mobile money account upon confirmation.'
      })
    } catch (paypackErr) {
      console.error('❌ Paypack error:', paypackErr.message)
      await updateInvoicePaymentStatus(paymentId, 'failed', null)
      return res.status(400).json({
        message: 'Payment initiation failed',
        error: paypackErr.message
      })
    }
  } catch (error) {
    console.error('❌ PayInvoice error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// POST /api/invoices/webhook — Paypack webhook callback (REAL PAYMENTS)
export const paypackWebhook = async (req, res) => {
  try {
    const { ref, status, amount, number } = req.body
    console.log('📞 Paypack webhook received:', { ref, status, amount, number })

    if (!ref) {
      return res.status(400).json({ message: 'No ref provided' })
    }

    const [payments] = await pool.query(
      'SELECT * FROM invoice_payments WHERE paypack_ref = ?',
      [ref]
    )

    if (!payments[0]) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    const payment = payments[0]

    if (status === 'successful' || status === 'success') {
      await updateInvoicePaymentStatus(payment.id, 'successful', ref)
      await updateInvoiceAmounts(payment.invoice_id, payment.amount)

      const invoice = await getInvoiceById(payment.invoice_id)
      
      if (invoice) {
        // Record in payments table for landlord view
        try {
          await pool.query(
            `INSERT INTO payments (rental_id, amount, payment_date, method, status, notes)
             VALUES (?, ?, CURDATE(), ?, 'paid', ?)`,
            [
              invoice.rental_id,
              payment.amount,
              payment.method === 'mtn_momo' ? 'mtn_momo' : 'airtel_money',
              `Payment for ${invoice.month_year} - Invoice #${payment.invoice_id}`
            ]
          )
          console.log('✅ Payment recorded in payments table')
        } catch (paymentsErr) {
          console.error('Failed to record in payments table:', paymentsErr.message)
        }

        await NOTIF.paymentRecorded(
          invoice.tenant_id,
          payment.amount,
          invoice.property_title
        )
        await NOTIF.paymentRecorded(
          invoice.landlord_id,
          payment.amount,
          invoice.property_title
        )
        
        await logActivity(invoice.tenant_id, 'PAYMENT_COMPLETED', `Paid RWF ${payment.amount} for ${invoice.month_year}`, 'payment', payment.id, req.ip)
      }
      console.log('✅ REAL Payment confirmed via webhook!')
    } else if (status === 'failed') {
      await updateInvoicePaymentStatus(payment.id, 'failed', ref)
      console.log('❌ REAL Payment failed via webhook')
    }

    res.json({ message: 'Webhook processed' })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/invoices/verify — manually verify payment status (REAL - NO AUTO-APPROVE)
export const verifyPayment = async (req, res) => {
  try {
    const { payment_id } = req.body

    if (!payment_id) {
      return res.status(400).json({ message: 'payment_id is required' })
    }

    const [payments] = await pool.query(
      'SELECT * FROM invoice_payments WHERE id = ?',
      [payment_id]
    )

    if (!payments[0]) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    const payment = payments[0]

    if (!payment.paypack_ref) {
      return res.status(400).json({
        message: 'No Paypack reference found for this payment',
        payment
      })
    }

    console.log('🔍 Verifying payment with ref:', payment.paypack_ref)

    try {
      let transactionStatus = null

      if (typeof paypack.cashin?.status === 'function') {
        const result = await paypack.cashin.status({ ref: payment.paypack_ref })
        transactionStatus = result?.data?.status
        console.log('📊 Status from paypack.cashin.status:', transactionStatus)
      } else {
        transactionStatus = payment.status
        console.log('📊 Using database status:', transactionStatus)
      }

      if (transactionStatus === 'successful') {
        await updateInvoicePaymentStatus(payment.id, 'successful', payment.paypack_ref)
        await updateInvoiceAmounts(payment.invoice_id, payment.amount)
        
        const invoice = await getInvoiceById(payment.invoice_id)
        if (invoice) {
          try {
            await pool.query(
              `INSERT INTO payments (rental_id, amount, payment_date, method, status, notes)
               VALUES (?, ?, CURDATE(), ?, 'paid', ?)`,
              [
                invoice.rental_id,
                payment.amount,
                payment.method === 'mtn_momo' ? 'mtn_momo' : 'airtel_money',
                `Payment for ${invoice.month_year} - Invoice #${payment.invoice_id}`
              ]
            )
            console.log('✅ Payment recorded in payments table')
          } catch (err) {
            console.error('Failed to record in payments:', err.message)
          }
          
          await logActivity(invoice.tenant_id, 'PAYMENT_COMPLETED', `Paid RWF ${payment.amount} for ${invoice.month_year}`, 'payment', payment.id, req.ip)
        }
        
        return res.json({
          message: '✅ Payment confirmed successfully!',
          status: 'successful'
        })
      }
      else if (transactionStatus === 'failed') {
        return res.json({
          message: '❌ Payment failed. Please try again.',
          status: 'failed'
        })
      }
      else {
        return res.json({
          message: '⏳ Payment still pending. Please check your phone to complete the payment.',
          status: 'pending',
          payment_ref: payment.paypack_ref,
          note: 'Please confirm the payment on your phone. This is a real transaction.'
        })
      }
    } catch (paypackErr) {
      console.error('❌ Verification error:', paypackErr.message)

      return res.json({
        message: '⚠️ Could not verify payment status. Please check your phone for confirmation.',
        status: payment.status || 'pending',
        payment_ref: payment.paypack_ref,
        note: 'If money was deducted but status is pending, please contact support.'
      })
    }
  } catch (error) {
    console.error('❌ Verify payment error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
}

// Test endpoint to check Paypack connection
export const testPaypackConnection = async (req, res) => {
  try {
    console.log('🧪 Testing Paypack connection...')

    const methods = []
    if (typeof paypack.cashin === 'object') methods.push('cashin object')
    if (typeof paypack.cashin?.status === 'function') methods.push('cashin.status')
    if (typeof paypack.transactions === 'object') methods.push('transactions object')
    if (typeof paypack.transactions?.get === 'function') methods.push('transactions.get')

    res.json({
      message: 'Paypack test',
      available_methods: methods,
      paypack_keys: Object.keys(paypack),
      config: {
        has_client_id: !!process.env.PAYPACK_CLIENT_ID,
        has_client_secret: !!process.env.PAYPACK_CLIENT_SECRET,
        mode: process.env.PAYPACK_MODE || 'live',
        environment: process.env.PAYPACK_ENVIRONMENT || 'production'
      }
    })
  } catch (error) {
    console.error('Test error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ========== PAYMENT HISTORY FUNCTIONS ==========

// GET /api/invoices/rental/:rental_id/payment-history
export const getRentalPaymentHistory = async (req, res) => {
  try {
    const { rental_id } = req.params

    const [rentals] = await pool.query(
      `SELECT r.*, p.title as property_title, p.landlord_id
       FROM rentals r
       JOIN properties p ON r.property_id = p.id
       WHERE r.id = ? AND (r.tenant_id = ? OR p.landlord_id = ?)`,
      [rental_id, req.user.id, req.user.id]
    )

    if (!rentals[0]) {
      return res.status(403).json({ message: 'Rental not found or not authorized' })
    }

    const rental = rentals[0]

    const [invoices] = await pool.query(
      `SELECT
        i.*,
        COALESCE(SUM(ip.amount), 0) as total_paid
       FROM invoices i
       LEFT JOIN invoice_payments ip ON i.id = ip.invoice_id AND ip.status = 'successful'
       WHERE i.rental_id = ?
       GROUP BY i.id
       ORDER BY i.month_year DESC, i.created_at DESC`,
      [rental_id]
    )

    const formattedInvoices = invoices.map(invoice => ({
      ...invoice,
      total_paid: parseFloat(invoice.total_paid),
      remaining_due: parseFloat(invoice.amount) - parseFloat(invoice.total_paid),
      payment_percentage: (parseFloat(invoice.total_paid) / parseFloat(invoice.amount)) * 100
    }))

    const [summary] = await pool.query(
      `SELECT
        COUNT(DISTINCT i.id) as total_months,
        SUM(CASE WHEN i.status = 'paid' THEN 1 ELSE 0 END) as paid_months,
        SUM(CASE WHEN i.status = 'partial' THEN 1 ELSE 0 END) as partial_months,
        SUM(CASE WHEN i.status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_months,
        SUM(CASE WHEN i.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_months,
        SUM(i.amount) as total_expected,
        COALESCE(SUM(ip.amount), 0) as total_paid,
        SUM(i.amount) - COALESCE(SUM(ip.amount), 0) as total_remaining
       FROM invoices i
       LEFT JOIN invoice_payments ip ON i.id = ip.invoice_id AND ip.status = 'successful'
       WHERE i.rental_id = ?`,
      [rental_id]
    )

    const [payments] = await pool.query(
      `SELECT
        ip.*,
        i.month_year,
        i.amount as invoice_amount
       FROM invoice_payments ip
       JOIN invoices i ON ip.invoice_id = i.id
       WHERE i.rental_id = ? AND ip.status = 'successful'
       ORDER BY ip.created_at DESC`,
      [rental_id]
    )

    res.json({
      rental: {
        id: rental.id,
        property_title: rental.property_title,
        monthly_rent: rental.monthly_rent,
        start_date: rental.start_date,
        end_date: rental.end_date,
        status: rental.status
      },
      summary: {
        total_months: summary[0].total_months || 0,
        paid_months: summary[0].paid_months || 0,
        partial_months: summary[0].partial_months || 0,
        unpaid_months: summary[0].unpaid_months || 0,
        cancelled_months: summary[0].cancelled_months || 0,
        total_expected: parseFloat(summary[0].total_expected || 0),
        total_paid: parseFloat(summary[0].total_paid || 0),
        total_remaining: parseFloat(summary[0].total_remaining || 0)
      },
      payment_history: formattedInvoices,
      all_payments: payments
    })
  } catch (error) {
    console.error('Error getting payment history:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/invoices/my-payments
export const getMyPayments = async (req, res) => {
  try {
    const [payments] = await pool.query(
      `SELECT
        ip.*,
        i.month_year,
        i.due_date,
        i.amount as invoice_amount,
        i.status as invoice_status,
        p.title as property_title,
        p.address as property_address,
        r.monthly_rent,
        u.full_name as landlord_name
       FROM invoice_payments ip
       JOIN invoices i ON ip.invoice_id = i.id
       JOIN rentals r ON i.rental_id = r.id
       JOIN properties p ON r.property_id = p.id
       JOIN users u ON p.landlord_id = u.id
       WHERE i.tenant_id = ?
       ORDER BY ip.created_at DESC`,
      [req.user.id]
    )

    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const successfulPayments = payments.filter(p => p.status === 'successful')
    const pendingPayments = payments.filter(p => p.status === 'pending')

    res.json({
      summary: {
        total_payments: payments.length,
        total_amount_paid: totalAmount,
        successful_count: successfulPayments.length,
        pending_count: pendingPayments.length
      },
      payments: payments
    })
  } catch (error) {
    console.error('Error getting my payments:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/invoices/landlord-payments
export const getLandlordPaymentsAll = async (req, res) => {
  try {
    const [payments] = await pool.query(
      `SELECT
        ip.*,
        i.month_year,
        i.due_date,
        i.amount as invoice_amount,
        p.title as property_title,
        u.full_name as tenant_name,
        u.email as tenant_email,
        u.phone as tenant_phone
       FROM invoice_payments ip
       JOIN invoices i ON ip.invoice_id = i.id
       JOIN rentals r ON i.rental_id = r.id
       JOIN properties p ON r.property_id = p.id
       JOIN users u ON i.tenant_id = u.id
       WHERE i.landlord_id = ?
       AND ip.status = 'successful'
       ORDER BY ip.created_at DESC`,
      [req.user.id]
    )

    const propertiesMap = {}
    payments.forEach(payment => {
      if (!propertiesMap[payment.property_title]) {
        propertiesMap[payment.property_title] = {
          property: payment.property_title,
          total_received: 0,
          payments: []
        }
      }
      propertiesMap[payment.property_title].total_received += parseFloat(payment.amount)
      propertiesMap[payment.property_title].payments.push(payment)
    })

    res.json({
      summary: {
        total_received: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
        total_transactions: payments.length,
        properties_count: Object.keys(propertiesMap).length
      },
      properties: Object.values(propertiesMap),
      all_payments: payments
    })
  } catch (error) {
    console.error('Error getting landlord payments:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/invoices/rental/:rental_id/current-status
export const getCurrentMonthStatus = async (req, res) => {
  try {
    const { rental_id } = req.params
    const currentMonth = new Date().toISOString().slice(0, 7)

    const [result] = await pool.query(
      `SELECT
        i.*,
        COALESCE(SUM(ip.amount), 0) as total_paid,
        i.amount - COALESCE(SUM(ip.amount), 0) as remaining_amount
       FROM invoices i
       LEFT JOIN invoice_payments ip ON i.id = ip.invoice_id AND ip.status = 'successful'
       WHERE i.rental_id = ? AND i.month_year = ?
       GROUP BY i.id`,
      [rental_id, currentMonth]
    )

    if (result.length === 0) {
      const [rental] = await pool.query(
        `SELECT r.*, p.title as property_title
         FROM rentals r
         JOIN properties p ON r.property_id = p.id
         WHERE r.id = ?`,
        [rental_id]
      )

      return res.json({
        has_invoice: false,
        message: 'No invoice created for this month yet',
        rental: rental[0],
        suggested_amount: rental[0]?.monthly_rent
      })
    }

    const invoice = result[0]
    
    res.json({
      has_invoice: true,
      invoice_id: invoice.id,
      month_year: invoice.month_year,
      due_date: invoice.due_date,
      total_amount: parseFloat(invoice.amount),
      paid_amount: parseFloat(invoice.total_paid),
      remaining_amount: parseFloat(invoice.remaining_amount),
      status: invoice.status,
      is_paid: invoice.status === 'paid',
      is_partial: invoice.status === 'partial',
      is_unpaid: invoice.status === 'unpaid',
      is_cancelled: invoice.status === 'cancelled',
      payment_percentage: (parseFloat(invoice.total_paid) / parseFloat(invoice.amount)) * 100
    })
  } catch (error) {
    console.error('Error getting current month status:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}