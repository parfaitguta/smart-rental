import Paypack from 'paypack-js'
import dotenv from 'dotenv'
dotenv.config()

const paypack = new Paypack.default({
  client_id: process.env.PAYPACK_CLIENT_ID,
  client_secret: process.env.PAYPACK_CLIENT_SECRET,
  mode: process.env.PAYPACK_MODE || 'live'
})

export default paypack