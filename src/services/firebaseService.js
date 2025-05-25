import { ref, set, update, remove, onValue } from 'firebase/database';
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
export const addTodo = async (userId, title, description = '', priority = 2) => {
  const todoId = uuidv4();
  const timestamp = Date.now();
  
  const newTodo = {
    id: todoId,
    title,
    description,
    completed: false,
    inProgress: false,
    priority,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Firebase에 할 일 추가
  await set(ref(database, `todos/${userId}/${todoId}`), newTodo);
  return newTodo;
};

// 할 일 수정
export const updateTodo = async (userId, todoId, updates) => {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  
  const updatedData = {
    ...updates,
    updatedAt: Date.now()
  };
  
  await update(todoRef, updatedData);
  return updatedData;
};

// 할 일 삭제
export const deleteTodo = async (userId, todoId) => {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  await remove(todoRef);
};

// 할 일 완료 상태 토글
export const toggleTodoComplete = async (userId, todoId, completed) => {
  // 완료 상태로 변경 시 진행 중 상태는 false로 설정
  if (completed) {
    await updateTodo(userId, todoId, { completed, inProgress: false });
  } else {
    await updateTodo(userId, todoId, { completed });
  }
};

// 진행 중 상태 토글
export const toggleTodoInProgress = async (userId, todoId, inProgress) => {
  // 진행 중 상태로 변경 시 완료 상태는 false로 설정
  if (inProgress) {
    await updateTodo(userId, todoId, { inProgress, completed: false });
  } else {
    await updateTodo(userId, todoId, { inProgress });
  }
};

// 우선순위 변경
export const changeTodoPriority = async (userId, todoId, priority) => {
  await updateTodo(userId, todoId, { priority });
}; 