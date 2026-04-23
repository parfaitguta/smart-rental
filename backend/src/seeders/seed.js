import pool from '../config/db.js'
import bcrypt from 'bcryptjs'

const seed = async () => {
  try {
    console.log('🌱 Starting seeding...')

    // Clear existing data in correct order
    await pool.query('SET FOREIGN_KEY_CHECKS = 0')
    await pool.query('TRUNCATE TABLE payments')
    await pool.query('TRUNCATE TABLE rentals')
    await pool.query('TRUNCATE TABLE rental_requests')
    await pool.query('TRUNCATE TABLE properties')
    await pool.query('TRUNCATE TABLE users')
    await pool.query('SET FOREIGN_KEY_CHECKS = 1')
    console.log('🧹 Cleared existing data')

    // ─── USERS ───────────────────────────────────────────
    const password = await bcrypt.hash('password123', 12)

    const users = [
      ['Tuyisabe Parfait',   'parfait@gmail.com',   '0780776354', password, 'landlord'],
      ['Uwimana Alice',      'alice@gmail.com',     '0788111222', password, 'landlord'],
      ['Habimana Jean',      'jean@gmail.com',      '0722333444', password, 'renter'],
      ['Mukamana Grace',     'grace@gmail.com',     '0733444555', password, 'renter'],
      ['Niyonzima Eric',     'eric@gmail.com',      '0744555666', password, 'renter'],
      ['Irakoze Sandra',     'sandra@gmail.com',    '0755666777', password, 'renter'],
      ['Admin System',       'admin@rental.rw',     '0700000001', password, 'admin'],
    ]

    const [userResult] = await pool.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ?',
      [users]
    )
    console.log(`✅ Seeded ${userResult.affectedRows} users`)

    // ─── PROPERTIES ──────────────────────────────────────
    const properties = [
      // Parfait's properties (landlord id=1)
      [1, 'Modern 2-Bedroom in Kimironko', 'Spacious apartment with parking, 24/7 security and water', 150000, 'Kigali', 'Gasabo',    'Kimironko', 'Bibare',    'Amahoro',   -1.9355, 30.1034, 'available'],
      [1, 'Studio Apartment in Remera',    'Self-contained studio near UTC Remera, fully furnished',  80000,  'Kigali', 'Gasabo',    'Remera',    'Nyabisindu','Urugwiro',  -1.9536, 30.1127, 'available'],
      [1, 'Family House in Kacyiru',       '3 bedrooms, large compound, borehole water',              250000, 'Kigali', 'Gasabo',    'Kacyiru',   'Kamatamu',  'Inkingi',   -1.9394, 30.0894, 'rented'],

      // Alice's properties (landlord id=2)
      [2, 'Cozy Room in Nyamirambo',       'Single room with shared kitchen, near market',            40000,  'Kigali', 'Nyarugenge','Nyamirambo', 'Cyivugiza', 'Iterambere',-1.9831, 30.0441, 'available'],
      [2, '2-Bedroom in Gisozi',           'Quiet neighborhood, good roads, near schools',            120000, 'Kigali', 'Gasabo',    'Gisozi',    'Bumbogo',   'Ubumwe',    -1.9134, 30.0762, 'available'],
      [2, 'Shop + House in Musanze',       'Ground floor shop, upper floor 2 bedrooms',              180000, 'Northern','Musanze',   'Muhoza',    'Cyabararika','Ubwiyunge', -1.4990, 29.6340, 'available'],

      // More variety
      [1, 'Single Room in Gikondo',        'Clean room, shared bathroom, near Gikondo market',       35000,  'Kigali', 'Kicukiro',  'Gikondo',   'Rwampara',  'Inzira',    -1.9814, 30.0794, 'available'],
      [2, '3-Bedroom in Huye',             'Spacious home near NUR university campus',               160000, 'Southern','Huye',     'Ngoma',     'Cyarwa',    'Isangano',  -2.5967, 29.7369, 'available'],
    ]

    const [propResult] = await pool.query(
      `INSERT INTO properties 
       (landlord_id, title, description, price, province, district, sector, cell, village, latitude, longitude, status) 
       VALUES ?`,
      [properties]
    )
    console.log(`✅ Seeded ${propResult.affectedRows} properties`)

    // ─── RENTAL REQUESTS ─────────────────────────────────
    const requests = [
      [1, 3, 'pending',  'I am interested in this apartment, available to move in next week'],
      [2, 4, 'accepted', 'Please consider my request, I am a working professional'],
      [4, 5, 'pending',  'Looking for a quiet place, this seems perfect'],
      [5, 6, 'rejected', 'I would like to rent this property for 6 months'],
    ]

    const [reqResult] = await pool.query(
      'INSERT INTO rental_requests (property_id, renter_id, status, message) VALUES ?',
      [requests]
    )
    console.log(`✅ Seeded ${reqResult.affectedRows} rental requests`)

    // ─── RENTALS (active agreements) ─────────────────────
    const rentals = [
      [3, 3, '2026-01-01', '2026-12-31', 250000, 'active'],
      [4, 4, '2026-02-01', '2026-07-31', 40000,  'active'],
    ]

    const [rentalResult] = await pool.query(
      'INSERT INTO rentals (property_id, tenant_id, start_date, end_date, monthly_rent, status) VALUES ?',
      [rentals]
    )
    console.log(`✅ Seeded ${rentalResult.affectedRows} rentals`)

    // ─── PAYMENTS ────────────────────────────────────────
    const payments = [
      // Rental 1 payments (Jean renting Kacyiru house)
      [1, 250000, '2026-01-05', 'mtn_momo',    'paid',    'January rent'],
      [1, 250000, '2026-02-04', 'mtn_momo',    'paid',    'February rent'],
      [1, 250000, '2026-03-03', 'cash',         'paid',    'March rent'],
      [1, 250000, '2026-04-01', 'airtel_money', 'pending', 'April rent - awaiting confirmation'],

      // Rental 2 payments (Grace renting Nyamirambo room)
      [2, 40000,  '2026-02-05', 'cash',         'paid',    'February rent'],
      [2, 40000,  '2026-03-06', 'mtn_momo',    'paid',    'March rent'],
      [2, 40000,  '2026-04-01', 'cash',         'overdue', 'April rent overdue'],
    ]

    const [payResult] = await pool.query(
      'INSERT INTO payments (rental_id, amount, payment_date, method, status, notes) VALUES ?',
      [payments]
    )
    console.log(`✅ Seeded ${payResult.affectedRows} payments`)

    console.log('\n🎉 Seeding completed successfully!')
    console.log('─────────────────────────────────────')
    console.log('Test accounts (all use password: password123)')
    console.log('  Landlord 1 : parfait@gmail.com')
    console.log('  Landlord 2 : alice@gmail.com')
    console.log('  Renter 1   : jean@gmail.com')
    console.log('  Renter 2   : grace@gmail.com')
    console.log('  Admin      : admin@rental.rw')
    console.log('─────────────────────────────────────')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

seed()