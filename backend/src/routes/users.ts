import { Router } from 'express';
import { getAllUsers, getCurrentUser } from '../controllers/users';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/me', authenticateToken, getCurrentUser);

export default router;