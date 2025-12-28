import { pool } from '../../config/db'


//create vehicle
export const createVehicles = async (data: any) => {
  const { rows } = await pool.query(
    `INSERT INTO vehicles(vehicle_name,type,registration_number,daily_rent_price,availability_status)
VALUES($1,$2,$3,$4,$5) RETURNING *`,
    Object.values(data)
  )
  return rows[0]
}


// get all vehicles
export const getAllVehicles = async () => (await pool.query(`SELECT * FROM vehicles`)).rows

// get single vehicle by id
export const getSingleVehicles = async (id: number) => (await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [id])).rows[0]

// update vehicle by id
export const updateVehicles = async (id: number, data: any) => (await pool.query(`UPDATE vehicles SET vehicle_name=$1,type=$2,registration_number=$3,daily_rent_price=$4,availability_status=$5 WHERE id=$6 RETURNING *`, [...Object.values(data), id])).rows[0]

// delete vehicle by id
export const deleteVehicles = async (id: number) => { await pool.query(`DELETE FROM vehicles WHERE id=$1`, [id]) }