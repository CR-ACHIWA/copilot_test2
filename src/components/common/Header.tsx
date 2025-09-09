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
    <header style={{
      backgroundColor: '#007bff',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        Todo アプリ
      </h1>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{
          fontSize: '1rem'
        }}>
          こんにちは、{user?.name}さん
        </span>
        
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default Header;