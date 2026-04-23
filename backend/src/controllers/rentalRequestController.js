import {
  createRequest, getRequestById, getRequestsByLandlord,
  getRequestsByRenter, updateRequestStatus, checkExistingRequest
} from '../models/rentalRequestModel.js'
import { getPropertyById } from '../models/propertyModel.js'

// POST /api/requests — renter sends a request
export const sendRequest = async (req, res) => {
  try {
    const { property_id, message } = req.body

    if (!property_id) {
      return res.status(400).json({ message: 'Property ID is required' })
    }

    // Check property exists and is available
    const property = await getPropertyById(property_id)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    if (property.status !== 'available') {
      return res.status(400).json({ message: 'Property is not available for rent' })
    }

    // Check renter is not the landlord
    if (property.landlord_id === req.user.id) {
      return res.status(400).json({ message: 'You cannot request your own property' })
    }

    // Check if pending request already exists
    const existing = await checkExistingRequest(property_id, req.user.id)
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this property' })
    }

    const id = await createRequest(property_id, req.user.id, message)
    const request = await getRequestById(id)

    res.status(201).json({ message: 'Rental request sent successfully', request })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/requests/landlord — landlord sees all requests on their properties
export const landlordRequests = async (req, res) => {
  try {
    const requests = await getRequestsByLandlord(req.user.id)
    res.json({ count: requests.length, requests })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/requests/renter — renter sees their own requests
export const renterRequests = async (req, res) => {
  try {
    const requests = await getRequestsByRenter(req.user.id)
    res.json({ count: requests.length, requests })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/requests/:id/accept — landlord accepts request
export const acceptRequest = async (req, res) => {
  try {
    const request = await getRequestById(req.params.id)
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    // Verify this property belongs to the landlord
    const property = await getPropertyById(request.property_id)
    if (property.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to manage this request' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` })
    }

    await updateRequestStatus(req.params.id, 'accepted')
    res.json({ message: 'Request accepted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/requests/:id/reject — landlord rejects request
export const rejectRequest = async (req, res) => {
  try {
    const request = await getRequestById(req.params.id)
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    const property = await getPropertyById(request.property_id)
    if (property.landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to manage this request' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` })
    }

    await updateRequestStatus(req.params.id, 'rejected')
    res.json({ message: 'Request rejected' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}