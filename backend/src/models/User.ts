import { db } from '../config/database';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface UserResponse {
  id: number;
  username: string;
  name: string;
  created_at: string;
}

export class UserModel {
  static async findByUsername(username: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  static async findById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  static async getAllUsers(): Promise<UserResponse[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, username, name, created_at FROM users ORDER BY name',
        [],
        (err, rows: UserResponse[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static async create(username: string, passwordHash: string, name: string): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password_hash, name) VALUES (?, ?, ?)',
        [username, passwordHash, name],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }
}