import { useState, useEffect } from 'react';
import { 
  getTodos, 
  addTodo as addTodoService, 
  updateTodo as updateTodoService,
  deleteTodo as deleteTodoService,
  toggleTodoComplete as toggleTodoService,
  toggleTodoInProgress as toggleTodoInProgressService,
  changeTodoPriority as changePriorityService
} from '../services/firestoreService';

// Priority 열거형을 JavaScript 객체로 정의
const Priority = {
  High: 1,
  Medium: 2,
  Low: 3
};

export const useTodos = ({ userId }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 디버깅용 로그 함수
  const logDebug = (message, data) => {
    console.log(`[useTodos] ${message}`, data || '');
  };

  // Firestore에서 실시간으로 할 일 목록 구독
  useEffect(() => {
    logDebug('useEffect 실행: userId 변경됨', userId);
    
    if (!userId) {
      logDebug('userId가 없음, 빈 배열 설정');
      setTodos([]);
      setLoading(false);
      return () => {};
    }

    logDebug('Firestore 구독 시작');
    setLoading(true);
    
    try {
      const unsubscribe = getTodos(userId, (newTodos) => {
        logDebug(`Firestore 콜백 - ${newTodos.length}개의 할 일 수신됨`, newTodos);
        setTodos(newTodos);
        setLoading(false);
      });

      // 컴포넌트 언마운트 시 구독 해제
      return () => {
        logDebug('Firestore 구독 해제');
        unsubscribe();
      };
    } catch (err) {
      logDebug('Firestore 구독 중 오류 발생', err);
      setError(err);
      setLoading(false);
      return () => {};
    }
  }, [userId]);

  // 할 일 추가
  const addTodo = async (title, description = '', priority = Priority.Medium) => {
    logDebug('할 일 추가 요청', { title, description, priority });
    
    try {
      setError(null);
      const newTodo = await addTodoService(userId, title, description, priority);
      logDebug('할 일 추가 성공', newTodo);
      return newTodo;
    } catch (err) {
      logDebug('할 일 추가 실패', err);
      setError(err instanceof Error ? err : new Error('할 일 추가 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 할 일 업데이트
  const updateTodo = async (todoId, updates) => {
    logDebug('할 일 업데이트 요청', { todoId, updates });
    
    try {
      setError(null);
      const result = await updateTodoService(userId, todoId, updates);
      logDebug('할 일 업데이트 성공', result);
      return result;
    } catch (err) {
      logDebug('할 일 업데이트 실패', err);
      setError(err instanceof Error ? err : new Error('할 일 수정 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 할 일 삭제
  const deleteTodo = async (todoId) => {
    logDebug('할 일 삭제 요청', { todoId });
    
    try {
      setError(null);
      await deleteTodoService(userId, todoId);
      logDebug('할 일 삭제 성공', { todoId });
    } catch (err) {
      logDebug('할 일 삭제 실패', err);
      setError(err instanceof Error ? err : new Error('할 일 삭제 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 완료 상태 토글
  const toggleComplete = async (todoId, completed) => {
    logDebug('완료 상태 토글 요청', { todoId, completed });
    
    try {
      setError(null);
      await toggleTodoService(userId, todoId, completed);
      logDebug('완료 상태 토글 성공', { todoId, completed });
    } catch (err) {
      logDebug('완료 상태 토글 실패', err);
      setError(err instanceof Error ? err : new Error('할 일 완료 상태 변경 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 진행 중 상태 토글
  const toggleInProgress = async (todoId, inProgress) => {
    logDebug('진행 중 상태 토글 요청', { todoId, inProgress });
    
    try {
      setError(null);
      await toggleTodoInProgressService(userId, todoId, inProgress);
      logDebug('진행 중 상태 토글 성공', { todoId, inProgress });
    } catch (err) {
      logDebug('진행 중 상태 토글 실패', err);
      setError(err instanceof Error ? err : new Error('할 일 진행 상태 변경 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 우선순위 변경
  const changePriority = async (todoId, priority) => {
    logDebug('우선순위 변경 요청', { todoId, priority });
    
    try {
      setError(null);
      await changePriorityService(userId, todoId, priority);
      logDebug('우선순위 변경 성공', { todoId, priority });
    } catch (err) {
      logDebug('우선순위 변경 실패', err);
      setError(err instanceof Error ? err : new Error('우선순위 변경 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    toggleInProgress,
    changePriority
  };
}; 