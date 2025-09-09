import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post('/login', asyncHandler(AuthController.login));
router.post('/register', asyncHandler(AuthController.register));

export default router;