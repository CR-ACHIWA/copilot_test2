import { Router } from 'express';
import { TodoController } from '../controllers/todoController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(authenticateToken);

router.get('/', asyncHandler(TodoController.getAllTodos));
router.get('/:id', asyncHandler(TodoController.getTodoById));
router.post('/', asyncHandler(TodoController.createTodo));
router.put('/:id', asyncHandler(TodoController.updateTodo));
router.patch('/:id/status', asyncHandler(TodoController.updateTodoStatus));
router.delete('/:id', asyncHandler(TodoController.deleteTodo));

export default router;