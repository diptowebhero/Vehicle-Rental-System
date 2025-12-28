import { NextFunction, Request, Response } from 'express';
import {
  createBooking,
  getAllBookings,
  updateBookingStatus,
} from './booking.service';

// POST /api/v1/bookings
export const createBookingCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicle_id, rent_start_date, rent_end_date } = req.body;
    const customer_id = req.user?.role === 'admin' ? req.body.customer_id : req.user?.id;

    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const booking = await createBooking(
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error: any) {
    next(error);
  }
};

// GET /api/v1/bookings
export const getBookingsCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await getAllBookings({
      id: req.user!.id,
      role: req.user!.role,
    });

    const message =
      req.user?.role === 'admin'
        ? 'Bookings retrieved successfully'
        : 'Your bookings retrieved successfully';

    res.status(200).json({
      success: true,
      message,
      data: bookings,
    });
  } catch (error: any) {
    next(error);
  }
};

// PUT /api/v1/bookings/:bookingId


export const updateBookingCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const role = req.user!.role; // customer | admin

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    // role validation
    if (status === 'cancelled' && role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customer can cancel booking',
      });
    }

    if (status === 'returned' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can mark booking as returned',
      });
    }

    const updatedBooking = await updateBookingStatus(
      Number(bookingId),
      status,
      role
    );

    res.status(200).json({
      success: true,
      message:
        status === 'cancelled'
          ? 'Booking cancelled successfully'
          : 'Booking marked as returned and vehicle is now available',
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};
