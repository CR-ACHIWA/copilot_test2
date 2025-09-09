import express from 'express';
import { UserService } from '../services/userService.js';
import { AppError } from '../middleware/errorHandler.js';

export class UserController {
  static async getAllUsers(_req: express.Request, res: express.Response): Promise<void> {
    const users = await UserService.getAllUsers();
    
    res.json({
      success: true,
      data: users
    });
  }

  static async getCurrentUser(req: express.Request, res: express.Response): Promise<void> {
    if (!req.user) {
      throw new AppError('認証されていません', 401);
    }

    res.json({
      success: true,
      data: req.user
    });
  }

  static async getUserById(req: express.Request, res: express.Response): Promise<void> {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      throw new AppError('無効なユーザーIDです', 400);
    }

    const user = await UserService.getUserById(id);
    
    if (!user) {
      throw new AppError('ユーザーが見つかりません', 404);
    }

    res.json({
      success: true,
      data: user
    });
  }
}