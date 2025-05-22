import React, { useState } from 'react';
import './AddTodoForm.css';

function AddTodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(2); // 기본 우선순위: 중간

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (title.trim() === '') return;
    
    onAddTodo(title.trim(), description.trim(), priority);
    setTitle('');
    setDescription('');
    setPriority(2);
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <div className="form-group">
        <label htmlFor="todo-title">할 일</label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일을 입력하세요..."
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="todo-description">내용</label>
        <textarea
          id="todo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="상세 내용을 입력하세요..."
          className="form-textarea"
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="todo-priority">상태 설정 (선택사항)</label>
        <div className="priority-buttons">
          <button
            type="button"
            onClick={() => setPriority(1)}
            className={`priority-btn ${priority === 1 ? 'priority-high active' : ''}`}
          >
            중요
          </button>
          <button
            type="button"
            onClick={() => setPriority(2)}
            className={`priority-btn ${priority === 2 ? 'priority-medium active' : ''}`}
          >
            보통
          </button>
          <button
            type="button"
            onClick={() => setPriority(3)}
            className={`priority-btn ${priority === 3 ? 'priority-low active' : ''}`}
          >
            낮음
          </button>
        </div>
      </div>
      
      <div className="form-actions">
        <button
          type="submit"
          disabled={title.trim() === ''}
          className={`submit-btn ${
            title.trim() === '' ? 'disabled' : ''
          }`}
        >
          추가하기
        </button>
      </div>
    </form>
  );
}

export default AddTodoForm; 