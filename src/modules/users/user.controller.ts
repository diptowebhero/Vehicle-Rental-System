// modules/users/user.controller.ts
import { Request, Response } from 'express';
import * as userService from './user.service';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const currentUser = req.user;

    const updated = await userService.updateUser(userId, req.body, currentUser);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    await userService.deleteUser(userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};