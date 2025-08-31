import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase, insertDefaultUsers } from './config/database';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import todoRoutes from './routes/todos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'http://localhost:5173' 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'TODO Backend API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const startServer = async () => {
  try {
    await initializeDatabase();
    await insertDefaultUsers();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
      console.log(`👥 Users endpoint: http://localhost:${PORT}/api/users`);
      console.log(`📝 Todos endpoint: http://localhost:${PORT}/api/todos`);
      console.log('\n🎯 Default users:');
      console.log('  - Username: yamada, Password: password123');
      console.log('  - Username: sato, Password: password123');
      console.log('  - Username: suzuki, Password: password123');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();