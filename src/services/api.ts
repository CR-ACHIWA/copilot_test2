import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { LoginRequest, LoginResponse, User, TodoItem, CreateTodoRequest, UpdateTodoRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async verifyToken(): Promise<{ success: boolean; user: User }> {
    const response: AxiosResponse<{ success: boolean; user: User }> = await this.api.get('/auth/verify');
    return response.data;
  }

  async getUsers(): Promise<{ success: boolean; users: User[] }> {
    const response: AxiosResponse<{ success: boolean; users: User[] }> = await this.api.get('/users');
    return response.data;
  }

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    const response: AxiosResponse<{ success: boolean; user: User }> = await this.api.get('/users/me');
    return response.data;
  }

  async getTodos(): Promise<{ success: boolean; todos: TodoItem[] }> {
    const response: AxiosResponse<{ success: boolean; todos: TodoItem[] }> = await this.api.get('/todos');
    return response.data;
  }

  async createTodo(todo: CreateTodoRequest): Promise<{ success: boolean; todo: TodoItem; message: string }> {
    const response: AxiosResponse<{ success: boolean; todo: TodoItem; message: string }> = await this.api.post('/todos', todo);
    return response.data;
  }

  async updateTodo(id: number, updates: UpdateTodoRequest): Promise<{ success: boolean; todo: TodoItem; message: string }> {
    const response: AxiosResponse<{ success: boolean; todo: TodoItem; message: string }> = await this.api.put(`/todos/${id}`, updates);
    return response.data;
  }

  async updateTodoStatus(id: number, status: 'TODO' | 'PROGRESS' | 'DONE'): Promise<{ success: boolean; todo: TodoItem; message: string }> {
    const response: AxiosResponse<{ success: boolean; todo: TodoItem; message: string }> = await this.api.put(`/todos/${id}/status`, { status });
    return response.data;
  }

  async deleteTodo(id: number): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/todos/${id}`);
    return response.data;
  }

  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string }> {
    const response: AxiosResponse<{ success: boolean; message: string; timestamp: string }> = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;