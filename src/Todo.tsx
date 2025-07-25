/**
 * Todoアプリのメインコンポーネント
 * @author CR-ACHIWA
 */
import React, { useEffect, useState } from 'react';

interface Member {
  id: number;
  name: string;
}

interface Todo {
  id: number;
  text: string;
  memberId: number;
}

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<number>(0);

  useEffect(() => {
    fetch('/members.json')
      .then(res => res.json())
      .then(data => {
        setMembers(data);
        if (data.length > 0) setSelectedMember(data[0].id);
      });
  }, []);

  const addTodo = () => {
    if (!text.trim() || !selectedMember) return;
    setTodos([
      ...todos,
      { id: Date.now(), text, memberId: selectedMember }
    ]);
    setText('');
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Todoリスト</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="やることを入力"
          style={{ flex: 1 }}
        />
        <select value={selectedMember} onChange={e => setSelectedMember(Number(e.target.value))}>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <button onClick={addTodo}>追加</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} style={{ marginBottom: 8 }}>
            {todo.text}（{members.find(m => m.id === todo.memberId)?.name ?? ''}）
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
