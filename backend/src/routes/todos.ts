import { Router } from 'express';
import { 
  getAllTodos, 
  getTodoById, 
  createTodo, 
  updateTodo, 
  updateTodoStatus, 
  deleteTodo 
} from '../controllers/todos';
import { authenticateToken } from '../middleware/auth';
import { validateTodoCreation, validateTodoUpdate } from '../middleware/validation';

const router = Router();

router.get('/', authenticateToken, getAllTodos);
router.get('/:id', authenticateToken, getTodoById);
router.post('/', authenticateToken, validateTodoCreation, createTodo);
router.put('/:id', authenticateToken, validateTodoUpdate, updateTodo);
router.put('/:id/status', authenticateToken, updateTodoStatus);
router.delete('/:id', authenticateToken, deleteTodo);

export default router;