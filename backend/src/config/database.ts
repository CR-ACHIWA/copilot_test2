import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || './data/database.sqlite';
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          status VARCHAR(20) NOT NULL CHECK (status IN ('TODO', 'PROGRESS', 'DONE')),
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating todos table:', err.message);
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS todo_assignees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          todo_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE(todo_id, user_id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating todo_assignees table:', err.message);
          reject(err);
          return;
        }
        console.log('Database tables initialized successfully');
        resolve();
      });
    });
  });
};

const insertDefaultUsers = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');
    
    db.get('SELECT COUNT(*) as count FROM users', [], async (err, row: any) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        console.log('Inserting default users...');
        
        const defaultUsers = [
          { username: 'yamada', password: 'password123', name: '山田 太郎' },
          { username: 'sato', password: 'password123', name: '佐藤 花子' },
          { username: 'suzuki', password: 'password123', name: '鈴木 次郎' }
        ];

        try {
          for (const user of defaultUsers) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await new Promise<void>((resolveUser, rejectUser) => {
              db.run(
                'INSERT INTO users (username, password_hash, name) VALUES (?, ?, ?)',
                [user.username, hashedPassword, user.name],
                (err) => {
                  if (err) {
                    rejectUser(err);
                  } else {
                    resolveUser();
                  }
                }
              );
            });
          }
          console.log('Default users created successfully');
          resolve();
        } catch (error) {
          reject(error);
        }
      } else {
        resolve();
      }
    });
  });
};

export { db, initializeDatabase, insertDefaultUsers };