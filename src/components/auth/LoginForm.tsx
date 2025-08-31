import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('ログインに失敗しました。ユーザー名またはパスワードを確認してください。');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">TODOカンバン - ログイン</h1>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="ユーザー名を入力"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="パスワードを入力"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="demo-users">
          <h3>デモユーザー</h3>
          <div className="demo-user-list">
            <div className="demo-user">
              <strong>yamada</strong> / password123 (山田 太郎)
            </div>
            <div className="demo-user">
              <strong>sato</strong> / password123 (佐藤 花子)
            </div>
            <div className="demo-user">
              <strong>suzuki</strong> / password123 (鈴木 次郎)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;