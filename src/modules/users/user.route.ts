// modules/users/user.route.ts
import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import { role } from '../../middlewares/role.middleware';
import * as userController from './user.controller';

const router = Router();

// Admin only
router.get('/users', auth, role('admin'), userController.getAllUsers);

// Admin or own user
router.put('/users/:userId', auth, userController.updateUser);

// Admin only
router.delete('/users/:userId', auth, role('admin'), userController.deleteUser);

export default router;