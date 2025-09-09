import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { db } from './database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import todoRoutes from './routes/todos.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5175', 'http://127.0.0.1:5175', 'http://localhost:5176', 'http://127.0.0.1:5176'],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await db.init();
    console.log('データベース接続が確立されました。');

    app.listen(PORT, () => {
      console.log(`サーバーがポート ${PORT} で起動しました。`);
      console.log(`健康チェック: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nサーバーを停止しています...');
  await db.close();
  process.exit(0);
});

startServer();