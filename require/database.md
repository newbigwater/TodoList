# Database Structure (데이터베이스 구조)

본 프로젝트는 Firebase Firestore를 사용하여 데이터를 저장하고 관리합니다. Firestore는 NoSQL 문서 기반 데이터베이스로, 실시간 데이터 동기화를 지원합니다.

## Firestore 데이터 구조

Firestore 데이터베이스는 다음과 같은 구조로 설계됩니다:

```
todos (컬렉션)
|
└── 문서들 (각 할일 항목)
    ├── id: 문자열 (할일의 고유 ID)
    ├── userId: 문자열 (사용자 ID)
    ├── title: 문자열 (할일 제목)
    ├── description: 문자열 (할일 설명, 선택사항)
    ├── completed: 불리언 (완료 여부)
    ├── inProgress: 불리언 (진행 중 여부)
    ├── priority: 숫자 (우선순위, 1: 높음, 2: 중간, 3: 낮음)
    ├── createdAt: 숫자 (생성 시간, 타임스탬프)
    └── updatedAt: 숫자 (수정 시간, 타임스탬프)
```

## 데이터 구조 설명

1. **todos**: 모든 할 일 항목을 저장하는 최상위 컬렉션
   - 각 할 일 항목은 고유한 문서 ID를 가진 개별 문서로 저장됩니다.
   - 문서 ID는 UUID로 생성됩니다.
   - 각 문서는 다음 필드를 포함합니다:
     - **id**: 할 일의 고유 ID (문서 ID와 동일)
     - **userId**: 사용자 ID (데이터 필터링용)
     - **title**: 할 일 내용
     - **description**: 할 일에 대한 상세 설명 (선택 사항)
     - **completed**: 완료 여부 (boolean)
     - **inProgress**: 진행 중 여부 (boolean)
     - **priority**: 우선순위 (1: 높음, 2: 중간, 3: 낮음)
     - **createdAt**: 생성 시간 (타임스탬프)
     - **updatedAt**: 마지막 수정 시간 (타임스탬프)

# How to use (사용 방법)

## Firebase 설정 및 초기화

1. **Firebase 프로젝트 생성**
   - [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
   - 웹 앱 추가하기 (앱 등록)

2. **필요한 패키지 설치**
   ```bash
   npm install firebase uuid react-beautiful-dnd @types/react-beautiful-dnd
   ```

3. **Firebase 초기화 설정 (src/services/firebase.js)**
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
   import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
   import { getAuth, connectAuthEmulator } from 'firebase/auth';
   import { firebaseConfig } from '../environment';

   // Firebase 초기화 전에 설정 정보 디버깅
   console.log('Firebase 설정 정보:', {
     ...firebaseConfig,
     apiKey: '**키 숨김**',  // API 키는 보안을 위해 숨김
     databaseURL: firebaseConfig.databaseURL || '설정되지 않음'
   });

   // Firebase 초기화 (기본값)
   let app;
   let auth;
   let database;
   let firestore;
   let firebaseInitialized = false;

   try {
     // Firebase 앱 초기화
     app = initializeApp(firebaseConfig);
     firebaseInitialized = true;
     console.log('Firebase 앱 초기화 성공');

     // 인증 서비스 초기화
     auth = getAuth(app);
     console.log('Firebase 인증 서비스 초기화 성공');

     // Realtime Database 초기화 시도 (선택 사항)
     try {
       database = getDatabase(app);
       console.log('Realtime Database 초기화 성공');
     } catch (dbError) {
       console.warn('Realtime Database 초기화 실패:', dbError);
       database = null;  // 초기화 실패 시 null로 설정
     }
     
     // Firestore 초기화
     firestore = getFirestore(app);
     console.log('Firestore 초기화 성공');
     
     // 오프라인 지속성 활성화
     try {
       enableIndexedDbPersistence(firestore)
         .then(() => {
           console.log('Firestore 오프라인 지속성 활성화 성공');
         })
         .catch((err) => {
           console.warn('Firestore 오프라인 지속성 활성화 실패:', err);
         });
     } catch (persistenceError) {
       console.warn('Firestore 오프라인 지속성 설정 오류:', persistenceError);
     }
   } catch (error) {
     console.error('Firebase 초기화 중 오류 발생:', error);
     
     // 오류 시 더미 객체 생성
     if (!app) app = {};
     if (!auth) auth = {};
     if (!database) database = {};
     if (!firestore) firestore = {};
     firebaseInitialized = false;
   }

   // Firebase 서비스 내보내기
   export { auth, database, firestore };
   export default app;
   ```

4. **환경 설정 파일 (src/environment.js)**
   ```javascript
   // Firebase 환경 설정
   export const firebaseConfig = {
     apiKey: "AIzaSyCHCSLa1HZqTlAeGQ6HboX-cKvIjJkmqxA",
     authDomain: "todolist-60050.firebaseapp.com",
     projectId: "todolist-60050",
     storageBucket: "todolist-60050.firebasestorage.app",
     messagingSenderId: "964544188277",
     appId: "1:964544188277:web:7b956fabb0538211fd0d3c"
   };
   ```

## Firestore CRUD 작업

### Todo 항목 가져오기 (실시간 구독)
```javascript
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { firestore } from './firebase';

export const getTodos = (userId, callback) => {
  try {
    // 'todos' 컬렉션에서 특정 userId를 가진 문서들을 조회
    const todosRef = collection(firestore, 'todos');
    const q = query(todosRef, where('userId', '==', userId));
    
    // 실시간 리스너 설정
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todoList = [];
      
      snapshot.forEach((doc) => {
        todoList.push({ id: doc.id, ...doc.data() });
      });
      
      // 클라이언트 측에서 정렬
      todoList.sort((a, b) => {
        // 우선순위로 정렬 (오름차순)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // 생성일로 정렬 (내림차순)
        return b.createdAt - a.createdAt;
      });
      
      callback(todoList);
    }, (error) => {
      console.error("Firestore 실시간 업데이트 오류:", error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("getTodos 실행 중 오류 발생:", error);
    callback([]);
    return () => {}; // 더미 해제 함수
  }
};
```

### Todo 항목 추가
```javascript
import { collection, doc, setDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export const addTodo = async (userId, title, description = '', priority = 2) => {
  const todoId = uuidv4();
  const timestamp = Date.now();
  
  const newTodo = {
    id: todoId,
    userId,
    title,
    description,
    completed: false,
    inProgress: false,
    priority,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  try {
    const todosCollection = collection(firestore, 'todos');
    await setDoc(doc(todosCollection, todoId), newTodo);
    return newTodo;
  } catch (error) {
    console.error("Firestore 데이터 추가 오류:", error);
    throw error;
  }
};
```

### Todo 항목 수정
```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from './firebase';

export const updateTodo = async (userId, todoId, updates) => {
  try {
    const todoDoc = doc(firestore, 'todos', todoId);
    
    const updatedData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(todoDoc, updatedData);
    return updatedData;
  } catch (error) {
    console.error("Firestore 데이터 업데이트 오류:", error);
    throw error;
  }
};
```

### Todo 항목 삭제
```javascript
import { doc, deleteDoc } from 'firebase/firestore';
import { firestore } from './firebase';

export const deleteTodo = async (userId, todoId) => {
  try {
    const todoDoc = doc(firestore, 'todos', todoId);
    await deleteDoc(todoDoc);
  } catch (error) {
    console.error("Firestore 데이터 삭제 오류:", error);
    throw error;
  }
};
```

### Todo 항목 완료 상태 토글
```javascript
export const toggleTodoComplete = async (userId, todoId, completed) => {
  // 완료 상태로 변경 시 진행 중 상태는 false로 설정
  if (completed) {
    await updateTodo(userId, todoId, { completed, inProgress: false });
  } else {
    await updateTodo(userId, todoId, { completed });
  }
};
```

### Todo 항목 진행 중 상태 토글
```javascript
export const toggleTodoInProgress = async (userId, todoId, inProgress) => {
  // 진행 중 상태로 변경 시 완료 상태는 false로 설정
  if (inProgress) {
    await updateTodo(userId, todoId, { inProgress, completed: false });
  } else {
    await updateTodo(userId, todoId, { inProgress });
  }
};
```

### 우선순위 변경
```javascript
export const changeTodoPriority = async (userId, todoId, priority) => {
  await updateTodo(userId, todoId, { priority });
};
```

## React Hook을 통한 데이터 관리

```javascript
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

export const useTodos = ({ userId }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firestore에서 실시간으로 할 일 목록 구독
  useEffect(() => {
    if (!userId) {
      setTodos([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    
    try {
      const unsubscribe = getTodos(userId, (newTodos) => {
        setTodos(newTodos);
        setLoading(false);
      });

      // 컴포넌트 언마운트 시 구독 해제
      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err);
      setLoading(false);
      return () => {};
    }
  }, [userId]);

  // CRUD 기능 구현
  const addTodo = async (title, description = '', priority = 2) => {
    try {
      setError(null);
      const newTodo = await addTodoService(userId, title, description, priority);
      return newTodo;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 추가 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  const updateTodo = async (todoId, updates) => {
    try {
      setError(null);
      const result = await updateTodoService(userId, todoId, updates);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 수정 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      setError(null);
      await deleteTodoService(userId, todoId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 삭제 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  const toggleComplete = async (todoId, completed) => {
    try {
      setError(null);
      await toggleTodoService(userId, todoId, completed);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 완료 상태 변경 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  const toggleInProgress = async (todoId, inProgress) => {
    try {
      setError(null);
      await toggleTodoInProgressService(userId, todoId, inProgress);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('할 일 진행 상태 변경 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  const changePriority = async (todoId, priority) => {
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
```

# Rule (규칙)

## Firestore 보안 규칙

Firestore에 다음과 같은 보안 규칙을 설정하여 데이터 접근을 제어합니다:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 할 일 컬렉션 규칙
    match /todos/{todoId} {
      // 인증된 사용자만 자신의 할 일에 접근 가능
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && 
                    (resource == null || resource.data.userId == request.auth.uid) && 
                    request.resource.data.userId == request.auth.uid;
    }
    
    // 사용자 컬렉션 규칙
    match /users/{userId} {
      // 인증된 사용자만 자신의 정보에 접근 가능
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 개발 규칙 및 주의사항

1. **중복 데이터 검사**:
   - 새 할 일 추가 시 동일한 제목의 할 일이 있는지 확인하고 중복 방지
   - 항목 수정 시 다른 항목과 중복되지 않는지 확인

2. **데이터 유효성 검사**:
   - 할 일 제목은 빈 문자열이 아니어야 함
   - 우선순위는 1-3 범위 내의 숫자여야 함
   - 완료 상태는 boolean 타입이어야 함
   - 진행 중 상태는 boolean 타입이어야 함

3. **데이터 정합성**:
   - 모든 변경사항은 updatedAt 필드를 현재 타임스탬프로 업데이트
   - id 필드는 항상 고유해야 함 (UUID 사용)
   - 완료 상태와 진행 중 상태가 충돌하지 않도록 관리
   - 완료된 항목은 진행 중 상태가 될 수 없음
   - 진행 중인 항목은 완료 상태가 될 수 없음

4. **오프라인 지원**:
   - Firestore 오프라인 지속성 활성화를 통해 오프라인 환경에서도 앱이 동작하도록 설정
   ```javascript
   import { enableIndexedDbPersistence } from 'firebase/firestore';
   
   enableIndexedDbPersistence(firestore)
     .then(() => {
       console.log('Firestore 오프라인 지속성 활성화 성공');
     })
     .catch((err) => {
       console.warn('Firestore 오프라인 지속성 활성화 실패:', err);
     });
   ```

5. **에러 처리**:
   - 모든 Firebase 작업은 try-catch로 감싸서 오류 처리
   - 네트워크 오류나 권한 오류 발생 시 사용자에게 적절한 피드백 제공
   - 드래그 앤 드롭 상태 변경 시 오류가 발생하면 적절한 알림 표시

6. **Firestore 컬렉션 경로 규칙**:
   - Firestore 컬렉션 참조는 홀수 개의 세그먼트를 가져야 함
   - 잘못된 예: `todos/${userId}` (2개의 세그먼트)
   - 올바른 예: `todos` (1개의 세그먼트), `todos/${userId}/items` (3개의 세그먼트)

7. **복합 쿼리와 인덱스**:
   - Firestore에서 복합 쿼리(여러 필드로 정렬 또는 필터링)를 사용할 때는 인덱스 생성 필요
   - 복잡한 쿼리보다는 단순한 쿼리 + 클라이언트 측 추가 처리 방식이 유지 관리에 용이

## 문제 해결

### Firestore 컬렉션 참조 오류

"Invalid collection reference. Collection references must have an odd number of segments" 오류가 발생하는 경우:

1. **컬렉션 참조 경로 확인**
   - Firestore 컬렉션 참조는 홀수 개의 세그먼트를 가져야 합니다.
   - 잘못된 예: `todos/${userId}` (2개의 세그먼트)
   - 올바른 예: `todos` (1개의 세그먼트), `todos/${userId}/items` (3개의 세그먼트)

2. **해결 방법**
   - 방법 1: 최상위 컬렉션 + 필드 필터링
     ```javascript
     const todosRef = collection(firestore, 'todos');
     const q = query(todosRef, where('userId', '==', userId));
     ```
   
   - 방법 2: 하위 컬렉션 사용
     ```javascript
     const todosRef = collection(firestore, 'users', userId, 'todos');
     ```

### Firestore 인덱스 오류

"The query requires an index" 오류가 발생하는 경우:

1. **Firebase 콘솔에서 인덱스 생성**
   - 오류 메시지의 링크를 클릭하여 Firebase 콘솔에서 인덱스 생성
   - 또는 직접 Firebase 콘솔 > Firestore Database > 인덱스 탭에서 복합 인덱스 생성

2. **대안적 해결 방법**
   - 단순 쿼리 + 클라이언트 측 정렬 사용
     ```javascript
     // 단순 쿼리
     const q = query(todosRef, where('userId', '==', userId));
     
     // 클라이언트 측 정렬
     const sortedTodos = todos.sort((a, b) => {
       if (a.priority !== b.priority) {
         return a.priority - b.priority;
       }
       return b.createdAt - a.createdAt;
     });
     ```

### 인증 및 보안 문제

1. **개발 중 임시 보안 규칙**
   ```
   // 주의: 개발 환경에서만 사용할 것
   match /{document=**} {
     allow read, write: if true;
   }
   ```

2. **프로덕션용 보안 규칙**
   ```
   match /todos/{todoId} {
     allow read: if request.auth != null && resource.data.userId == request.auth.uid;
     allow write: if request.auth != null && 
                   (resource == null || resource.data.userId == request.auth.uid) && 
                   request.resource.data.userId == request.auth.uid;
   }
   ```

3. **규칙 배포 방법**
   ```bash
   firebase deploy --only firestore:rules
   ```
