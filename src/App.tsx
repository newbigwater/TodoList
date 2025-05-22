import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult, DragStart, ResponderProvided, DraggableLocation } from 'react-beautiful-dnd';
import { useTodos } from './hooks/useTodos';
import TodoList from './components/TodoList/TodoList';
import { Todo, Priority } from './types';
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
  const [showDebugLog, setShowDebugLog] = useState(false);

  // 컴포넌트 마운트 시 로그
  useEffect(() => {
    console.log('App 컴포넌트 마운트됨');
    console.log('React-beautiful-dnd 사용 시작');
    console.log('todos 데이터:', todos);

    // 기존 드래그 이벤트 리스너 제거
    const oldDragEnd = window.ondragend;
    
    // 기본 드래그 이벤트 모니터링
    window.addEventListener('dragstart', () => console.log('네이티브 dragstart 이벤트 발생'));
    window.addEventListener('drag', () => console.log('네이티브 drag 이벤트 발생'));
    window.addEventListener('dragend', () => console.log('네이티브 dragend 이벤트 발생'));

    return () => {
      console.log('App 컴포넌트 언마운트됨');
      // 이벤트 리스너 정리
      window.removeEventListener('dragstart', () => console.log('네이티브 dragstart 이벤트 발생'));
      window.removeEventListener('drag', () => console.log('네이티브 drag 이벤트 발생'));
      window.removeEventListener('dragend', () => console.log('네이티브 dragend 이벤트 발생'));
      
      // 기존 함수 복원
      if (oldDragEnd) {
        window.ondragend = oldDragEnd;
      }
    };
  }, [todos]);

  // 드래그 시작 핸들러
  const handleDragStart = (initial: DragStart, provided: ResponderProvided) => {
    setIsDragging(true);
    console.log('드래그 시작:', {
      draggableId: initial.draggableId,
      source: initial.source,
      type: initial.type,
      mode: initial.mode
    });
    
    // 드래그되는 항목 검색
    const draggedItem = todos.find(todo => todo.id === initial.draggableId);
    console.log('드래그 중인 항목:', draggedItem);
    
    // 드래그 핸들러 DOM 요소 확인
    const dragHandleElement = document.querySelector(`[data-testid="drag-handle-${initial.draggableId}"]`);
    console.log('드래그 핸들 요소 존재:', dragHandleElement ? '예' : '아니오');
  };

  // 드래그 종료 핸들러
  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    console.log('드래그 끝:', {
      draggableId: result.draggableId,
      source: result.source,
      destination: result.destination,
      reason: result.reason,
      mode: result.mode
    });
    setIsDragging(false);
    
    // 드래그 이동 거리 계산
    if (result.destination && result.source) {
      const sourceId = result.source.droppableId;
      const destId = result.destination.droppableId;
      console.log(`이동: ${sourceId} -> ${destId}, 항목 ID: ${result.draggableId}`);
    } else {
      console.log('목적지가 없음 - 드롭 취소됨');
    }
    
    // TodoList 컴포넌트에서 드래그 종료 처리를 위한 커스텀 이벤트 발생
    const event = new CustomEvent('dragend', { detail: result });
    window.dispatchEvent(event);
    console.log('Custom dragend 이벤트 발생됨');
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

  // 디버그 로그 토글
  const toggleDebugLog = () => {
    setShowDebugLog(!showDebugLog);
  };

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
      
      {/* 디버그 로그 버튼 */}
      <button 
        className="debug-toggle-btn"
        onClick={toggleDebugLog}
        title="디버그 로그 표시/숨기기"
      >
        {showDebugLog ? '로그 숨기기' : '로그 보기'}
      </button>
      
      {/* 디버그 로그 패널 */}
      {showDebugLog && (
        <div className="debug-log-container">
          <div className="debug-log-header">
            <h3>드래그 앤 드롭 디버그 로그</h3>
            <button onClick={() => {
              const logDiv = document.getElementById('debug-log');
              if (logDiv) logDiv.innerHTML = '';
            }}>로그 지우기</button>
          </div>
          <div id="debug-log" className="debug-log">
            <div className="log-item">로그를 확인하려면 할 일을 드래그해보세요.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App; 