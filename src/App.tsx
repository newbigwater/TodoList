import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult, DragStart, ResponderProvided } from 'react-beautiful-dnd';
import { useTodos } from './hooks/useTodos';
import TodoList from './components/TodoList/TodoList';
import { checkExistingData } from './services/firestoreService';
import { checkFirebaseStatus } from './services/firebase';
import './App.css';

const App: React.FC = () => {
  // 로컬 스토리지 사용을 위한 고정 사용자 ID (스크린샷에서 본 ID 형식과 일치시킴)
  const userId = 'local-user-123456';
  
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
  const [dataCheckResult, setDataCheckResult] = useState<string>('');
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);

  // 컴포넌트 마운트 시 디버그 로그 추가
  useEffect(() => {
    console.log('App 컴포넌트 마운트됨, userId:', userId);
    console.log('현재 todos 상태:', todos);
    
    // Firebase 상태 확인
    const status = checkFirebaseStatus();
    console.log('Firebase 상태:', status);
    setFirebaseStatus(status);
    
    // 기존 드래그 이벤트 리스너 제거
    const oldDragEnd = window.ondragend;
    
    // 마운트 시 자동으로 데이터 확인
    const checkInitialData = async () => {
      try {
        console.log('초기 데이터 확인 시작');
        const count = await checkExistingData(userId);
        const result = `초기 데이터 확인: 사용자 ${userId}의 데이터 ${count}개 확인됨`;
        console.log(result);
        setDataCheckResult(result);
      } catch (error) {
        console.error('초기 데이터 확인 실패:', error);
      }
    };
    
    checkInitialData();
    
    return () => {
      // 기존 함수 복원
      if (oldDragEnd) {
        window.ondragend = oldDragEnd;
      }
    };
  }, [userId]); // todos는 의존성에서 제거 (순환 참조 방지)
  
  // todos 변경 시 로그 추가
  useEffect(() => {
    console.log('todos 상태 변경됨:', todos);
  }, [todos]);

  // 테스트 데이터 추가 (임시 함수)
  const addTestData = async () => {
    try {
      console.log('테스트 데이터 추가 시작');
      await addTodo('테스트 할 일', '이것은 테스트 항목입니다', 1);
      console.log('테스트 데이터 추가 완료');
    } catch (error) {
      console.error('테스트 데이터 추가 실패:', error);
    }
  };

  // 기존 데이터 확인 (임시 함수)
  const checkData = async () => {
    try {
      console.log('데이터 확인 시작');
      const count = await checkExistingData(userId);
      const result = `사용자 ${userId}의 데이터 ${count}개 확인됨`;
      console.log(result);
      setDataCheckResult(result);
    } catch (error) {
      console.error('데이터 확인 실패:', error);
      setDataCheckResult('데이터 확인 실패: ' + String(error));
    }
  };

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
      {/* 테스트 데이터 추가 버튼 (임시) */}
      <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={addTestData}
            style={{ 
              padding: '8px 16px', 
              background: '#4CAF50', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            테스트 데이터 추가
          </button>
          
          <button 
            onClick={checkData}
            style={{ 
              padding: '8px 16px', 
              background: '#2196F3', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            데이터 확인
          </button>
        </div>
        
        <div style={{ marginTop: '5px', fontSize: '12px' }}>
          현재 로딩 상태: {todosLoading ? '로딩 중' : '로딩 완료'}, 
          총 할 일 개수: {todos.length}
        </div>
        
        {dataCheckResult && (
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#0D47A1' }}>
            {dataCheckResult}
          </div>
        )}
        
        {firebaseStatus && (
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#311B92', background: '#E8EAF6', padding: '5px' }}>
            <strong>Firebase 상태:</strong> {firebaseStatus.initialized ? '초기화됨' : '초기화 실패'}<br />
            <strong>Firestore:</strong> {firebaseStatus.services.firestore ? '사용 가능' : '사용 불가'}<br />
            <strong>프로젝트:</strong> {firebaseStatus.config.projectId}
          </div>
        )}
      </div>

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