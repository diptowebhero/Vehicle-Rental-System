import express from 'express'
import './config/env'
import authRoutes from './modules/auth/auth.route'
import bookingRoutes from './modules/bookings/booking.route'
import userRoutes from './modules/users/user.route'
import vehicleRoutes from './modules/vehicles/vehicle.route'



const app = express()
app.use(express.json())



app.use('/api/v1/auth', authRoutes)
app.use('/api/v1', userRoutes)
app.use('/api/v1/vehicles', vehicleRoutes)
app.use('/api/v1/bookings', bookingRoutes)


export default app