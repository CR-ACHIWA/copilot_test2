import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="header-title">TODOカンバン</h1>
        
        <div className="header-user">
          <span className="user-name">
            ようこそ、{user?.name}さん
          </span>
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;