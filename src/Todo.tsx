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
    <div className="kanban-root">
      <h2 className="kanban-title">カンバンボード</h2>

      {/* Todo追加フォーム */}
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
            {members.map(member => (
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

      {/* カンバンボード */}
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
                    担当: {getMemberNames(todo.memberIds)}
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
// ...existing code...
// JSXの末尾に重複したstyle付きのコードが残っていたため、すべて削除
// ...existing code...
};

export default TodoApp;
