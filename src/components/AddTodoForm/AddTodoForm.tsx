import React, { useState } from 'react';
import { Priority } from '../../types';
import './AddTodoForm.css';

interface AddTodoFormProps {
  onAddTodo: (title: string, description?: string, priority?: number) => Promise<void>;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(Priority.Medium); // 기본 우선순위: 중간

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim() === '') return;
    
    onAddTodo(title.trim(), description.trim(), priority);
    setTitle('');
    setDescription('');
    setPriority(Priority.Medium);
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
          rows={3}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="todo-priority">상태 설정 (선택사항)</label>
        <div className="priority-buttons">
          <button
            type="button"
            onClick={() => setPriority(Priority.High)}
            className={`priority-btn ${priority === Priority.High ? 'priority-high active' : ''}`}
          >
            중요
          </button>
          <button
            type="button"
            onClick={() => setPriority(Priority.Medium)}
            className={`priority-btn ${priority === Priority.Medium ? 'priority-medium active' : ''}`}
          >
            보통
          </button>
          <button
            type="button"
            onClick={() => setPriority(Priority.Low)}
            className={`priority-btn ${priority === Priority.Low ? 'priority-low active' : ''}`}
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
};

export default AddTodoForm; 