import type { User } from '../types';

export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const;

export const storage = {
  setToken: (token: string): void => {
    localStorage.setItem(StorageKeys.AUTH_TOKEN, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(StorageKeys.AUTH_TOKEN);
  },

  removeToken: (): void => {
    localStorage.removeItem(StorageKeys.AUTH_TOKEN);
  },

  setUser: (user: User): void => {
    localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(StorageKeys.USER);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  removeUser: (): void => {
    localStorage.removeItem(StorageKeys.USER);
  },

  clear: (): void => {
    localStorage.removeItem(StorageKeys.AUTH_TOKEN);
    localStorage.removeItem(StorageKeys.USER);
  },
};