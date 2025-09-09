import { db } from '../database.js';
import { UserResponse } from '../types/index.js';

export class UserService {
  static async getAllUsers(): Promise<UserResponse[]> {
    const users = await db.all<UserResponse>(
      'SELECT id, user_id, name FROM users ORDER BY name'
    );
    return users;
  }

  static async getUserById(id: number): Promise<UserResponse | undefined> {
    const user = await db.get<UserResponse>(
      'SELECT id, user_id, name FROM users WHERE id = ?',
      [id]
    );
    return user;
  }

  static async getUserByUserId(user_id: string): Promise<UserResponse | undefined> {
    const user = await db.get<UserResponse>(
      'SELECT id, user_id, name FROM users WHERE user_id = ?',
      [user_id]
    );
    return user;
  }
}