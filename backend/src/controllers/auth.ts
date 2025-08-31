import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { comparePassword } from '../utils/password';
import { generateToken } from '../middleware/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findByUsername(username);
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      name: user.name
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};