import {
  createProperty, getAllProperties, getPropertyById,
  getLandlordProperties, updateProperty, deleteProperty
} from '../models/propertyModel.js'

// POST /api/properties — landlord adds a property
export const addProperty = async (req, res) => {
  try {
    const { title, description, price, province, district, sector, cell, village, latitude, longitude } = req.body

    if (!title || !price || !province || !district) {
      return res.status(400).json({ message: 'Title, price, province and district are required' })
    }

    const id = await createProperty({ landlord_id: req.user.id, title, description, price, province, district, sector, cell, village, latitude, longitude })
    const property = await getPropertyById(id)

    res.status(201).json({ message: 'Property added successfully', property })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/properties — all renters can browse
export const listProperties = async (req, res) => {
  try {
    const filters = req.query
    const properties = await getAllProperties(filters)
    res.json({ count: properties.length, properties })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/properties/:id — view one property
export const getProperty = async (req, res) => {
  try {
    const property = await getPropertyById(req.params.id)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    res.json({ property })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/properties/my — landlord views their own properties
export const myProperties = async (req, res) => {
  try {
    const properties = await getLandlordProperties(req.user.id)
    res.json({ count: properties.length, properties })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/properties/:id — landlord updates a property
export const editProperty = async (req, res) => {
  try {
    const affected = await updateProperty(req.params.id, req.user.id, req.body)
    if (!affected) {
      return res.status(404).json({ message: 'Property not found or not yours' })
    }
    const property = await getPropertyById(req.params.id)
    res.json({ message: 'Property updated successfully', property })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/properties/:id — landlord deletes a property
export const removeProperty = async (req, res) => {
  try {
    const affected = await deleteProperty(req.params.id, req.user.id)
    if (!affected) {
      return res.status(404).json({ message: 'Property not found or not yours' })
    }
    res.json({ message: 'Property deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}