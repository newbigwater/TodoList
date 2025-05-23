import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Priority 열거형을 JavaScript 객체로 정의
const Priority = {
  High: 1,
  Medium: 2,
  Low: 3
};

// 로컬 스토리지에서 할 일 목록 가져오기
const getLocalTodos = (userId) => {
  const localTodos = localStorage.getItem(`todos_${userId}`);
  return localTodos ? JSON.parse(localTodos) : [];
};

// 로컬 스토리지에 할 일 목록 저장
const saveLocalTodos = (userId, todos) => {
  localStorage.setItem(`todos_${userId}`, JSON.stringify(todos));
};

export const useTodos = ({ userId }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 할 일 목록 로드
  useEffect(() => {
    if (!userId) {
      setTodos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const localTodos = getLocalTodos(userId);
      setTodos(localTodos);
      setLoading(false);
    } catch (err) {
      setError(new Error('할 일 목록을 불러오는 중 오류가 발생했습니다.'));
      setLoading(false);
    }
  }, [userId]);

  // 할 일 추가
  const addTodo = async (title, description = '', priority = Priority.Medium) => {
    try {
      setError(null);
      
      // 중복 체크
      const isDuplicate = todos.some(todo => todo.title === title);
      if (isDuplicate) {
        throw new Error('동일한 제목의 할 일이 이미 존재합니다.');
      }
      
      const timestamp = Date.now();
      const newTodo = {
        id: uuidv4(),
        title,
        description,
        completed: false,
        inProgress: false,
        priority,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // 새 할 일 추가
      const updatedTodos = [...todos, newTodo];
      
      // 우선순위 및 생성일 기준 정렬
      updatedTodos.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return b.createdAt - a.createdAt;
      });
      
      setTodos(updatedTodos);
      saveLocalTodos(userId, updatedTodos);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 추가 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 할 일 업데이트
  const updateTodo = async (todoId, updates) => {
    try {
      setError(null);
      
      // 제목 변경시 중복 체크
      if (updates.title) {
        const isDuplicate = todos.some(
          todo => todo.id !== todoId && todo.title === updates.title
        );
        
        if (isDuplicate) {
          throw new Error('동일한 제목의 할 일이 이미 존재합니다.');
        }
      }
      
      // 업데이트할 할 일 찾기
      const todoToUpdate = todos.find(todo => todo.id === todoId);
      if (!todoToUpdate) {
        throw new Error('존재하지 않는 할 일입니다.');
      }
      
      // 상태 변경 로직 처리
      let updatedFields = { ...updates };
      
      // completed가 true로 변경되면 inProgress는 false로 설정
      if (updates.completed === true) {
        updatedFields.inProgress = false;
      }
      
      // inProgress가 true로 변경되면 completed는 false로 설정
      if (updates.inProgress === true) {
        updatedFields.completed = false;
      }
      
      const updatedTodo = {
        ...todoToUpdate,
        ...updatedFields,
        updatedAt: Date.now()
      };
      
      // 업데이트된 할 일 목록 생성
      const updatedTodos = todos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      );
      
      // 우선순위 및 생성일 기준 정렬
      updatedTodos.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return b.createdAt - a.createdAt;
      });
      
      setTodos(updatedTodos);
      saveLocalTodos(userId, updatedTodos);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 수정 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 할 일 삭제
  const deleteTodo = async (todoId) => {
    try {
      setError(null);
      
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      setTodos(updatedTodos);
      saveLocalTodos(userId, updatedTodos);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 삭제 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 완료 상태 토글
  const toggleComplete = async (todoId, completed) => {
    try {
      setError(null);
      // 완료 상태로 변경 시 진행 중 상태는 false로 설정
      if (completed) {
        await updateTodo(todoId, { completed, inProgress: false });
      } else {
        await updateTodo(todoId, { completed });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 완료 상태 변경 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 진행 중 상태 토글
  const toggleInProgress = async (todoId, inProgress) => {
    try {
      setError(null);
      // 진행 중 상태로 변경 시 완료 상태는 false로 설정
      if (inProgress) {
        await updateTodo(todoId, { inProgress, completed: false });
      } else {
        await updateTodo(todoId, { inProgress });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 진행 상태 변경 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 우선순위 변경
  const changePriority = async (todoId, priority) => {
    try {
      setError(null);
      await updateTodo(todoId, { priority });
    } catch (err) {
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