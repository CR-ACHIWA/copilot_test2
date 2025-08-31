
/**
 * Todoアプリのエントリポイント
 * @author CR-ACHIWA
 */
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import TodoBoard from './components/todo/TodoBoard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Layout>
          <TodoBoard />
        </Layout>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App;
