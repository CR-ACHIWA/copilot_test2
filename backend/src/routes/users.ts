import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(authenticateToken);

router.get('/', asyncHandler(UserController.getAllUsers));
router.get('/me', asyncHandler(UserController.getCurrentUser));
router.get('/:id', asyncHandler(UserController.getUserById));

export default router;