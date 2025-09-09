import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { 
  User, 
  Todo, 
  LoginRequest, 
  AuthResponse, 
  CreateTodoRequest, 
  UpdateTodoRequest,
  ApiResponse,
  TodoStatus 
} from '../types';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(this.addAuthToken);
    this.api.interceptors.response.use(
      (response) => response,
      this.handleResponseError
    );
  }

  private addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  private handleResponseError = (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  };

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/login', credentials);
    return response.data.data;
  }

  async register(userData: { user_id: string; password: string; name: string }): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.api.post('/auth/register', userData);
    return response.data.data;
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get('/users');
    return response.data.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/users/me');
    return response.data.data;
  }

  async getUserById(id: number): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(`/users/${id}`);
    return response.data.data;
  }

  // Todo endpoints
  async getTodos(): Promise<Todo[]> {
    const response: AxiosResponse<ApiResponse<Todo[]>> = await this.api.get('/todos');
    return response.data.data;
  }

  async getTodoById(id: number): Promise<Todo> {
    const response: AxiosResponse<ApiResponse<Todo>> = await this.api.get(`/todos/${id}`);
    return response.data.data;
  }

  async createTodo(todoData: CreateTodoRequest): Promise<Todo> {
    const response: AxiosResponse<ApiResponse<Todo>> = await this.api.post('/todos', todoData);
    return response.data.data;
  }

  async updateTodo(id: number, updateData: UpdateTodoRequest): Promise<Todo> {
    const response: AxiosResponse<ApiResponse<Todo>> = await this.api.put(`/todos/${id}`, updateData);
    return response.data.data;
  }

  async updateTodoStatus(id: number, status: TodoStatus): Promise<Todo> {
    const response: AxiosResponse<ApiResponse<Todo>> = await this.api.patch(`/todos/${id}/status`, { status });
    return response.data.data;
  }

  async deleteTodo(id: number): Promise<void> {
    await this.api.delete(`/todos/${id}`);
  }
}

export const apiClient = new ApiClient();