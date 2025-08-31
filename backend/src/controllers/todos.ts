import { Request, Response } from 'express';
import { TodoModel } from '../models/Todo';

export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await TodoModel.getAll();
    res.json({
      success: true,
      todos
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTodoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const todoId = parseInt(req.params.id as string);
    if (isNaN(todoId)) {
      res.status(400).json({ error: 'Invalid todo ID' });
      return;
    }

    const todo = await TodoModel.getById(todoId);
    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json({
      success: true,
      todo
    });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, status, assigneeIds } = req.body;
    const createdBy = req.user?.id;

    if (!createdBy) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const todoId = await TodoModel.create(text as string, status, createdBy, assigneeIds);
    const newTodo = await TodoModel.getById(todoId);

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      todo: newTodo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const todoId = parseInt(req.params.id as string);
    if (isNaN(todoId)) {
      res.status(400).json({ error: 'Invalid todo ID' });
      return;
    }

    const { text, status, assigneeIds } = req.body;

    const success = await TodoModel.update(todoId, text as string | undefined, status, assigneeIds);
    if (!success) {
      res.status(404).json({ error: 'Todo not found or no changes made' });
      return;
    }

    const updatedTodo = await TodoModel.getById(todoId);
    res.json({
      success: true,
      message: 'Todo updated successfully',
      todo: updatedTodo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTodoStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const todoId = parseInt(req.params.id as string);
    if (isNaN(todoId)) {
      res.status(400).json({ error: 'Invalid todo ID' });
      return;
    }

    const { status } = req.body;
    if (!status || !['TODO', 'PROGRESS', 'DONE'].includes(status)) {
      res.status(400).json({ error: 'Valid status is required (TODO, PROGRESS, DONE)' });
      return;
    }

    const success = await TodoModel.updateStatus(todoId, status as 'TODO' | 'PROGRESS' | 'DONE');
    if (!success) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const updatedTodo = await TodoModel.getById(todoId);
    res.json({
      success: true,
      message: 'Todo status updated successfully',
      todo: updatedTodo
    });
  } catch (error) {
    console.error('Update todo status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const todoId = parseInt(req.params.id as string);
    if (isNaN(todoId)) {
      res.status(400).json({ error: 'Invalid todo ID' });
      return;
    }

    const success = await TodoModel.delete(todoId);
    if (!success) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};