import pool from '../config/db.js'
import fs from 'fs'
import path from 'path'

// POST /api/images/:propertyId — upload images
export const uploadImages = async (req, res) => {
  try {
    const { propertyId } = req.params

    // Verify property belongs to landlord
    const [props] = await pool.query(
      'SELECT * FROM properties WHERE id = ? AND landlord_id = ?',
      [propertyId, req.user.id]
    )
    if (!props[0]) {
      return res.status(403).json({ message: 'Not authorized or property not found' })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' })
    }

    // Check if property already has a primary image
    const [existing] = await pool.query(
      'SELECT COUNT(*) as count FROM property_images WHERE property_id = ?',
      [propertyId]
    )
    const hasImages = existing[0].count > 0

    // Save each image to database
    const imageUrls = []
    for (let i = 0; i < req.files.length; i++) {
      const imageUrl = `/uploads/${req.files[i].filename}`
      const isPrimary = !hasImages && i === 0 // first image is primary if none exist

      await pool.query(
        'INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)',
        [propertyId, imageUrl, isPrimary]
      )
      imageUrls.push(imageUrl)
    }

    res.status(201).json({
      message: `${req.files.length} image(s) uploaded successfully`,
      images: imageUrls
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/images/:propertyId — get all images for a property
export const getPropertyImages = async (req, res) => {
  try {
    const [images] = await pool.query(
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, created_at ASC',
      [req.params.propertyId]
    )
    res.json({ images })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/images/:imageId — delete an image
export const deleteImage = async (req, res) => {
  try {
    const [images] = await pool.query(
      `SELECT pi.*, p.landlord_id 
       FROM property_images pi
       JOIN properties p ON pi.property_id = p.id
       WHERE pi.id = ?`,
      [req.params.imageId]
    )

    if (!images[0]) {
      return res.status(404).json({ message: 'Image not found' })
    }
    if (images[0].landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this image' })
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'src', images[0].image_url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await pool.query('DELETE FROM property_images WHERE id = ?', [req.params.imageId])
    res.json({ message: 'Image deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/images/:imageId/primary — set as primary image
export const setPrimaryImage = async (req, res) => {
  try {
    const [images] = await pool.query(
      `SELECT pi.*, p.landlord_id 
       FROM property_images pi
       JOIN properties p ON pi.property_id = p.id
       WHERE pi.id = ?`,
      [req.params.imageId]
    )

    if (!images[0]) {
      return res.status(404).json({ message: 'Image not found' })
    }
    if (images[0].landlord_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // Remove primary from all images of this property
    await pool.query(
      'UPDATE property_images SET is_primary = FALSE WHERE property_id = ?',
      [images[0].property_id]
    )

    // Set this one as primary
    await pool.query(
      'UPDATE property_images SET is_primary = TRUE WHERE id = ?',
      [req.params.imageId]
    )

    res.json({ message: 'Primary image updated' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}