import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/common/Header';
import TodoApp from './components/todo/TodoApp';
import { NotificationService } from './services/notification';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    // 通知許可を初期化時に要求
    NotificationService.requestPermission().then(granted => {
      if (granted) {
        console.log('ブラウザ通知が有効になりました');
      } else {
        console.log('ブラウザ通知が無効です');
      }
    });
  }, []);

  return (
    <AuthProvider>
      <div className="App">
        <ProtectedRoute>
          <Header />
          <TodoApp />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
};

export default App;