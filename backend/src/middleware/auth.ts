import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/express';

interface JwtPayload {
  id: number;
  username: string;
  name: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ error: 'JWT secret not configured' });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export const generateToken = (user: { id: number; username: string; name: string }): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  if (!jwtSecret) {
    throw new Error('JWT secret not configured');
  }

  const payload = { 
    id: user.id, 
    username: user.username, 
    name: user.name 
  };
  
  return jwt.sign(payload, jwtSecret, { expiresIn } as jwt.SignOptions);
};