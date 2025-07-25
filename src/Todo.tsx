/**
 * Todoアプリのメインコンポーネント（カンバン方式）
 * @author CR-ACHIWA
 */
import React, { useEffect, useState } from 'react';

interface Member {
  id: number;
  name: string;
}

type TodoStatus = 'TODO' | 'PROGRESS' | 'DONE';

interface Todo {
  id: number;
  text: string;
  memberIds: number[];
  status: TodoStatus;
}

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus>('TODO');
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);

  useEffect(() => {
    fetch('/members.json')
      .then(res => res.json())
      .then(data => {
        setMembers(data);
      });
  }, []);

  const addTodo = () => {
    if (!text.trim() || selectedMembers.length === 0) return;
    setTodos([
      ...todos,
      { 
        id: Date.now(), 
        text, 
        memberIds: selectedMembers,
        status: selectedStatus
      }
    ]);
    setText('');
    setSelectedMembers([]);
  };

  const moveTodo = (todoId: number, newStatus: TodoStatus) => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, status: newStatus } : todo
    ));
  };

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getTodosByStatus = (status: TodoStatus) => 
    todos.filter(todo => todo.status === status);

  const getMemberNames = (memberIds: number[]) => 
    memberIds.map(id => members.find(m => m.id === id)?.name).filter(Boolean).join(', ');

  // ドラッグ&ドロップ関連の関数
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
      moveTodo(draggedTodo.id, newStatus);
    }
    setDraggedTodo(null);
  };

  const handleDragEnd = () => {
    setDraggedTodo(null);
  };

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 20,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>カンバンボード</h2>
      
      {/* Todo追加フォーム */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 20 
      }}>
        <h3>新しいタスクを追加</h3>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="やることを入力"
            style={{ 
              width: '100%', 
              padding: 8, 
              marginBottom: 8,
              borderRadius: 4,
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            ステータス:
          </label>
          <select 
            value={selectedStatus} 
            onChange={e => setSelectedStatus(e.target.value as TodoStatus)}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="TODO">TODO</option>
            <option value="PROGRESS">PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            担当者（複数選択可）:
          </label>
          {members.map(member => (
            <label key={member.id} style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={() => toggleMemberSelection(member.id)}
                style={{ marginRight: 8 }}
              />
              {member.name}
            </label>
          ))}
        </div>

        <button 
          onClick={addTodo}
          disabled={!text.trim() || selectedMembers.length === 0}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: selectedMembers.length > 0 && text.trim() ? 'pointer' : 'not-allowed',
            opacity: selectedMembers.length > 0 && text.trim() ? 1 : 0.6
          }}
        >
          追加
        </button>
      </div>

      {/* カンバンボード */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 20,
        minHeight: 400
      }}>
        {(['TODO', 'PROGRESS', 'DONE'] as TodoStatus[]).map(status => (
          <div 
            key={status} 
            style={{ 
              backgroundColor: '#f8f9fa',
              borderRadius: 8,
              padding: 16,
              border: '2px solid #dee2e6'
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <h3 style={{ 
              textAlign: 'center', 
              margin: '0 0 16px 0',
              padding: '8px 0',
              backgroundColor: status === 'TODO' ? '#e3f2fd' : 
                              status === 'PROGRESS' ? '#fff3e0' : '#e8f5e8',
              borderRadius: 4,
              color: status === 'TODO' ? '#1976d2' : 
                     status === 'PROGRESS' ? '#f57c00' : '#388e3c'
            }}>
              {status} ({getTodosByStatus(status).length})
            </h3>
            
            {getTodosByStatus(status).map(todo => (
              <div 
                key={todo.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, todo)}
                onDragEnd={handleDragEnd}
                style={{ 
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: 12,
                  marginBottom: 8,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'move',
                  opacity: draggedTodo?.id === todo.id ? 0.5 : 1,
                  transform: draggedTodo?.id === todo.id ? 'rotate(5deg)' : 'none',
                  transition: 'opacity 0.2s, transform 0.2s'
                }}
              >
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                  {todo.text}
                </div>
                <div style={{ 
                  fontSize: '0.85em', 
                  color: '#666',
                  marginBottom: 8 
                }}>
                  担当: {getMemberNames(todo.memberIds)}
                </div>
                
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(['TODO', 'PROGRESS', 'DONE'] as TodoStatus[])
                    .filter(s => s !== todo.status)
                    .map(newStatus => (
                      <button
                        key={newStatus}
                        onClick={() => moveTodo(todo.id, newStatus)}
                        style={{
                          fontSize: '0.75em',
                          padding: '4px 8px',
                          backgroundColor: newStatus === 'TODO' ? '#2196f3' : 
                                         newStatus === 'PROGRESS' ? '#ff9800' : '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: 3,
                          cursor: 'pointer'
                        }}
                      >
                        → {newStatus}
                      </button>
                    ))}
                </div>
              </div>
            ))}
            
            {getTodosByStatus(status).length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#999', 
                fontStyle: 'italic',
                padding: 20,
                border: '2px dashed #ddd',
                borderRadius: 4,
                backgroundColor: '#fafafa'
              }}>
                {draggedTodo && draggedTodo.status !== status 
                  ? 'ここにドロップ' 
                  : 'タスクがありません'
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoApp;
