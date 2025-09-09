import { db } from '../database.js';
import { Todo, TodoWithAssignees, CreateTodoRequest, UpdateTodoRequest, UserResponse, TodoStatus } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class TodoService {
  static async getAllTodos(): Promise<TodoWithAssignees[]> {
    const todos = await db.all<Todo>(`
      SELECT * FROM todos 
      ORDER BY created_at DESC
    `);

    const todosWithAssignees: TodoWithAssignees[] = [];

    for (const todo of todos) {
      const creator = await db.get<UserResponse>(
        'SELECT id, user_id, name FROM users WHERE id = ?',
        [todo.creator_id]
      );

      const assignees = await db.all<UserResponse>(`
        SELECT u.id, u.user_id, u.name 
        FROM users u
        INNER JOIN todo_assignees ta ON u.id = ta.user_id
        WHERE ta.todo_id = ?
        ORDER BY u.name
      `, [todo.id]);

      if (creator) {
        todosWithAssignees.push({
          ...todo,
          creator,
          assignees
        });
      }
    }

    return todosWithAssignees;
  }

  static async getTodoById(id: number): Promise<TodoWithAssignees | undefined> {
    const todo = await db.get<Todo>(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    if (!todo) {
      return undefined;
    }

    const creator = await db.get<UserResponse>(
      'SELECT id, user_id, name FROM users WHERE id = ?',
      [todo.creator_id]
    );

    const assignees = await db.all<UserResponse>(`
      SELECT u.id, u.user_id, u.name 
      FROM users u
      INNER JOIN todo_assignees ta ON u.id = ta.user_id
      WHERE ta.todo_id = ?
      ORDER BY u.name
    `, [id]);

    if (!creator) {
      return undefined;
    }

    return {
      ...todo,
      creator,
      assignees
    };
  }

  static async createTodo(todoData: CreateTodoRequest, creatorId: number): Promise<TodoWithAssignees> {
    const { text, assignee_ids, status = 'TODO' } = todoData;

    const result = await db.run(
      'INSERT INTO todos (text, status, creator_id) VALUES (?, ?, ?)',
      [text, status, creatorId]
    );

    const todoId = result.lastID;
    if (!todoId) {
      throw new AppError('TODOの作成に失敗しました', 500);
    }

    for (const assigneeId of assignee_ids) {
      const user = await db.get('SELECT id FROM users WHERE id = ?', [assigneeId]);
      if (!user) {
        throw new AppError(`ユーザーID ${assigneeId} が見つかりません`, 400);
      }

      await db.run(
        'INSERT INTO todo_assignees (todo_id, user_id) VALUES (?, ?)',
        [todoId, assigneeId]
      );
    }

    const newTodo = await this.getTodoById(todoId);
    if (!newTodo) {
      throw new AppError('作成されたTODOの取得に失敗しました', 500);
    }

    return newTodo;
  }

  static async updateTodo(id: number, updateData: UpdateTodoRequest, userId: number): Promise<TodoWithAssignees> {
    const existingTodo = await db.get<Todo>(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    if (!existingTodo) {
      throw new AppError('TODOが見つかりません', 404);
    }

    if (existingTodo.creator_id !== userId) {
      throw new AppError('このTODOを編集する権限がありません', 403);
    }

    const updateFields: string[] = [];
    const updateValues: unknown[] = [];

    if (updateData.text !== undefined) {
      updateFields.push('text = ?');
      updateValues.push(updateData.text);
    }

    if (updateData.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(updateData.status);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      await db.run(
        `UPDATE todos SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    if (updateData.assignee_ids !== undefined) {
      await db.run('DELETE FROM todo_assignees WHERE todo_id = ?', [id]);

      for (const assigneeId of updateData.assignee_ids) {
        const user = await db.get('SELECT id FROM users WHERE id = ?', [assigneeId]);
        if (!user) {
          throw new AppError(`ユーザーID ${assigneeId} が見つかりません`, 400);
        }

        await db.run(
          'INSERT INTO todo_assignees (todo_id, user_id) VALUES (?, ?)',
          [id, assigneeId]
        );
      }
    }

    const updatedTodo = await this.getTodoById(id);
    if (!updatedTodo) {
      throw new AppError('更新されたTODOの取得に失敗しました', 500);
    }

    return updatedTodo;
  }

  static async deleteTodo(id: number, userId: number): Promise<void> {
    const existingTodo = await db.get<Todo>(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    if (!existingTodo) {
      throw new AppError('TODOが見つかりません', 404);
    }

    if (existingTodo.creator_id !== userId) {
      throw new AppError('このTODOを削除する権限がありません', 403);
    }

    await db.run('DELETE FROM todos WHERE id = ?', [id]);
  }

  static async updateTodoStatus(id: number, status: TodoStatus): Promise<TodoWithAssignees> {
    const existingTodo = await db.get<Todo>(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    if (!existingTodo) {
      throw new AppError('TODOが見つかりません', 404);
    }

    await db.run(
      'UPDATE todos SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    const updatedTodo = await this.getTodoById(id);
    if (!updatedTodo) {
      throw new AppError('更新されたTODOの取得に失敗しました', 500);
    }

    return updatedTodo;
  }
}