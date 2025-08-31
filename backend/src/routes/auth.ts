import { Router } from 'express';
import { login, verifyToken } from '../controllers/auth';
import { validateLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', validateLogin, login);
router.get('/verify', authenticateToken, verifyToken);

export default router;