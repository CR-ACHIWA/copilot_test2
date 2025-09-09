import express from 'express';
import { TodoService } from '../services/todoService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateTodoRequest, UpdateTodoRequest, TodoStatus } from '../types/index.js';

export class TodoController {
  static async getAllTodos(_req: express.Request, res: express.Response): Promise<void> {
    const todos = await TodoService.getAllTodos();
    
    res.json({
      success: true,
      data: todos
    });
  }

  static async getTodoById(req: express.Request, res: express.Response): Promise<void> {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      throw new AppError('無効なTODO IDです', 400);
    }

    const todo = await TodoService.getTodoById(id);
    
    if (!todo) {
      throw new AppError('TODOが見つかりません', 404);
    }

    res.json({
      success: true,
      data: todo
    });
  }

  static async createTodo(req: express.Request, res: express.Response): Promise<void> {
    if (!req.user) {
      throw new AppError('認証されていません', 401);
    }

    const { text, assignee_ids, status }: CreateTodoRequest = req.body;

    if (!text || !text.trim()) {
      throw new AppError('TODOのテキストは必須です', 400);
    }

    if (!assignee_ids || !Array.isArray(assignee_ids) || assignee_ids.length === 0) {
      throw new AppError('少なくとも1人の担当者を指定してください', 400);
    }

    const validStatuses: TodoStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (status && !validStatuses.includes(status)) {
      throw new AppError('無効なステータスです', 400);
    }

    const todo = await TodoService.createTodo(
      { text: text.trim(), assignee_ids, status: status || 'TODO' },
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      data: todo
    });
  }

  static async updateTodo(req: express.Request, res: express.Response): Promise<void> {
    if (!req.user) {
      throw new AppError('認証されていません', 401);
    }

    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      throw new AppError('無効なTODO IDです', 400);
    }

    const { text, status, assignee_ids }: UpdateTodoRequest = req.body;

    if (text !== undefined && (!text || !text.trim())) {
      throw new AppError('TODOのテキストは空にできません', 400);
    }

    const validStatuses: TodoStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (status && !validStatuses.includes(status)) {
      throw new AppError('無効なステータスです', 400);
    }

    if (assignee_ids !== undefined && (!Array.isArray(assignee_ids) || assignee_ids.length === 0)) {
      throw new AppError('少なくとも1人の担当者を指定してください', 400);
    }

    const updateData: UpdateTodoRequest = {};
    if (text !== undefined) updateData.text = text.trim();
    if (status !== undefined) updateData.status = status;
    if (assignee_ids !== undefined) updateData.assignee_ids = assignee_ids;

    const todo = await TodoService.updateTodo(id, updateData, req.user.id);
    
    res.json({
      success: true,
      data: todo
    });
  }

  static async deleteTodo(req: express.Request, res: express.Response): Promise<void> {
    if (!req.user) {
      throw new AppError('認証されていません', 401);
    }

    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      throw new AppError('無効なTODO IDです', 400);
    }

    await TodoService.deleteTodo(id, req.user.id);
    
    res.json({
      success: true,
      message: 'TODOが削除されました'
    });
  }

  static async updateTodoStatus(req: express.Request, res: express.Response): Promise<void> {
    const id = parseInt(req.params.id);
    const { status }: { status: TodoStatus } = req.body;
    
    if (isNaN(id)) {
      throw new AppError('無効なTODO IDです', 400);
    }

    const validStatuses: TodoStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError('無効なステータスです', 400);
    }

    const todo = await TodoService.updateTodoStatus(id, status);
    
    res.json({
      success: true,
      data: todo
    });
  }
}