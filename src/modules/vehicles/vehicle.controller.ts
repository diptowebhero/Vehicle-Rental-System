import * as service from './vehicle.service'


// create vehicle
export const createVehicles = async (req: any, res: any) => {
  try {
    res.status(201).json({ success: true, message: 'Vehicle created successfully', data: await service.createVehicles(req.body) })
  } catch (error: any) {
    res.status(400).json({ success: false, message: (error as Error).message })
  }
}

// get all vehicles
export const getAllVehicles = async (req: any, res: any) => {
  //not found error handling
  if ((await service.getAllVehicles()).length === 0) {
    return res.status(404).json({ success: true, message: 'No vehicles found', data: [] })
  }
  res.json({ success: true, message: 'Vehicles retrieved successfully', data: await service.getAllVehicles() })
}

// get single vehicle by id
export const getSingleVehicles = async (req: any, res: any) => {
  if (isNaN(req.params.vehicleId)) {
    return res.status(400).json({ success: false, message: 'Invalid vehicle ID' })
  }
  const vehicle = await service.getSingleVehicles(req.params.vehicleId)
  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' })
  }
  res.json({ success: true, message: 'Vehicle retrieved successfully', data: vehicle })
}

// update vehicle by id
export const updateVehicles = async (req: any, res: any) => res.json({ success: true, message: 'Vehicle updated successfully', data: await service.updateVehicles(req.params.vehicleId, req.body) })

// delete vehicle by id
export const deleteVehicles = async (req: any, res: any) => { await service.deleteVehicles(req.params.vehicleId); res.json({ success: true, message: 'Vehicle deleted successfully' }) }