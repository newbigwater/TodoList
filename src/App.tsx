import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult, DragStart, ResponderProvided } from 'react-beautiful-dnd';
import { useTodos } from './hooks/useTodos';
import TodoList from './components/TodoList/TodoList';
import './App.css';

const App: React.FC = () => {
  // 로컬 스토리지 사용을 위한 고정 사용자 ID
  const userId = 'local-user';
  
  // Todo 상태 관리 훅 사용
  const {
    todos,
    loading: todosLoading,
    error: todosError,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    toggleInProgress,
    changePriority
  } = useTodos({ userId });

  // 검색어 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 컴포넌트 마운트 시 로그
  useEffect(() => {
    // 기존 드래그 이벤트 리스너 제거
    const oldDragEnd = window.ondragend;
    
    return () => {
      // 기존 함수 복원
      if (oldDragEnd) {
        window.ondragend = oldDragEnd;
      }
    };
  }, [todos]);

  // 드래그 시작 핸들러
  const handleDragStart = (initial: DragStart, provided: ResponderProvided) => {
    setIsDragging(true);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDragging(false);
    
    // TodoList 컴포넌트에서 드래그 종료 처리를 위한 커스텀 이벤트 발생
    const event = new CustomEvent('dragend', { detail: result });
    window.dispatchEvent(event);
  };

  // 오류 처리
  if (todosError) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2 className="error-title">오류가 발생했습니다</h2>
          <p className="error-message">{todosError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <TodoList
          todos={todos}
          isLoading={todosLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddTodo={addTodo}
          onUpdateTodo={updateTodo}
          onDeleteTodo={deleteTodo}
          onToggleComplete={toggleComplete}
          onToggleInProgress={toggleInProgress}
          onChangePriority={changePriority}
        />
      </DragDropContext>
    </div>
  );
};

export default App; 