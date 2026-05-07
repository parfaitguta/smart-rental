import {
  createRequest, getRequestById, getRequestsByLandlord,
  getRequestsByRenter, updateRequestStatus, checkExistingRequest
} from '../models/rentalRequestModel.js'
import { getPropertyById, updateProperty } from '../models/propertyModel.js'
import { NOTIF } from '../utils/notify.js'
import pool from '../config/db.js'

export const sendRequest = async (req, res) => {
  try {
    const { property_id, message } = req.body

    if (!property_id) {
      return res.status(400).json({ message: 'Property ID is required' })
    }

    const property = await getPropertyById(property_id)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    if (property.status !== 'available') {
      return res.status(400).json({ message: 'Property is not available for rent' })
    }
    if (property.landlord_id === req.user.id) {
      return res.status(400).json({ message: 'You cannot request your own property' })
    }

    const existing = await checkExistingRequest(property_id, req.user.id)
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this property' })
    }

    const id = await createRequest(property_id, req.user.id, message)
    const request = await getRequestById(id)

    await NOTIF.newRequest(property.landlord_id, req.user.full_name, property.title)

    res.status(201).json({ message: 'Rental request sent successfully', request })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const landlordRequests = async (req, res) => {
  try {
    const requests = await getRequestsByLandlord(req.user.id)
    res.json({ count: requests.length, requests })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const renterRequests = async (req, res) => {
  try {
    const requests = await getRequestsByRenter(req.user.id)
    res.json({ count: requests.length, requests })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Approve rental request - creates rental agreement automatically
export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.id;
    
    // Get the request with property and tenant details
    const [requests] = await pool.query(
      `SELECT rr.*, 
              p.landlord_id, 
              p.title as property_title, 
              p.price as monthly_rent,
              u.full_name as tenant_name, 
              u.email as tenant_email, 
              u.phone as tenant_phone,
              u.id as tenant_id
       FROM rental_requests rr
       JOIN properties p ON rr.property_id = p.id
       JOIN users u ON rr.renter_id = u.id
       WHERE rr.id = ? AND p.landlord_id = ?`,
      [id, landlordId]
    );
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found or not authorized' });
    }
    
    const request = requests[0];
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }
    
    // Update request status to approved
    await pool.query(
      `UPDATE rental_requests SET status = 'approved', updated_at = NOW() WHERE id = ?`,
      [id]
    );
    
    // Create rental agreement
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    const [rentalResult] = await pool.query(
      `INSERT INTO rentals (property_id, tenant_id, start_date, end_date, monthly_rent, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [request.property_id, request.tenant_id, startDate, endDate, request.monthly_rent || 0]
    );
    
    // Update property status to rented
    await pool.query(
      `UPDATE properties SET status = 'rented' WHERE id = ?`,
      [request.property_id]
    );
    
    // Notify tenant (optional)
    try {
      await NOTIF.requestAccepted(request.tenant_id, request.property_title);
    } catch (notifErr) {
      console.error('Notification failed:', notifErr.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Request approved and rental created',
      rental_id: rentalResult.insertId
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject rental request
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.id;
    
    // Get the request
    const [requests] = await pool.query(
      `SELECT rr.*, p.landlord_id, p.title as property_title
       FROM rental_requests rr
       JOIN properties p ON rr.property_id = p.id
       WHERE rr.id = ? AND p.landlord_id = ?`,
      [id, landlordId]
    );
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found or not authorized' });
    }
    
    const request = requests[0];
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }
    
    // Update request status to rejected
    await pool.query(
      `UPDATE rental_requests SET status = 'rejected', updated_at = NOW() WHERE id = ?`,
      [id]
    );
    
    // Notify tenant (optional)
    try {
      await NOTIF.requestRejected(request.renter_id, request.property_title);
    } catch (notifErr) {
      console.error('Notification failed:', notifErr.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Request rejected'
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept request (original - kept for backward compatibility)
export const acceptRequest = async (req, res) => {
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

    await updateRequestStatus(req.params.id, 'accepted')
    await NOTIF.requestAccepted(request.renter_id, request.property_title)

    res.json({ message: 'Request accepted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Reject request (original - kept for backward compatibility)
export const rejectRequestLegacy = async (req, res) => {
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
    await NOTIF.requestRejected(request.renter_id, request.property_title)

    res.json({ message: 'Request rejected' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}