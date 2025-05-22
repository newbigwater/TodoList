import { v4 as uuidv4 } from 'uuid';
import { Todo, Priority } from '../types';

// 로컬 스토리지 키
const TODOS_STORAGE_KEY = 'todos';

// 사용자별 할일 목록 키 생성
const getUserTodosKey = (userId: string): string => {
  return `${TODOS_STORAGE_KEY}_${userId}`;
};

// 사용자의 모든 할 일 목록 가져오기
export const getTodos = (userId: string, callback: (todos: Todo[]) => void) => {
  const loadAndNotify = () => {
    const todosKey = getUserTodosKey(userId);
    const todosJson = localStorage.getItem(todosKey) || '{}';
    const todos = JSON.parse(todosJson);
    
    // 객체를 배열로 변환
    const todoList: Todo[] = Object.values(todos);
    
    // 우선순위 기준 정렬 (낮은 값이 높은 우선순위)
    todoList.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // 우선순위가 같으면 생성일 기준 정렬 (최신순)
      return b.createdAt - a.createdAt;
    });
    
    callback(todoList);
  };

  // 초기 데이터 로드
  loadAndNotify();
  
  // storage 이벤트 리스너 등록
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === getUserTodosKey(userId)) {
      loadAndNotify();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // 구독 해제 함수 반환
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

// 할 일 추가
export const addTodo = async (userId: string, title: string, description?: string, priority: number = Priority.Medium): Promise<Todo> => {
  const todosKey = getUserTodosKey(userId);
  const todosJson = localStorage.getItem(todosKey) || '{}';
  const todos = JSON.parse(todosJson);
  
  // 중복 체크
  const isDuplicate = Object.values(todos).some((todo: any) => todo.title === title);
  if (isDuplicate) {
    throw new Error('동일한 제목의 할 일이 이미 존재합니다.');
  }
  
  const todoId = uuidv4();
  const timestamp = Date.now();
  
  const newTodo: Todo = {
    id: todoId,
    title,
    description: description || '',
    completed: false,
    inProgress: false,
    priority,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // 로컬 스토리지에 할 일 추가
  todos[todoId] = newTodo;
  localStorage.setItem(todosKey, JSON.stringify(todos));
  
  // storage 이벤트 수동 발생 (같은 탭에서는 storage 이벤트가 발생하지 않음)
  window.dispatchEvent(new StorageEvent('storage', {
    key: todosKey,
    newValue: JSON.stringify(todos)
  }));
  
  return newTodo;
};

// 할 일 수정
export const updateTodo = async (userId: string, todoId: string, updates: Partial<Todo>): Promise<Todo> => {
  const todosKey = getUserTodosKey(userId);
  const todosJson = localStorage.getItem(todosKey) || '{}';
  const todos = JSON.parse(todosJson);
  
  // 존재 여부 확인
  if (!todos[todoId]) {
    throw new Error('존재하지 않는 할 일입니다.');
  }
  
  // 중복 체크 (제목이 변경된 경우에만)
  if (updates.title) {
    const isDuplicate = Object.values(todos).some(
      (todo: any) => todo.id !== todoId && todo.title === updates.title
    );
    
    if (isDuplicate) {
      throw new Error('동일한 제목의 할 일이 이미 존재합니다.');
    }
  }
  
  const currentTodo = todos[todoId];
  
  const updatedTodo = {
    ...currentTodo,
    ...updates,
    updatedAt: Date.now()
  };
  
  // 로컬 스토리지 업데이트
  todos[todoId] = updatedTodo;
  localStorage.setItem(todosKey, JSON.stringify(todos));
  
  // storage 이벤트 수동 발생
  window.dispatchEvent(new StorageEvent('storage', {
    key: todosKey,
    newValue: JSON.stringify(todos)
  }));
  
  return updatedTodo;
};

// 할 일 삭제
export const deleteTodo = async (userId: string, todoId: string): Promise<void> => {
  const todosKey = getUserTodosKey(userId);
  const todosJson = localStorage.getItem(todosKey) || '{}';
  const todos = JSON.parse(todosJson);
  
  // 존재 여부 확인
  if (!todos[todoId]) {
    throw new Error('존재하지 않는 할 일입니다.');
  }
  
  // 항목 삭제
  delete todos[todoId];
  localStorage.setItem(todosKey, JSON.stringify(todos));
  
  // storage 이벤트 수동 발생
  window.dispatchEvent(new StorageEvent('storage', {
    key: todosKey,
    newValue: JSON.stringify(todos)
  }));
};

// 할 일 완료 상태 토글
export const toggleTodoComplete = async (
  userId: string, 
  todoId: string, 
  completed: boolean
): Promise<void> => {
  await updateTodo(userId, todoId, { completed });
};

// 진행 중 상태 토글
export const toggleTodoInProgress = async (
  userId: string,
  todoId: string,
  inProgress: boolean
): Promise<void> => {
  await updateTodo(userId, todoId, { inProgress });
};

// 우선순위 변경
export const changeTodoPriority = async (
  userId: string,
  todoId: string,
  priority: number
): Promise<void> => {
  await updateTodo(userId, todoId, { priority });
}; 