import { useState, useEffect } from 'react';
import { 
  getTodos, 
  addTodo as addTodoService, 
  updateTodo as updateTodoService,
  deleteTodo as deleteTodoService,
  toggleTodoComplete as toggleTodoService,
  toggleTodoInProgress as toggleTodoInProgressService,
  changeTodoPriority as changePriorityService
} from '../services/localStorageService';
import { Todo, Priority } from '../types';

interface UseTodosOptions {
  userId: string;
}

interface UseTodosResult {
  todos: Todo[];
  loading: boolean;
  error: Error | null;
  addTodo: (title: string, description?: string, priority?: number) => Promise<void>;
  updateTodo: (todoId: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
  toggleComplete: (todoId: string, completed: boolean) => Promise<void>;
  toggleInProgress: (todoId: string, inProgress: boolean) => Promise<void>;
  changePriority: (todoId: string, priority: number) => Promise<void>;
}

export const useTodos = ({ userId }: UseTodosOptions): UseTodosResult => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setTodos([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const unsubscribe = getTodos(userId, (newTodos) => {
      setTodos(newTodos);
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe();
    };
  }, [userId]);

  // 할 일 추가
  const addTodo = async (title: string, description?: string, priority: number = Priority.Medium) => {
    try {
      setError(null);
      await addTodoService(userId, title, description, priority);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 추가 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 할 일 업데이트
  const updateTodo = async (todoId: string, updates: Partial<Todo>) => {
    try {
      setError(null);
      await updateTodoService(userId, todoId, updates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 수정 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 할 일 삭제
  const deleteTodo = async (todoId: string) => {
    try {
      setError(null);
      await deleteTodoService(userId, todoId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 삭제 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 완료 상태 토글
  const toggleComplete = async (todoId: string, completed: boolean) => {
    try {
      setError(null);
      await toggleTodoService(userId, todoId, completed);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 완료 상태 변경 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 진행 중 상태 토글
  const toggleInProgress = async (todoId: string, inProgress: boolean) => {
    try {
      setError(null);
      await toggleTodoInProgressService(userId, todoId, inProgress);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 진행 상태 변경 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 우선순위 변경
  const changePriority = async (todoId: string, priority: number) => {
    try {
      setError(null);
      await changePriorityService(userId, todoId, priority);
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