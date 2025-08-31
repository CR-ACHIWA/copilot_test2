import { Request, Response, NextFunction } from 'express';

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  if (username.trim().length === 0 || password.trim().length === 0) {
    res.status(400).json({ error: 'Username and password cannot be empty' });
    return;
  }

  next();
};

export const validateTodoCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { text, status, assigneeIds } = req.body;

  if (!text || text.trim().length === 0) {
    res.status(400).json({ error: 'Todo text is required' });
    return;
  }

  if (!status || !['TODO', 'PROGRESS', 'DONE'].includes(status)) {
    res.status(400).json({ error: 'Valid status is required (TODO, PROGRESS, DONE)' });
    return;
  }

  if (!assigneeIds || !Array.isArray(assigneeIds) || assigneeIds.length === 0) {
    res.status(400).json({ error: 'At least one assignee is required' });
    return;
  }

  next();
};

export const validateTodoUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { text, status, assigneeIds } = req.body;

  if (text !== undefined && text.trim().length === 0) {
    res.status(400).json({ error: 'Todo text cannot be empty' });
    return;
  }

  if (status !== undefined && !['TODO', 'PROGRESS', 'DONE'].includes(status)) {
    res.status(400).json({ error: 'Valid status is required (TODO, PROGRESS, DONE)' });
    return;
  }

  if (assigneeIds !== undefined && (!Array.isArray(assigneeIds) || assigneeIds.length === 0)) {
    res.status(400).json({ error: 'At least one assignee is required' });
    return;
  }

  next();
};