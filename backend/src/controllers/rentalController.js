import {
  createRental, getRentalById, getRentalsByLandlord,
  getRentalsByTenant, updateRentalStatus, checkActiveRental
} from '../models/rentalModel.js'
import { getPropertyById, updateProperty } from '../models/propertyModel.js'
import { NOTIF } from '../utils/notify.js'

export const createRentalAgreement = async (req, res) => {
  try {
    const { property_id, tenant_id, start_date, end_date, monthly_rent } = req.body

    if (!property_id || !tenant_id || !start_date || !monthly_rent) {
      return res.status(400).json({ message: 'property_id, tenant_id, start_date and monthly_rent are required' })
    }

    const property = await getPropertyById(property_id)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    if (property.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized — this is not your property' })
    }

    const activeRental = await checkActiveRental(property_id)
    if (activeRental) {
      return res.status(400).json({ message: 'Property already has an active rental agreement' })
    }

    const id = await createRental({ property_id, tenant_id, start_date, end_date, monthly_rent })
    await updateProperty(property_id, req.user.id, { ...property, status: 'rented' })
    await NOTIF.agreementCreated(tenant_id, property.title)

    const rental = await getRentalById(id)
    res.status(201).json({ message: 'Rental agreement created successfully', rental })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getLandlordRentals = async (req, res) => {
  try {
    const rentals = await getRentalsByLandlord(req.user.id)
    res.json({ count: rentals.length, rentals })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getTenantRentals = async (req, res) => {
  try {
    const rentals = await getRentalsByTenant(req.user.id)
    res.json({ count: rentals.length, rentals })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getRentalDetail = async (req, res) => {
  try {
    const rental = await getRentalById(req.params.id)
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' })
    }
    if (rental.landlord_id !== req.user.id && rental.tenant_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this rental' })
    }
    res.json({ rental })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const terminateRental = async (req, res) => {
  try {
    const rental = await getRentalById(req.params.id)
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' })
    }
    if (rental.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to terminate this rental' })
    }
    if (rental.status !== 'active') {
      return res.status(400).json({ message: `Rental is already ${rental.status}` })
    }

    await updateRentalStatus(req.params.id, 'terminated')

    const property = await getPropertyById(rental.property_id)
    await updateProperty(rental.property_id, req.user.id, { ...property, status: 'available' })

    res.json({ message: 'Rental terminated successfully. Property is now available.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}