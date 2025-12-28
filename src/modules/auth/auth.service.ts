import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';


// user signup
export const signup = async (data: any) => {

  // if already exists same email
  const userRes = await pool.query(`SELECT * FROM users WHERE email=$1`, [data.email.toLowerCase()])
  if (userRes.rowCount) {
    throw new Error('Email already registered')
  }

  const hash = await bcrypt.hash(data.password, 10)
  const { rows } = await pool.query(
    `INSERT INTO users(name,email,password,phone,role)
VALUES($1,$2,$3,$4,$5)
RETURNING id,name,email,phone,role`,
    [data.name, data.email.toLowerCase(), hash, data.phone, data.role]
  )
  return rows[0]
}


// user signin
export const signin = async (email: string, password: string) => {
  const userRes = await pool.query(`SELECT * FROM users WHERE email=$1`, [email])
  if (!userRes.rowCount) throw new Error('Invalid credentials')


  const user = userRes.rows[0]
  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error('Invalid credentials')


  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )



  return { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } }
}