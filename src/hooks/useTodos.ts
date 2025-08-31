import { useState, useEffect, useCallback } from 'react';
import type { TodoItem, CreateTodoRequest, UpdateTodoRequest, TodoStatus } from '../types';
import { apiService } from '../services/api';

export const useTodos = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getTodos();
      if (response.success) {
        setTodos(response.todos);
      }
    } catch (err) {
      setError('TODOの取得に失敗しました');
      console.error('Failed to fetch todos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTodo = useCallback(async (todoData: CreateTodoRequest): Promise<TodoItem | null> => {
    try {
      setError(null);
      const response = await apiService.createTodo(todoData);
      if (response.success) {
        setTodos(prev => [response.todo, ...prev]);
        return response.todo;
      }
      return null;
    } catch (err) {
      setError('TODOの作成に失敗しました');
      console.error('Failed to create todo:', err);
      return null;
    }
  }, []);

  const updateTodo = useCallback(async (id: number, updates: UpdateTodoRequest): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.updateTodo(id, updates);
      if (response.success) {
        setTodos(prev => prev.map(todo => 
          todo.id === id ? response.todo : todo
        ));
        return true;
      }
      return false;
    } catch (err) {
      setError('TODOの更新に失敗しました');
      console.error('Failed to update todo:', err);
      return false;
    }
  }, []);

  const updateTodoStatus = useCallback(async (id: number, status: TodoStatus): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.updateTodoStatus(id, status);
      if (response.success) {
        setTodos(prev => prev.map(todo => 
          todo.id === id ? response.todo : todo
        ));
        return true;
      }
      return false;
    } catch (err) {
      setError('ステータスの更新に失敗しました');
      console.error('Failed to update todo status:', err);
      return false;
    }
  }, []);

  const deleteTodo = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.deleteTodo(id);
      if (response.success) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError('TODOの削除に失敗しました');
      console.error('Failed to delete todo:', err);
      return false;
    }
  }, []);

  const getTodosByStatus = useCallback((status: TodoStatus): TodoItem[] => {
    return todos.filter(todo => todo.status === status);
  }, [todos]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    isLoading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    updateTodoStatus,
    deleteTodo,
    getTodosByStatus,
  };
};