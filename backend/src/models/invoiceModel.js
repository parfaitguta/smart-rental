import pool from '../config/db.js'

export const createInvoice = async (data) => {
  const { rental_id, tenant_id, landlord_id, amount, month_year, due_date, notes } = data
  const [result] = await pool.query(
    `INSERT INTO invoices 
     (rental_id, tenant_id, landlord_id, amount, remaining, month_year, due_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [rental_id, tenant_id, landlord_id, amount, amount, month_year, due_date, notes || null]
  )
  return result.insertId
}

export const getInvoiceById = async (id) => {
  const [rows] = await pool.query(
    `SELECT i.*,
            t.full_name as tenant_name, t.phone as tenant_phone, t.email as tenant_email,
            l.full_name as landlord_name, l.phone as landlord_phone,
            p.title as property_title, p.district, p.province
     FROM invoices i
     JOIN users t ON i.tenant_id = t.id
     JOIN users l ON i.landlord_id = l.id
     JOIN rentals r ON i.rental_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE i.id = ?`,
    [id]
  )
  return rows[0]
}

export const getTenantInvoices = async (tenant_id) => {
  const [rows] = await pool.query(
    `SELECT i.*,
            l.full_name as landlord_name, l.phone as landlord_phone,
            p.title as property_title, p.district, p.province
     FROM invoices i
     JOIN users l ON i.landlord_id = l.id
     JOIN rentals r ON i.rental_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE i.tenant_id = ?
     ORDER BY i.created_at DESC`,
    [tenant_id]
  )
  return rows
}

export const getLandlordInvoices = async (landlord_id) => {
  const [rows] = await pool.query(
    `SELECT i.*,
            t.full_name as tenant_name, t.phone as tenant_phone,
            p.title as property_title, p.district, p.province
     FROM invoices i
     JOIN users t ON i.tenant_id = t.id
     JOIN rentals r ON i.rental_id = r.id
     JOIN properties p ON r.property_id = p.id
     WHERE i.landlord_id = ?
     ORDER BY i.created_at DESC`,
    [landlord_id]
  )
  return rows
}

export const getInvoicePayments = async (invoice_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM invoice_payments WHERE invoice_id = ? ORDER BY created_at DESC',
    [invoice_id]
  )
  return rows
}

export const createInvoicePayment = async (data) => {
  const { invoice_id, amount, phone, method, transaction_ref } = data
  const [result] = await pool.query(
    `INSERT INTO invoice_payments (invoice_id, amount, phone, method, transaction_ref, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [invoice_id, amount, phone, method, transaction_ref || null]
  )
  return result.insertId
}

export const updateInvoicePaymentStatus = async (id, status, paypack_ref) => {
  await pool.query(
    `UPDATE invoice_payments 
     SET status = ?, paypack_ref = ?, paid_at = CASE WHEN ? = 'successful' THEN NOW() ELSE NULL END
     WHERE id = ?`,
    [status, paypack_ref || null, status, id]
  )
}

export const updateInvoiceAmounts = async (invoice_id, amount_paid) => {
  await pool.query(
    `UPDATE invoices 
     SET amount_paid = amount_paid + ?,
         remaining = remaining - ?,
         status = CASE 
           WHEN (remaining - ?) <= 0 THEN 'paid'
           WHEN (remaining - ?) < amount THEN 'partial'
           ELSE status
         END,
         updated_at = NOW()
     WHERE id = ?`,
    [amount_paid, amount_paid, amount_paid, amount_paid, invoice_id]
  )
}

export const checkOverdueInvoices = async () => {
  await pool.query(
    `UPDATE invoices 
     SET status = 'overdue'
     WHERE due_date < CURDATE() 
     AND status IN ('unpaid', 'partial')`
  )
}