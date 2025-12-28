import { pool } from '../../config/db'; // adjust path as needed
import { AppError } from '../../utils/AppError';

// Helper: Calculate total days (inclusive)
const calculateDays = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
};

// CREATE BOOKING
export const createBooking = async (
  customerId: number,
  vehicleId: number,
  rentStartDate: string,
  rentEndDate: string
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Check if vehicle exists and is available
    const vehicleRes = await client.query(
      `SELECT v.id, v.vehicle_name, v.daily_rent_price, v.availability_status
       FROM vehicles v
       WHERE v.id = $1 FOR UPDATE`,
      [vehicleId]
    );

    if (vehicleRes.rowCount === 0) {
      throw { status: 404, message: 'Vehicle not found' };
    }

    const vehicle = vehicleRes.rows[0];

    if (vehicle.availability_status !== 'available') {
      throw { status: 400, message: 'Vehicle is not available for booking' };
    }

    // 2. Check for overlapping bookings
    const overlapRes = await client.query(
      `SELECT id FROM bookings
       WHERE vehicle_id = $1
         AND status = 'active'
         AND (
           (rent_start_date <= $2 AND rent_end_date >= $2) OR
           (rent_start_date <= $3 AND rent_end_date >= $3) OR
           (rent_start_date >= $2 AND rent_end_date <= $3)
         )`,
      [vehicleId, rentStartDate, rentEndDate]
    );

    if ((overlapRes.rowCount ?? 0) > 0) {
      throw { status: 400, message: 'Vehicle is already booked for the selected dates' };
    }

    // 3. Calculate total price
    const days = calculateDays(rentStartDate, rentEndDate);
    const totalPrice = days * Number(vehicle.daily_rent_price);

    // 4. Create booking
    const bookingRes = await client.query(
      `INSERT INTO bookings
       (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
      [customerId, vehicleId, rentStartDate, rentEndDate, totalPrice]
    );

    // 5. Update vehicle status to booked
    await client.query(
      `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
      [vehicleId]
    );

    await client.query('COMMIT');

    return {
      ...bookingRes.rows[0],
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: Number(vehicle.daily_rent_price),
      },
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// GET ALL BOOKINGS (role-based)
export const getAllBookings = async (currentUser: { id: number; role: string }) => {
  const isAdmin = currentUser.role === 'admin';

  let query = `
    SELECT 
      b.id, b.customer_id, b.vehicle_id, b.rent_start_date, b.rent_end_date,
      b.total_price, b.status,
      v.vehicle_name, v.registration_number, v.type,
      u.name AS customer_name, u.email AS customer_email
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
  `;

  const values: any[] = [];

  if (!isAdmin) {
    query += ` JOIN users u ON b.customer_id = u.id WHERE b.customer_id = $1`;
    values.push(currentUser.id);
  } else {
    query += ` LEFT JOIN users u ON b.customer_id = u.id`;
  }

  query += ` ORDER BY b.created_at DESC`;

  const result = await pool.query(query, values);

  return result.rows.map((row: any) => {
    const base = {
      id: row.id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: Number(row.total_price),
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
      },
    };

    if (isAdmin) {
      return {
        ...base,
        customer_id: row.customer_id,
        customer: {
          name: row.customer_name,
          email: row.customer_email,
        },
        vehicle: {
          ...base.vehicle,
        },
      };
    }

    return {
      ...base,
      vehicle_id: row.vehicle_id,
      vehicle: {
        ...base.vehicle,
        type: row.type,
      },
    };
  });
};

// UPDATE BOOKING STATUS

type BookingStatus = 'cancelled' | 'returned';

export const updateBookingStatus = async (
  bookingId: number,
  status: BookingStatus,
  role: 'customer' | 'admin'
) => {
  // 🔹 get booking
  const bookingRes = await pool.query(
    `SELECT * FROM bookings WHERE id = $1`,
    [bookingId]
  );

  if (!bookingRes.rowCount) {
    throw new AppError('Booking not found', 404);
  }

  const booking = bookingRes.rows[0];

  // 🔹 prevent invalid state changes
  if (booking.status !== 'active') {
    throw new AppError(
      `Booking already ${booking.status}`,
      400
    );
  }

  const now = new Date();
  const rentStartDate = new Date(booking.rent_start_date);

  // 🔹 CUSTOMER: cancel only before rent start date
  if (status === 'cancelled') {
    if (now >= rentStartDate) {
      throw new AppError(
        'Booking cannot be cancelled after rent start date',
        400
      );
    }
  }

  // 🔹 ADMIN: mark returned → vehicle available
  if (status === 'returned') {
    await pool.query(
      `UPDATE vehicles
       SET availability_status = 'available',
           updated_at = NOW()
       WHERE id = $1`,
      [booking.vehicle_id]
    );
  }

  // 🔹 update booking
  const updatedBookingRes = await pool.query(
    `UPDATE bookings
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, bookingId]
  );

  return updatedBookingRes.rows[0];
};
