import { db } from '../database.js';
import bcrypt from 'bcrypt';

async function initDatabase(): Promise<void> {
  try {
    console.log('データベースを初期化しています...');
    
    await db.init();
    console.log('テーブルが作成されました。');

    const saltRounds = 10;
    const testUsers = [
      {
        user_id: 'yamada',
        password: 'password123',
        name: '山田 太郎'
      },
      {
        user_id: 'sato',
        password: 'password123',
        name: '佐藤 花子'
      },
      {
        user_id: 'suzuki',
        password: 'password123',
        name: '鈴木 次郎'
      }
    ];

    for (const user of testUsers) {
      const existingUser = await db.get(
        'SELECT id FROM users WHERE user_id = ?',
        [user.user_id]
      );

      if (!existingUser) {
        const passwordHash = await bcrypt.hash(user.password, saltRounds);
        await db.run(
          'INSERT INTO users (user_id, password_hash, name) VALUES (?, ?, ?)',
          [user.user_id, passwordHash, user.name]
        );
        console.log(`ユーザー "${user.name}" を作成しました。`);
      } else {
        console.log(`ユーザー "${user.name}" は既に存在します。`);
      }
    }

    console.log('データベースの初期化が完了しました。');
    console.log('テストユーザー:');
    console.log('- yamada / password123');
    console.log('- sato / password123');
    console.log('- suzuki / password123');

  } catch (error) {
    console.error('データベース初期化エラー:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

initDatabase();