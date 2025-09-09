import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';
import { AppError } from '../middleware/errorHandler.js';
import { User, UserResponse, LoginRequest, RegisterRequest, AuthResponse } from '../types/index.js';

export class AuthService {
  private static readonly SALT_ROUNDS = 10;

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { user_id, password } = credentials;

    const user = await db.get<User>(
      'SELECT * FROM users WHERE user_id = ?',
      [user_id]
    );

    if (!user) {
      throw new AppError('ユーザーIDまたはパスワードが正しくありません', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('ユーザーIDまたはパスワードが正しくありません', 401);
    }

    const token = this.generateToken(user);
    const userResponse: UserResponse = {
      id: user.id,
      user_id: user.user_id,
      name: user.name
    };

    return { token, user: userResponse };
  }

  static async register(userData: RegisterRequest): Promise<{ message: string }> {
    const { user_id, password, name } = userData;

    const existingUser = await db.get(
      'SELECT id FROM users WHERE user_id = ?',
      [user_id]
    );

    if (existingUser) {
      throw new AppError('このユーザーIDは既に使用されています', 409);
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    await db.run(
      'INSERT INTO users (user_id, password_hash, name) VALUES (?, ?, ?)',
      [user_id, passwordHash, name]
    );

    return { message: 'ユーザーが正常に作成されました' };
  }

  private static generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET が設定されていません', 500);
    }

    return jwt.sign(
      {
        user_id: user.user_id,
        name: user.name
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
  }
}