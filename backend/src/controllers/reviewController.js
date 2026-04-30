import {
  createReview, getPropertyReviews, getPropertyRating,
  getRenterReviews, checkExistingReview, deleteReview,
  getLandlordReviews
} from '../models/reviewModel.js'
import pool from '../config/db.js'

// POST /api/reviews — renter submits a review
export const submitReview = async (req, res) => {
  try {
    const { property_id, rental_id, rating, comment } = req.body

    if (!property_id || !rental_id || !rating) {
      return res.status(400).json({ message: 'property_id, rental_id and rating are required' })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    // Verify rental belongs to renter
    const [rentals] = await pool.query(
      'SELECT * FROM rentals WHERE id = ? AND tenant_id = ?',
      [rental_id, req.user.id]
    )
    if (!rentals[0]) {
      return res.status(403).json({ message: 'You can only review properties you have rented' })
    }

    // Check if already reviewed
    const existing = await checkExistingReview(rental_id, req.user.id)
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this rental' })
    }

    const id = await createReview(property_id, req.user.id, rental_id, rating, comment)
    res.status(201).json({ message: 'Review submitted successfully', id })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/reviews/property/:id — get reviews for a property
export const propertyReviews = async (req, res) => {
  try {
    const reviews = await getPropertyReviews(req.params.id)
    const rating = await getPropertyRating(req.params.id)
    res.json({ reviews, rating })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/reviews/my — renter sees their reviews
export const myReviews = async (req, res) => {
  try {
    const reviews = await getRenterReviews(req.user.id)
    res.json({ count: reviews.length, reviews })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/reviews/landlord — landlord sees reviews on their properties
export const landlordReviews = async (req, res) => {
  try {
    const reviews = await getLandlordReviews(req.user.id)
    res.json({ count: reviews.length, reviews })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/reviews/:id — renter deletes their review
export const removeReview = async (req, res) => {
  try {
    const affected = await deleteReview(req.params.id, req.user.id)
    if (!affected) {
      return res.status(404).json({ message: 'Review not found or not authorized' })
    }
    res.json({ message: 'Review deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}