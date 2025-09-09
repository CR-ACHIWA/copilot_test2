export interface User {
  id: number;
  user_id: string;
  name: string;
}

export interface Todo {
  id: number;
  text: string;
  status: TodoStatus;
  creator_id: number;
  created_at: string;
  updated_at: string;
  creator: User;
  assignees: User[];
}

export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface CreateTodoRequest {
  text: string;
  assignee_ids: number[];
  status?: TodoStatus;
}

export interface UpdateTodoRequest {
  text?: string;
  status?: TodoStatus;
  assignee_ids?: number[];
}

export interface LoginRequest {
  user_id: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  error: {
    message: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}