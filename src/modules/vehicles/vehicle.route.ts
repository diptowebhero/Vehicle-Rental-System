import { Router } from 'express'
import { auth } from '../../middlewares/auth.middleware'
import { role } from '../../middlewares/role.middleware'
import * as controller from './vehicle.controller'


const router = Router()
router.post('/', auth, role('admin'), controller.createVehicles)
router.get('/', controller.getAllVehicles)
router.get('/:vehicleId', controller.getSingleVehicles)
router.put('/:vehicleId', auth, role('admin'), controller.updateVehicles)
router.delete('/:vehicleId', auth, role('admin'), controller.deleteVehicles)
export default router