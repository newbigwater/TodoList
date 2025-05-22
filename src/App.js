import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import TodoList from './components/TodoList/TodoList';
import './App.css';

function App() {
  const { user, loading: authLoading, error: authError, signIn } = useAuth();
  const [authInitialized, setAuthInitialized] = useState(false);

  // 초기 익명 로그인 처리
  useEffect(() => {
    const initializeAuth = async () => {
      if (!user && !authLoading && !authInitialized) {
        try {
          await signIn();
        } catch (error) {
          console.error('로그인 실패:', error);
        } finally {
          setAuthInitialized(true);
        }
      }
    };

    initializeAuth();
  }, [user, authLoading, authInitialized, signIn]);

  // 인증이 완료되면 할 일 목록 가져오기
  const {
    todos,
    loading: todosLoading,
    error: todosError,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    changePriority
  } = useTodos({ userId: user?.uid || '' });

  // 전체 로딩 상태
  const isLoading = authLoading || !authInitialized || (user && todosLoading);

  // 오류 처리
  const error = authError || todosError;

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2 className="error-title">오류가 발생했습니다</h2>
          <p className="error-message">{error.message}</p>
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

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <TodoList
        todos={todos}
        isLoading={todosLoading}
        onAddTodo={addTodo}
        onUpdateTodo={updateTodo}
        onDeleteTodo={deleteTodo}
        onToggleComplete={toggleComplete}
        onChangePriority={changePriority}
      />
    </div>
  );
}

export default App; 