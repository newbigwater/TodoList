import React, { useState } from 'react';
import './TodoItem.css';

function TodoItem({ todo, onToggleComplete, onToggleInProgress, onDelete, onEdit, onChangePriority }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');
  const [editedPriority, setEditedPriority] = useState(todo.priority);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleComplete = () => {
    onToggleComplete(todo.id, !todo.completed);
  };

  const handleToggleInProgress = () => {
    onToggleInProgress(todo.id, !todo.inProgress);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  const handleEditClick = () => {
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || '');
    setEditedPriority(todo.priority);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (editedTitle.trim() === '') return;
    onEdit(todo.id, editedTitle.trim(), editedDescription.trim(), editedPriority);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTitle(todo.title);
      setEditedDescription(todo.description || '');
      setEditedPriority(todo.priority);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 1: return 'priority-high';
      case 2: return 'priority-medium';
      case 3: return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return '중요';
      case 2: return '보통';
      case 3: return '낮음';
      default: return '보통';
    }
  };

  // 날짜 형식화 함수
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const hasDescription = todo.description && todo.description.trim() !== '';

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.inProgress ? 'in-progress' : ''} ${getPriorityClass(todo.priority)}`}>
      {isEditing ? (
        <div className="edit-container">
          <div className="edit-fields">
            <input
              type="text"
              className="edit-input"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="제목"
              autoFocus
            />
            <textarea
              className="edit-textarea"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.shiftKey ? null : e.stopPropagation()}
              placeholder="상세 내용"
              rows="3"
            />
            <div className="edit-priority">
              <label>우선순위:</label>
              <div className="priority-buttons">
                <button
                  type="button"
                  onClick={() => setEditedPriority(1)}
                  className={`priority-btn ${editedPriority === 1 ? 'priority-high active' : ''}`}
                >
                  중요
                </button>
                <button
                  type="button"
                  onClick={() => setEditedPriority(2)}
                  className={`priority-btn ${editedPriority === 2 ? 'priority-medium active' : ''}`}
                >
                  보통
                </button>
                <button
                  type="button"
                  onClick={() => setEditedPriority(3)}
                  className={`priority-btn ${editedPriority === 3 ? 'priority-low active' : ''}`}
                >
                  낮음
                </button>
              </div>
            </div>
          </div>
          <div className="edit-actions">
            <button onClick={handleEditSave} className="save-btn">저장</button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">취소</button>
          </div>
        </div>
      ) : (
        <>
          <div className="todo-content">
            <div className="checkbox-container">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={handleToggleComplete}
                id={`todo-${todo.id}`}
                className="todo-checkbox"
              />
              <label htmlFor={`todo-${todo.id}`} className="checkbox-label"></label>
            </div>
            <div className="todo-details" onClick={hasDescription ? toggleExpand : null}>
              <div className="todo-title-row">
                <div className="todo-title">{todo.title}</div>
                {hasDescription && (
                  <button 
                    className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className="todo-meta">
                <span className="todo-date">{formatDate(todo.updatedAt)}</span>
                <span className={`todo-priority ${getPriorityClass(todo.priority)}`}>{getPriorityText(todo.priority)}</span>
              </div>
              {isExpanded && hasDescription && (
                <div className="todo-description">
                  {todo.description}
                </div>
              )}
            </div>
          </div>
          <div className="todo-actions">
            {!todo.completed && (
              <button 
                onClick={handleToggleInProgress} 
                className={`status-btn ${todo.inProgress ? 'active' : ''}`}
                title={todo.inProgress ? '진행 중 취소' : '진행 중으로 표시'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
              </button>
            )}
            <button onClick={handleEditClick} className="edit-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
              </svg>
            </button>
            <button onClick={handleDelete} className="delete-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TodoItem; 