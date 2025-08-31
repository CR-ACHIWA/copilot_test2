import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        name: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    id: number;
    username: string;
    name: string;
  };
}