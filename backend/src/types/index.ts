export interface User {
  id: number;
  user_id: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
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
}

export interface TodoWithAssignees extends Todo {
  creator: UserResponse;
  assignees: UserResponse[];
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

export interface RegisterRequest {
  user_id: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface JwtPayload {
  user_id: string;
  name: string;
  iat?: number;
  exp?: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserResponse;
  }
}