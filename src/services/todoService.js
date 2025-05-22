import { ref, set, update, remove, get, onValue, query, orderByChild } from 'firebase/database';
import { database } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// 사용자의 모든 할 일 목록 가져오기 (실시간 구독)
export const getTodos = (userId, callback) => {
  const todosRef = ref(database, `todos/${userId}`);
  
  // onValue를 사용하여 실시간으로 데이터 변경 감지
  const unsubscribe = onValue(todosRef, (snapshot) => {
    const data = snapshot.val() || {};
    const todoList = Object.values(data);
    
    // 생성일 순으로 정렬
    todoList.sort((a, b) => {
      // 우선순위 기준 정렬 (낮은 값이 높은 우선순위)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // 우선순위가 같으면 생성일 기준 정렬 (최신순)
      return b.createdAt - a.createdAt;
    });
    
    callback(todoList);
  });
  
  // 구독 해제 함수 반환
  return unsubscribe;
};

// 할 일 추가
export const addTodo = async (userId, title, priority = 2) => {
  // 중복 확인 (동일한 제목의 할 일이 있는지 확인)
  const todosRef = ref(database, `todos/${userId}`);
  const snapshot = await get(todosRef);
  const todos = snapshot.val() || {};
  
  // 중복 체크
  const isDuplicate = Object.values(todos).some((todo) => todo.title === title);
  if (isDuplicate) {
    throw new Error('동일한 제목의 할 일이 이미 존재합니다.');
  }
  
  const todoId = uuidv4();
  const timestamp = Date.now();
  
  const newTodo = {
    id: todoId,
    title,
    completed: false,
    priority,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // 데이터베이스에 할 일 추가
  await set(ref(database, `todos/${userId}/${todoId}`), newTodo);
  return newTodo;
};

// 할 일 수정
export const updateTodo = async (userId, todoId, updates) => {
  // 중복 체크 (제목이 변경된 경우에만)
  if (updates.title) {
    const todosRef = ref(database, `todos/${userId}`);
    const snapshot = await get(todosRef);
    const todos = snapshot.val() || {};
    
    const isDuplicate = Object.values(todos).some(
      (todo) => todo.id !== todoId && todo.title === updates.title
    );
    
    if (isDuplicate) {
      throw new Error('동일한 제목의 할 일이 이미 존재합니다.');
    }
  }
  
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  
  // 현재 데이터 가져오기
  const snapshot = await get(todoRef);
  if (!snapshot.exists()) {
    throw new Error('존재하지 않는 할 일입니다.');
  }
  
  const currentTodo = snapshot.val();
  
  const updatedData = {
    ...updates,
    updatedAt: Date.now()
  };
  
  // 데이터베이스 업데이트
  await update(todoRef, updatedData);
  
  // 업데이트된 전체 할 일 객체 반환
  return {
    ...currentTodo,
    ...updatedData
  };
};

// 할 일 삭제
export const deleteTodo = async (userId, todoId) => {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  await remove(todoRef);
};

// 할 일 완료 상태 토글
export const toggleTodoComplete = async (userId, todoId, completed) => {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  
  await update(todoRef, {
    completed,
    updatedAt: Date.now()
  });
};

// 우선순위 변경
export const changeTodoPriority = async (userId, todoId, priority) => {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  
  await update(todoRef, {
    priority,
    updatedAt: Date.now()
  });
}; 