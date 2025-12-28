import { Router } from 'express';
import { auth } from './../../middlewares/auth.middleware';
import {
  createBookingCtrl,
  getBookingsCtrl,
  updateBookingCtrl,
} from './booking.controller';
const router = Router();

// All booking routes require authentication

// CREATE BOOKING - Customer or Admin
router.post('/', auth, createBookingCtrl);

// GET ALL BOOKINGS - Admin sees all, Customer sees own
router.get('/', auth, getBookingsCtrl);

// UPDATE BOOKING STATUS
router.put('/:bookingId', auth, updateBookingCtrl);

export default router;