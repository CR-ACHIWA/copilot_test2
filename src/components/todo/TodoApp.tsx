import React, { useState, useEffect } from 'react';
import { Todo, User, TodoStatus, CreateTodoRequest } from '../../types';
import { apiClient } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationService } from '../../services/notification';

const TodoApp: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [text, setText] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus>('TODO');
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [todosData, usersData] = await Promise.all([
        apiClient.getTodos(),
        apiClient.getUsers()
      ]);
      setTodos(todosData);
      setUsers(usersData);
    } catch (error: any) {
      setError('データの読み込みに失敗しました');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (!text.trim() || selectedUserIds.length === 0) {
      setError('TODOテキストと担当者を選択してください');
      return;
    }

    try {
      const todoData: CreateTodoRequest = {
        text: text.trim(),
        assignee_ids: selectedUserIds,
        status: selectedStatus
      };

      const newTodo = await apiClient.createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
      setText('');
      setSelectedUserIds([]);
      setError('');

      // 通知を送信（自分以外の担当者へ）
      selectedUserIds.forEach(userId => {
        if (userId !== user?.id) {
          const assignee = users.find(u => u.id === userId);
          if (assignee) {
            NotificationService.showTodoAssignedNotification(text.trim(), user?.name || '');
          }
        }
      });
    } catch (error: any) {
      setError('TODOの作成に失敗しました');
      console.error('Error creating todo:', error);
    }
  };

  const updateTodoStatus = async (todoId: number, newStatus: TodoStatus) => {
    try {
      const updatedTodo = await apiClient.updateTodoStatus(todoId, newStatus);
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));

      // ステータス変更通知
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
        NotificationService.showTodoStatusChangedNotification(todo.text, newStatus);
      }
    } catch (error: any) {
      setError('ステータスの更新に失敗しました');
      console.error('Error updating todo status:', error);
    }
  };

  const deleteTodo = async (todoId: number) => {
    if (!window.confirm('このTODOを削除しますか？')) {
      return;
    }

    try {
      await apiClient.deleteTodo(todoId);
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (error: any) {
      setError('TODOの削除に失敗しました');
      console.error('Error deleting todo:', error);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getTodosByStatus = (status: TodoStatus) => 
    todos.filter(todo => todo.status === status);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, todo: Todo) => {
    setDraggedTodo(todo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TodoStatus) => {
    e.preventDefault();
    if (draggedTodo && draggedTodo.status !== newStatus) {
      updateTodoStatus(draggedTodo.id, newStatus);
    }
    setDraggedTodo(null);
  };

  const handleDragEnd = () => {
    setDraggedTodo(null);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <div>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '20px auto', 
      padding: '0 20px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>TODO管理</h1>
      
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{ marginLeft: '1rem', background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3>新しいTODOを追加</h3>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="やることを入力してください"
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            ステータス:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TodoStatus)}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">進行中</option>
            <option value="DONE">完了</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            担当者を選択:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {users.map(user => (
              <label key={user.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                  style={{ marginRight: '5px' }}
                />
                {user.name}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={addTodo}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          追加
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '20px',
        minHeight: '500px'
      }}>
        {(['TODO', 'IN_PROGRESS', 'DONE'] as TodoStatus[]).map(status => (
          <div
            key={status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              minHeight: '400px'
            }}
          >
            <h3 style={{
              margin: '0 0 15px 0',
              textAlign: 'center',
              color: status === 'TODO' ? '#6c757d' : status === 'IN_PROGRESS' ? '#007bff' : '#28a745'
            }}>
              {status === 'TODO' ? 'TODO' : status === 'IN_PROGRESS' ? '進行中' : '完了'}
              <span style={{ 
                marginLeft: '10px', 
                fontSize: '14px', 
                backgroundColor: '#f8f9fa', 
                padding: '2px 8px', 
                borderRadius: '12px' 
              }}>
                {getTodosByStatus(status).length}
              </span>
            </h3>
            
            {getTodosByStatus(status).map(todo => (
              <div
                key={todo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, todo)}
                onDragEnd={handleDragEnd}
                style={{
                  backgroundColor: draggedTodo?.id === todo.id ? '#f8f9fa' : '#fff',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '10px',
                  cursor: 'move',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  opacity: draggedTodo?.id === todo.id ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {todo.text}
                </div>
                
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
                  作成者: {todo.creator.name}
                </div>
                
                {todo.assignees.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
                    担当者: {todo.assignees.map(a => a.name).join(', ')}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    {new Date(todo.created_at).toLocaleDateString()}
                  </span>
                  
                  {user?.id === todo.creator_id && (
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoApp;