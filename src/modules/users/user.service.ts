import { pool } from "../../config/db";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
}

export const getAllUsers = async (): Promise<User[]> => {
  const result = await pool.query('SELECT id, name, email, phone, role FROM users');
  return result.rows;
};

export const updateUser = async (userId: number, data: any, currentUser: any) => {
  const isAdmin = currentUser.role === 'admin';
  const isOwn = currentUser.id === userId;

  if (!isAdmin && !isOwn) {
    throw { status: 403, message: 'You do not have permission to update this user' };
  }

  // Allowed fields based on role
  const allowedFields = isAdmin
    ? ['name', 'email', 'phone', 'role']
    : ['name', 'phone'];

  // Explicitly block 'role' field for non-admin users
  if (!isAdmin && data.role !== undefined) {
    throw {
      status: 403,
      message: 'You are not allowed to change the role',
      errorCode: 'ROLE_UPDATE_FORBIDDEN'
    };
  }

  const fieldsToUpdate = Object.keys(data).filter(key =>
    allowedFields.includes(key)
  );

  if (fieldsToUpdate.length === 0) {
    throw { status: 400, message: 'No valid fields to update' };
  }


  const setClauses = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`);

  const values = [userId]; // $1
  fieldsToUpdate.forEach(field => {
    values.push(data[field]);
  });

  const query = `
    UPDATE users 
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, email, phone, role, updated_at
  `;

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw { status: 404, message: 'User not found' };
    }

    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      const field = error.constraint?.includes('email') ? 'Email' : 'Field';
      throw { status: 409, message: `${field} already exists` };
    }
    throw error;
  }
};

export const deleteUser = async (userId: number) => {
  const activeBookings = await pool.query(
    `SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [userId]
  );

  if ((activeBookings.rowCount ?? 0) > 0) {
    throw {
      status: 400,
      message: 'User has active bookings and cannot be deleted',
      errorCode: 'ACTIVE_BOOKINGS_EXIST'
    };
  }

  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id, name, email`,
    [userId]
  );

  if (result.rowCount === 0) {
    throw { status: 404, message: 'User not found' };
  }

  return {
    message: 'User deleted successfully',
    deletedUserId: result.rows[0].id
  };
};