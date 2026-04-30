import {
  getTenantsForLandlord, getTenantDetails, getTenantPayments,
  getTenantNotes, addTenantNote, updateTenantStatus,
  terminateWithReason, deleteTenantNote
} from '../models/tenantModel.js'
import { getPropertyById, updateProperty } from '../models/propertyModel.js'

// GET /api/tenants — landlord gets all their tenants
export const getMyTenants = async (req, res) => {
  try {
    const tenants = await getTenantsForLandlord(req.user.id)
    res.json({ count: tenants.length, tenants })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/tenants/:rentalId — get full tenant details
export const getTenantDetail = async (req, res) => {
  try {
    const tenant = await getTenantDetails(req.params.rentalId, req.user.id)
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found or not authorized' })
    }

    const [payments, notes] = await Promise.all([
      getTenantPayments(req.params.rentalId),
      getTenantNotes(req.params.rentalId)
    ])

    res.json({ tenant, payments, notes })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// POST /api/tenants/:rentalId/notes — add note about tenant
export const addNote = async (req, res) => {
  try {
    const { note, type } = req.body

    if (!note) {
      return res.status(400).json({ message: 'Note is required' })
    }

    const tenant = await getTenantDetails(req.params.rentalId, req.user.id)
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found or not authorized' })
    }

    const id = await addTenantNote(
      req.params.rentalId, req.user.id,
      tenant.tenant_id, note,
      type || 'general'
    )

    // If warning, update tenant status
    if (type === 'warning') {
      const notes = await getTenantNotes(req.params.rentalId)
      const warnings = notes.filter(n => n.type === 'warning').length
      if (warnings >= 3) {
        await updateTenantStatus(req.params.rentalId, 'problematic')
      } else if (warnings >= 1) {
        await updateTenantStatus(req.params.rentalId, 'warning')
      }
    }

    res.status(201).json({ message: 'Note added successfully', id })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/tenants/:rentalId/status — update tenant status
export const updateStatus = async (req, res) => {
  try {
    const { tenant_status } = req.body

    if (!['good', 'warning', 'problematic'].includes(tenant_status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const tenant = await getTenantDetails(req.params.rentalId, req.user.id)
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found or not authorized' })
    }

    await updateTenantStatus(req.params.rentalId, tenant_status)
    res.json({ message: `Tenant status updated to ${tenant_status}` })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/tenants/:rentalId/terminate — terminate with reason
export const terminateTenancy = async (req, res) => {
  try {
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ message: 'Termination reason is required' })
    }

    const tenant = await getTenantDetails(req.params.rentalId, req.user.id)
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found or not authorized' })
    }
    if (tenant.status !== 'active') {
      return res.status(400).json({ message: 'Rental is not active' })
    }

    await terminateWithReason(req.params.rentalId, reason)

    // Mark property as available
    const property = await getPropertyById(tenant.property_id)
    await updateProperty(tenant.property_id, req.user.id, { ...property, status: 'available' })

    res.json({ message: 'Tenancy terminated successfully. Property is now available.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/tenants/notes/:noteId — delete a note
export const deleteNote = async (req, res) => {
  try {
    const affected = await deleteTenantNote(req.params.noteId, req.user.id)
    if (!affected) {
      return res.status(404).json({ message: 'Note not found or not authorized' })
    }
    res.json({ message: 'Note deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}