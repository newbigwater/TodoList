import React, { useState } from 'react';
import TodoItem from '../TodoItem/TodoItem';
import AddTodoForm from '../AddTodoForm/AddTodoForm';
import './TodoList.css';

const TodoList = ({
  todos,
  isLoading,
  searchQuery,
  setSearchQuery,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
  onToggleInProgress,
  onChangePriority
}) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const handleAddTodo = async (title, description, priority) => {
    try {
      await onAddTodo(title, description, priority);
    } catch (error) {
      console.error('할 일 추가 실패:', error);
    }
  };

  const handleUpdateTodo = async (id, title, description, priority) => {
    try {
      await onUpdateTodo(id, { title, description, priority });
    } catch (error) {
      console.error('할 일 수정 실패:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await onDeleteTodo(id);
    } catch (error) {
      console.error('할 일 삭제 실패:', error);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await onToggleComplete(id, completed);
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  const handleToggleInProgress = async (id, inProgress) => {
    try {
      await onToggleInProgress(id, inProgress);
    } catch (error) {
      console.error('진행 상태 변경 실패:', error);
    }
  };

  const handleChangePriority = async (id, priority) => {
    try {
      await onChangePriority(id, priority);
    } catch (error) {
      console.error('우선순위 변경 실패:', error);
    }
  };

  // 검색어에 따른 필터링
  const filterBySearch = (todo) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      todo.title.toLowerCase().includes(query) ||
      (todo.description && todo.description.toLowerCase().includes(query))
    );
  };

  // 상태별 필터링 (칸반 보드 분류용)
  const todoItems = todos.filter(todo => !todo.completed && !todo.inProgress && filterBySearch(todo));
  const inProgressItems = todos.filter(todo => todo.inProgress && !todo.completed && filterBySearch(todo));
  const completedItems = todos.filter(todo => todo.completed && filterBySearch(todo));

  return (
    <div className="app-container">
      <div className="header-section">
        <h1 className="app-title">할 일 관리 애플리케이션</h1>
        <h2 className="app-subtitle">Firebase를 활용한 실시간 투두리스트 앱</h2>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="add-todo-title">
            <div className="icon-plus">+</div>
            <h2>새로운 할 일 추가</h2>
          </div>
        </div>
        <div className="card-body">
          <AddTodoForm onAddTodo={handleAddTodo} />
        </div>
      </div>

      <div className="card">
        <div className="card-header filter-section">
          <div className="filter-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </div>
          <h2>검색</h2>
        </div>
        <div className="card-body">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="할 일 검색..." 
              className="search-input full-width" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="kanban-board">
          {/* To Do 컬럼 */}
          <div className="kanban-column">
            <div className="column-header">
              <h2>할 일</h2>
              <span className="column-count">{todoItems.length}</span>
            </div>
            <div className="column-content">
              {todoItems.length === 0 ? (
                <div className="empty-column">
                  <p>할 일이 없습니다</p>
                </div>
              ) : (
                todoItems.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggleComplete={handleToggleComplete}
                    onToggleInProgress={handleToggleInProgress}
                    onDelete={handleDeleteTodo}
                    onEdit={handleUpdateTodo}
                    onChangePriority={handleChangePriority}
                  />
                ))
              )}
            </div>
          </div>

          {/* In Progress 컬럼 */}
          <div className="kanban-column">
            <div className="column-header">
              <h2>진행 중</h2>
              <span className="column-count">{inProgressItems.length}</span>
            </div>
            <div className="column-content">
              {inProgressItems.length === 0 ? (
                <div className="empty-column">
                  <p>진행 중인 항목이 없습니다</p>
                </div>
              ) : (
                inProgressItems.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggleComplete={handleToggleComplete}
                    onToggleInProgress={handleToggleInProgress}
                    onDelete={handleDeleteTodo}
                    onEdit={handleUpdateTodo}
                    onChangePriority={handleChangePriority}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completed 컬럼 */}
          <div className="kanban-column">
            <div className="column-header">
              <h2>완료</h2>
              <span className="column-count">{completedItems.length}</span>
            </div>
            <div className="column-content">
              {completedItems.length === 0 ? (
                <div className="empty-column">
                  <p>완료된 항목이 없습니다</p>
                </div>
              ) : (
                completedItems.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggleComplete={handleToggleComplete}
                    onToggleInProgress={handleToggleInProgress}
                    onDelete={handleDeleteTodo}
                    onEdit={handleUpdateTodo}
                    onChangePriority={handleChangePriority}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList; 