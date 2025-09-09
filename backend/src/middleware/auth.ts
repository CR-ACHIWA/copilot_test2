import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';
import { AppError } from './errorHandler.js';
import { JwtPayload, UserResponse } from '../types/index.js';

export const authenticateToken = async (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('アクセストークンが必要です', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET が設定されていません', 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    const user = await db.get<UserResponse>(
      'SELECT id, user_id, name FROM users WHERE user_id = ?',
      [decoded.user_id]
    );

    if (!user) {
      throw new AppError('ユーザーが見つかりません', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('無効なトークンです', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('トークンが期限切れです', 401));
    } else {
      next(error);
    }
  }
};