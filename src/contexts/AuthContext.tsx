import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import { apiService } from '../services/api';
import { storage } from '../utils/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = storage.getToken();
      const storedUser = storage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        
        try {
          const response = await apiService.verifyToken();
          if (response.success) {
            setUser(response.user);
            storage.setUser(response.user);
          } else {
            throw new Error('Token verification failed');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ username, password });
      
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        storage.setToken(response.token);
        storage.setUser(response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    storage.clear();
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};