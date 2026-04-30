import {
  createProperty, getAllProperties, getPropertyById,
  getLandlordProperties, updateProperty, deleteProperty
} from '../models/propertyModel.js'
import { LOG } from '../utils/activityLogger.js'

export const addProperty = async (req, res) => {
  try {
    const { title, description, price, province, district, sector, cell, village, latitude, longitude } = req.body

    if (!title || !price || !province || !district) {
      return res.status(400).json({ message: 'Title, price, province and district are required' })
    }

    const id = await createProperty({
      landlord_id: req.user.id, title, description, price,
      province, district, sector, cell, village, latitude, longitude
    })

    await LOG.propertyAdded(req.user.id, id, title, req.ip)

    const property = await getPropertyById(id)
    res.status(201).json({ message: 'Property added successfully', property })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const listProperties = async (req, res) => {
  try {
    const filters = {
      province: req.query.province,
      district: req.query.district,
      min_price: req.query.min_price,
      max_price: req.query.max_price
    }
    const properties = await getAllProperties(filters)
    res.json({ count: properties.length, properties })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

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

export const myProperties = async (req, res) => {
  try {
    const properties = await getLandlordProperties(req.user.id)
    res.json({ count: properties.length, properties })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const editProperty = async (req, res) => {
  try {
    const affected = await updateProperty(req.params.id, req.user.id, req.body)
    if (!affected) {
      return res.status(404).json({ message: 'Property not found or not yours' })
    }

    await LOG.propertyUpdated(req.user.id, req.params.id, req.body.title || 'Property', req.ip)

    const property = await getPropertyById(req.params.id)
    res.json({ message: 'Property updated successfully', property })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const removeProperty = async (req, res) => {
  try {
    const property = await getPropertyById(req.params.id)
    const affected = await deleteProperty(req.params.id, req.user.id)
    if (!affected) {
      return res.status(404).json({ message: 'Property not found or not yours' })
    }

    await LOG.propertyDeleted(req.user.id, property?.title || 'Property', req.ip)

    res.json({ message: 'Property deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}