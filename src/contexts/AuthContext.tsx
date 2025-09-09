import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, AuthContextType } from '../types';
import { apiClient } from '../services/api';
import { AuthService } from '../services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = AuthService.getUser();
        const token = AuthService.getToken();

        if (savedUser && token) {
          // 現在のユーザー情報を取得してトークンの有効性を確認
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('認証の初期化に失敗しました:', error);
        AuthService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await apiClient.login(credentials);
      
      AuthService.saveAuth(authResponse);
      setUser(authResponse.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'ログインに失敗しました';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    AuthService.clearAuth();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};