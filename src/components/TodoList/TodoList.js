import React, { useState, useEffect, useRef } from 'react';
import TodoItem from '../TodoItem/TodoItem';
import AddTodoForm from '../AddTodoForm/AddTodoForm';
import './TodoList.css';

// 칸반 컬럼 ID 상수
const COLUMN_TODO = 'todo';
const COLUMN_IN_PROGRESS = 'in-progress';
const COLUMN_COMPLETED = 'completed';

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
  const [isDragging, setIsDragging] = useState(false);
  const [currentDraggedId, setCurrentDraggedId] = useState(null);
  const todoColumnRef = useRef(null);
  const inProgressColumnRef = useRef(null);
  const completedColumnRef = useRef(null);
  
  // 알림 메시지 상태
  const [notification, setNotification] = useState(null);
  
  // 알림 표시 함수
  const addNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 드래그 앤 드롭 설정
  useEffect(() => {
    // 전역 드래그 상태 관리 핸들러
    const handleGlobalDragStart = (e) => {
      const target = e.target;
      if (!target) return;
      
      // TodoItem 요소를 찾음
      const todoItem = target.closest('[data-todo-id]');
      if (!todoItem) return;
      
      const todoId = todoItem.getAttribute('data-todo-id');
      if (!todoId) return;
      
      setIsDragging(true);
      setCurrentDraggedId(todoId);
      document.body.classList.add('dragging-active');
    };
    
    const handleGlobalDragEnd = () => {
      setIsDragging(false);
      setCurrentDraggedId(null);
      document.body.classList.remove('dragging-active');
      
      // 드래그 관련 클래스 제거
      document.querySelectorAll('.dragging').forEach(el => {
        el.classList.remove('dragging');
      });
      
      document.querySelectorAll('.dragging-over').forEach(el => {
        el.classList.remove('dragging-over');
      });
    };
    
    // 전역 이벤트 리스너 등록
    document.addEventListener('dragstart', handleGlobalDragStart, false);
    document.addEventListener('dragend', handleGlobalDragEnd, false);
    
    return () => {
      document.removeEventListener('dragstart', handleGlobalDragStart);
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  // 칸반 컬럼 드롭 이벤트 설정
  useEffect(() => {
    const setupDropZone = (columnRef, columnId) => {
      const column = columnRef.current;
      if (!column) return;
      
      column.setAttribute('data-column-id', columnId);
      
      const handleDragOver = (e) => {
        e.preventDefault(); // 필수: 드롭을 허용하기 위해
        e.stopPropagation();
        
        if (!isDragging || !currentDraggedId) return;
        
        // 드래그 중인 항목 찾기
        const todoElement = document.querySelector(`[data-todo-id="${currentDraggedId}"]`);
        if (!todoElement) return;
        
        const todoCompleted = todoElement.getAttribute('data-completed') === 'true';
        const todoInProgress = todoElement.getAttribute('data-in-progress') === 'true';
        
        // 현재 상태에 따라 드롭 가능 여부 결정
        let canDrop = false;
        if (columnId === COLUMN_TODO && (todoCompleted || todoInProgress)) {
          canDrop = true;
        } else if (columnId === COLUMN_IN_PROGRESS && (!todoInProgress || todoCompleted)) {
          canDrop = true;
        } else if (columnId === COLUMN_COMPLETED && !todoCompleted) {
          canDrop = true;
        }
        
        if (canDrop) {
          column.classList.add('dragging-over');
        }
      };
      
      const handleDragLeave = (e) => {
        const relatedTarget = e.relatedTarget;
        
        // 칸반 컬럼 내부 요소로 이동하는 경우는 무시
        if (column.contains(relatedTarget)) return;
        
        column.classList.remove('dragging-over');
      };
      
      const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const todoId = e.dataTransfer.getData('text/plain');
        if (!todoId) return;
        
        column.classList.remove('dragging-over');
        
        try {
          const todo = todos.find(t => t.id === todoId);
          if (!todo) return;
          
          // 칸반 컬럼 ID에 따라 상태 변경
          if (columnId === COLUMN_COMPLETED && !todo.completed) {
            // 완료 상태로 변경
            if (todo.inProgress) {
              await handleToggleInProgress(todoId, false);
            }
            await handleToggleComplete(todoId, true);
            addNotification('할 일이 완료 상태로 이동되었습니다.', 'success');
          } 
          else if (columnId === COLUMN_IN_PROGRESS) {
            // 진행 중 상태로 변경
            if (todo.completed) {
              await handleToggleComplete(todoId, false);
            }
            await handleToggleInProgress(todoId, true);
            addNotification('할 일이 진행 중 상태로 이동되었습니다.', 'success');
          }
          else if (columnId === COLUMN_TODO && (todo.inProgress || todo.completed)) {
            // 할 일 상태로 변경 (버그 수정)
            // 먼저 완료 상태를 false로 설정
            if (todo.completed) {
              await handleToggleComplete(todoId, false);
            }
            // 그 다음 진행 중 상태를 false로 설정
            if (todo.inProgress) {
              await handleToggleInProgress(todoId, false);
            }
            addNotification('할 일이 할 일 상태로 이동되었습니다.', 'success');
          }
        } catch (error) {
          addNotification('할 일 상태 변경 중 오류가 발생했습니다.', 'error');
        }
      };
      
      // 이벤트 등록
      column.addEventListener('dragover', handleDragOver);
      column.addEventListener('dragleave', handleDragLeave);
      column.addEventListener('drop', handleDrop);
      
      // 클린업 함수 반환
      return () => {
        column.removeEventListener('dragover', handleDragOver);
        column.removeEventListener('dragleave', handleDragLeave);
        column.removeEventListener('drop', handleDrop);
      };
    };
    
    // 각 칸반 컬럼에 드롭 이벤트 설정
    const cleanupTodo = setupDropZone(todoColumnRef, COLUMN_TODO);
    const cleanupInProgress = setupDropZone(inProgressColumnRef, COLUMN_IN_PROGRESS);
    const cleanupCompleted = setupDropZone(completedColumnRef, COLUMN_COMPLETED);
    
    // 정리 함수 반환
    return () => {
      cleanupTodo && cleanupTodo();
      cleanupInProgress && cleanupInProgress();
      cleanupCompleted && cleanupCompleted();
    };
  }, [isDragging, currentDraggedId, todos]);

  const handleAddTodo = async (title, description, priority) => {
    try {
      await onAddTodo(title, description, priority);
      addNotification('할 일이 추가되었습니다.', 'success');
    } catch (error) {
      console.error('할 일 추가 실패:', error);
      addNotification(error.message || '할 일 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleUpdateTodo = async (id, title, description, priority) => {
    try {
      await onUpdateTodo(id, { title, description, priority });
      addNotification('할 일이 수정되었습니다.', 'success');
    } catch (error) {
      console.error('할 일 수정 실패:', error);
      addNotification(error.message || '할 일 수정 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await onDeleteTodo(id);
      addNotification('할 일이 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('할 일 삭제 실패:', error);
      addNotification('할 일 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      // 완료 상태로 변경할 때 진행 중 상태 해제
      if (completed) {
        const todo = todos.find(t => t.id === id);
        if (todo && todo.inProgress) {
          // 완료 상태로 변경 시 진행 중 상태를 먼저 해제
          await onToggleInProgress(id, false);
        }
      }
      
      await onToggleComplete(id, completed);
      if (completed) {
        addNotification('할 일이 완료되었습니다.', 'success');
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      addNotification('상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleToggleInProgress = async (id, inProgress) => {
    try {
      // 진행 중 상태로 변경할 때 완료 상태 해제
      if (inProgress) {
        const todo = todos.find(t => t.id === id);
        if (todo && todo.completed) {
          await onToggleComplete(id, false);
        }
      }
      
      await onToggleInProgress(id, inProgress);
      if (inProgress) {
        addNotification('할 일이 진행 중으로 변경되었습니다.', 'info');
      }
    } catch (error) {
      console.error('진행 상태 변경 실패:', error);
      addNotification('진행 상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleChangePriority = async (id, priority) => {
    try {
      await onChangePriority(id, priority);
      addNotification('우선순위가 변경되었습니다.', 'info');
    } catch (error) {
      console.error('우선순위 변경 실패:', error);
      addNotification('우선순위 변경 중 오류가 발생했습니다.', 'error');
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
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
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
          <div 
            ref={todoColumnRef}
            className="kanban-column"
          >
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
          <div 
            ref={inProgressColumnRef}
            className="kanban-column"
          >
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
          <div 
            ref={completedColumnRef}
            className="kanban-column"
          >
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