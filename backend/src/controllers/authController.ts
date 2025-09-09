import express from 'express';
import { AuthService } from '../services/authService.js';
import { AppError } from '../middleware/errorHandler.js';
import { LoginRequest, RegisterRequest } from '../types/index.js';

export class AuthController {
  static async login(req: express.Request, res: express.Response): Promise<void> {
    const { user_id, password }: LoginRequest = req.body;

    if (!user_id || !password) {
      throw new AppError('ユーザーIDとパスワードは必須です', 400);
    }

    const result = await AuthService.login({ user_id, password });
    
    res.json({
      success: true,
      data: result
    });
  }

  static async register(req: express.Request, res: express.Response): Promise<void> {
    const { user_id, password, name }: RegisterRequest = req.body;

    if (!user_id || !password || !name) {
      throw new AppError('ユーザーID、パスワード、名前は必須です', 400);
    }

    if (password.length < 6) {
      throw new AppError('パスワードは6文字以上である必要があります', 400);
    }

    if (user_id.length < 3) {
      throw new AppError('ユーザーIDは3文字以上である必要があります', 400);
    }

    const result = await AuthService.register({ user_id, password, name });
    
    res.status(201).json({
      success: true,
      data: result
    });
  }
}