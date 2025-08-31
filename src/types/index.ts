export interface User {
  id: number;
  username: string;
  name: string;
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export type TodoStatus = 'TODO' | 'PROGRESS' | 'DONE';

export interface TodoItem {
  id: number;
  text: string;
  status: TodoStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
  assignees: Array<{
    id: number;
    name: string;
    username: string;
  }>;
  created_by_name: string;
}

export interface CreateTodoRequest {
  text: string;
  status: TodoStatus;
  assigneeIds: number[];
}

export interface UpdateTodoRequest {
  text?: string;
  status?: TodoStatus;
  assigneeIds?: number[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}