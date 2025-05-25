import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  onSnapshot,
  collectionGroup,
  where,
  limit
} from 'firebase/firestore';
import { firestore } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// 사용자의 모든 할 일 목록 가져오기 (실시간 구독)
export const getTodos = (userId, callback) => {
  console.log(`getTodos 호출됨 - userId: ${userId}`);
  
  try {
    // 경로 구조 단순화: 'todos' 컬렉션에서 userId 필드로 필터링
    const todosRef = collection(firestore, 'todos');
    console.log(`Firestore 컬렉션 경로: todos (userId 필드로 필터링)`);
    
    // 단순화된 쿼리: userId로만 필터링 (인덱스 문제 해결)
    const q = query(
      todosRef, 
      where('userId', '==', userId)
    );
    
    console.log('Firestore 쿼리 생성 완료, onSnapshot 설정 중...');
    
    // onSnapshot을 사용하여 실시간으로 데이터 변경 감지
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`Snapshot 받음 - 문서 수: ${snapshot.size}`);
      const todoList = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`문서 ID: ${doc.id}, 제목: ${data.title}`);
        todoList.push({ id: doc.id, ...data });
      });
      
      // 클라이언트 측에서 정렬 (Firestore 인덱스 없이도 작동)
      todoList.sort((a, b) => {
        // 우선순위로 정렬 (오름차순)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // 생성일로 정렬 (내림차순)
        return b.createdAt - a.createdAt;
      });
      
      console.log('Firestore에서 가져온 할일 목록:', todoList);
      callback(todoList);
    }, (error) => {
      console.error("Firestore 실시간 업데이트 오류:", error);
      // 오류 발생 시 빈 배열 반환
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("getTodos 실행 중 오류 발생:", error);
    callback([]);
    return () => {}; // 더미 해제 함수
  }
};

// 테스트 데이터 확인용 함수 (디버깅 목적)
export const checkExistingData = async (userId) => {
  try {
    const todosRef = collection(firestore, 'todos');
    const q = query(todosRef, where('userId', '==', userId), limit(5));
    const snapshot = await getDocs(q);
    
    console.log(`사용자 ${userId}의 기존 데이터 확인 - 문서 수: ${snapshot.size}`);
    
    snapshot.forEach((doc) => {
      console.log(`문서 ID: ${doc.id}, 데이터:`, doc.data());
    });
    
    return snapshot.size;
  } catch (error) {
    console.error("기존 데이터 확인 중 오류:", error);
    return 0;
  }
};

// 할 일 추가
export const addTodo = async (userId, title, description = '', priority = 2) => {
  console.log(`addTodo 호출됨 - userId: ${userId}, title: ${title}`);
  
  // 기존 데이터 확인 (디버깅용)
  await checkExistingData(userId);
  
  const todoId = uuidv4();
  const timestamp = Date.now();
  
  const newTodo = {
    id: todoId,
    userId, // userId 필드 추가
    title,
    description,
    completed: false,
    inProgress: false,
    priority,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Firestore에 할 일 추가
  try {
    // 경로 단순화: 'todos' 컬렉션에 직접 추가
    const todosCollection = collection(firestore, 'todos');
    console.log(`문서 추가 경로: todos/${todoId}`, newTodo);
    
    await setDoc(doc(todosCollection, todoId), newTodo);
    console.log('Firestore에 새 할일 추가됨:', newTodo);
    
    // 추가 후 데이터 확인 (디버깅용)
    setTimeout(() => checkExistingData(userId), 1000);
    
    return newTodo;
  } catch (error) {
    console.error("Firestore 데이터 추가 오류:", error);
    throw error;
  }
};

// 할 일 수정
export const updateTodo = async (userId, todoId, updates) => {
  console.log(`updateTodo 호출됨 - userId: ${userId}, todoId: ${todoId}`);
  try {
    // 경로 단순화
    const todoDoc = doc(firestore, 'todos', todoId);
    console.log(`문서 업데이트 경로: todos/${todoId}`);
    
    const updatedData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(todoDoc, updatedData);
    console.log('Firestore 할일 업데이트됨:', todoId, updatedData);
    return updatedData;
  } catch (error) {
    console.error("Firestore 데이터 업데이트 오류:", error);
    throw error;
  }
};

// 할 일 삭제
export const deleteTodo = async (userId, todoId) => {
  console.log(`deleteTodo 호출됨 - userId: ${userId}, todoId: ${todoId}`);
  try {
    // 경로 단순화
    const todoDoc = doc(firestore, 'todos', todoId);
    console.log(`문서 삭제 경로: todos/${todoId}`);
    
    await deleteDoc(todoDoc);
    console.log('Firestore 할일 삭제됨:', todoId);
  } catch (error) {
    console.error("Firestore 데이터 삭제 오류:", error);
    throw error;
  }
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