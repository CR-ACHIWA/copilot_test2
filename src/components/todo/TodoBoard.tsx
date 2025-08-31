import React, { useState } from 'react';
import type { TodoStatus, TodoItem } from '../../types';
import { useTodos } from '../../hooks/useTodos';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';

const TodoBoard: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus>('TODO');
  const [draggedTodo, setDraggedTodo] = useState<TodoItem | null>(null);

  const { user } = useAuth();
  const { users } = useUsers();
  const { 
    isLoading, 
    error, 
    createTodo, 
    updateTodoStatus, 
    getTodosByStatus 
  } = useTodos();
  const { requestPermission, sendNotification } = useNotification();

  React.useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const addTodo = async () => {
    if (!text.trim() || selectedMembers.length === 0 || !user) return;

    const newTodo = await createTodo({
      text,
      status: selectedStatus,
      assigneeIds: selectedMembers,
    });

    if (newTodo) {
      setText('');
      setSelectedMembers([]);
      

      if (selectedMembers.includes(user.id)) {
        sendNotification({
          title: '新しいタスクが割り当てられました',
          body: `「${text}」があなたに割り当てられました`,
        });
      }
    }
  };

  const moveTodo = async (todoId: number, newStatus: TodoStatus) => {
    await updateTodoStatus(todoId, newStatus);
  };

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getMemberNames = (assignees: TodoItem['assignees']) => 
    assignees.map(assignee => assignee.name).join(', ');

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, todo: TodoItem) => {
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

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-root">
      <h2 className="kanban-title">カンバンボード</h2>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="kanban-form">
        <h3>新しいタスクを追加</h3>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="やることを入力"
            className="kanban-input"
          />
        </div>

        <div style={{ marginBottom: 16, textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            ステータス:
          </label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as TodoStatus)}
            className="kanban-status-select"
            style={{ textAlign: 'left' }}
          >
            <option value="TODO">TODO</option>
            <option value="PROGRESS">PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        <div style={{ marginBottom: 16, textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', textAlign: 'left' }}>
            担当者（複数選択可）:
          </label>
          <div>
            {users.map(member => (
              <label key={member.id} className="kanban-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => toggleMemberSelection(member.id)}
                />
                {member.name}
              </label>
            ))}
          </div>
        </div>

        <div className="kanban-btn-row">
          <button
            onClick={addTodo}
            disabled={!text.trim() || selectedMembers.length === 0}
            className="kanban-add-btn"
          >
            追加
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {(['TODO', 'PROGRESS', 'DONE'] as TodoStatus[]).map(status => (
          <div
            key={status}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <h3 className={`kanban-column-title ${status.toLowerCase()}`}>
              {status} ({getTodosByStatus(status).length})
            </h3>

            <div className="kanban-tasks">
              {getTodosByStatus(status).map(todo => (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo)}
                  onDragEnd={handleDragEnd}
                  className={`kanban-task${draggedTodo?.id === todo.id ? ' dragging' : ''}`}
                >
                  <div className="kanban-task-title">
                    {todo.text}
                  </div>
                  <div className="kanban-task-members">
                    担当: {getMemberNames(todo.assignees)}
                  </div>
                  <div className="kanban-task-creator">
                    作成者: {todo.created_by_name}
                  </div>

                  <div className="kanban-task-btns">
                    {(['TODO', 'PROGRESS', 'DONE'] as TodoStatus[])
                      .filter(s => s !== todo.status)
                      .map(newStatus => (
                        <button
                          key={newStatus}
                          onClick={() => moveTodo(todo.id, newStatus)}
                          className={`kanban-move-btn ${newStatus.toLowerCase()}`}
                        >
                          → {newStatus}
                        </button>
                      ))}
                  </div>
                </div>
              ))}

              {getTodosByStatus(status).length === 0 && (
                <div className="kanban-empty">
                  {draggedTodo && draggedTodo.status !== status
                    ? 'ここにドロップ'
                    : 'タスクがありません'
                  }
                </div>
              )}

              {getTodosByStatus(status).length > 0 && (
                <div className={`kanban-drop-area${draggedTodo && draggedTodo.status !== status ? ' active' : ''}`}>
                  {draggedTodo && draggedTodo.status !== status && 'ここにドロップ'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoBoard;