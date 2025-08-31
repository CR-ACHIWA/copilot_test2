import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { apiService } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (err) {
      setError('ユーザーの取得に失敗しました');
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
  };
};