# Database Structure (데이터베이스 구조)

Firebase Realtime Database는 다음과 같은 구조로 설계됩니다:

```json
{
  "todos": {
    "userId1": {
      "todoId1": {
        "id": "todoId1",
        "title": "할 일 제목",
        "description": "할 일에 대한 상세 설명입니다.",
        "completed": false,
        "inProgress": false,
        "priority": 2,
        "createdAt": 1683256247123,
        "updatedAt": 1683256247123
      },
      "todoId2": {
        "id": "todoId2",
        "title": "두 번째 할 일",
        "description": "중요한 업무입니다.",
        "completed": true,
        "inProgress": false,
        "priority": 1,
        "createdAt": 1683257247123,
        "updatedAt": 1683259247123
      }
    },
    "userId2": {
      // 다른 사용자의 할 일 목록
    }
  },
  "users": {
    "userId1": {
      "name": "사용자 이름",
      "email": "user@example.com",
      "createdAt": 1683256247123
    },
    "userId2": {
      // 다른 사용자 정보
    }
  }
}
```

## 데이터 구조 설명

1. **todos**: 모든 사용자의 할 일 목록을 저장
   - **userId**: 각 사용자별 할 일을 구분하는 키
     - **todoId**: UUID로 생성된 할 일의 고유 ID
       - **id**: 할 일의 고유 ID (todoId와 동일)
       - **title**: 할 일 내용
       - **description**: 할 일에 대한 상세 설명 (선택 사항)
       - **completed**: 완료 여부 (boolean)
       - **inProgress**: 진행 중 여부 (boolean)
       - **priority**: 우선순위 (1: 높음, 2: 중간, 3: 낮음)
       - **createdAt**: 생성 시간 (타임스탬프)
       - **updatedAt**: 마지막 수정 시간 (타임스탬프)

2. **users**: 사용자 정보 저장
   - **userId**: Firebase Authentication에서 생성된 사용자 ID
     - **name**: 사용자 이름
     - **email**: 사용자 이메일
     - **createdAt**: 계정 생성 시간 (타임스탬프)

# How to use (사용 방법)

## Firebase 설정 및 초기화

1. **Firebase 프로젝트 생성**
   - [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
   - 웹 앱 추가하기 (앱 등록)

2. **필요한 패키지 설치**
   ```bash
   npm install firebase uuid react-beautiful-dnd @types/react-beautiful-dnd
   ```

3. **Firebase 초기화 설정 (src/firebase.ts 파일 생성)**
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getDatabase } from 'firebase/database';
   import { getAuth } from 'firebase/auth';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const database = getDatabase(app);
   ```

## 데이터베이스 CRUD 작업

### Todo 항목 추가
```typescript
import { ref, push, set } from 'firebase/database';
import { database } from './firebase';
import { v4 as uuidv4 } from 'uuid';

const addTodo = async (userId: string, title: string, description?: string, priority: number = 2) => {
  const todoId = uuidv4();
  const timestamp = Date.now();
  
  const newTodo = {
    id: todoId,
    title,
    description: description || '',
    completed: false,
    inProgress: false,
    priority,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await set(ref(database, `todos/${userId}/${todoId}`), newTodo);
  return newTodo;
};
```

### Todo 항목 목록 가져오기
```typescript
import { ref, onValue } from 'firebase/database';
import { database } from './firebase';

const getTodos = (userId: string, callback: (todos: any[]) => void) => {
  const todosRef = ref(database, `todos/${userId}`);
  
  onValue(todosRef, (snapshot) => {
    const data = snapshot.val() || {};
    const todoList = Object.values(data);
    callback(todoList);
  });
};
```

### Todo 항목 수정
```typescript
import { ref, update } from 'firebase/database';
import { database } from './firebase';

const updateTodo = async (userId: string, todoId: string, updates: any) => {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  
  const updatedData = {
    ...updates,
    updatedAt: Date.now()
  };
  
  await update(todoRef, updatedData);
  return updatedData;
};
```

### Todo 항목 삭제
```typescript
import { ref, remove } from 'firebase/database';
import { database } from './firebase';

const deleteTodo = async (userId: string, todoId: string) => {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  await remove(todoRef);
};
```

### Todo 항목 완료 상태 토글
```typescript
import { ref, update } from 'firebase/database';
import { database } from './firebase';

const toggleTodoComplete = async (userId: string, todoId: string, completed: boolean) => {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  
  await update(todoRef, {
    completed,
    updatedAt: Date.now()
  });
};
```

### Todo 항목 진행 중 상태 토글
```typescript
import { ref, update } from 'firebase/database';
import { database } from './firebase';

const toggleTodoInProgress = async (userId: string, todoId: string, inProgress: boolean) => {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  
  await update(todoRef, {
    inProgress,
    updatedAt: Date.now()
  });
};
```

### 드래그 앤 드롭으로 할 일 상태 변경
```typescript
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { toggleTodoComplete, toggleTodoInProgress } from '../services/todoService';

// 칸반 보드 컴포넌트 내에서
const handleDragEnd = async (result: DropResult) => {
  const { destination, source, draggableId } = result;
  
  // 드롭 위치가 없거나, 원래 위치와 같은 경우 처리 중지
  if (!destination || 
      (destination.droppableId === source.droppableId && 
        destination.index === source.index)) {
    return;
  }
  
  const todoId = draggableId;
  
  try {
    // 목적지 컬럼에 따라 상태 변경
    if (destination.droppableId !== source.droppableId) {
      // 완료 상태로 변경
      if (destination.droppableId === 'completed') {
        // 진행 중 상태도 해제
        if (source.droppableId === 'inProgress') {
          await toggleTodoInProgress(userId, todoId, false);
        }
        await toggleTodoComplete(userId, todoId, true);
      } 
      // 할 일 -> 진행 중
      else if (source.droppableId === 'todo' && 
              destination.droppableId === 'inProgress') {
        await toggleTodoInProgress(userId, todoId, true);
      } 
      // 완료 -> 진행 중
      else if (source.droppableId === 'completed' && 
              destination.droppableId === 'inProgress') {
        await toggleTodoComplete(userId, todoId, false);
        await toggleTodoInProgress(userId, todoId, true);
      } 
      // 진행 중 -> 할 일
      else if (source.droppableId === 'inProgress' && 
              destination.droppableId === 'todo') {
        await toggleTodoInProgress(userId, todoId, false);
      }
      // 완료 -> 할 일
      else if (source.droppableId === 'completed' && 
              destination.droppableId === 'todo') {
        await toggleTodoComplete(userId, todoId, false);
      }
    }
  } catch (error) {
    console.error('할 일 상태 변경 중 오류가 발생했습니다:', error);
  }
};
```

# Rule (규칙)

## Firebase 보안 규칙

Firebase Realtime Database에 다음과 같은 보안 규칙을 설정하여 데이터 접근을 제어합니다:

```json
{
  "rules": {
    "todos": {
      "$userId": {
        // 인증된 사용자만 자신의 할 일에 접근 가능
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",
        
        "$todoId": {
          // 할 일 데이터 유효성 검사
          ".validate": "newData.hasChildren(['id', 'title', 'completed', 'inProgress', 'priority', 'createdAt', 'updatedAt'])",
          
          "id": {
            ".validate": "newData.isString() && newData.val() == $todoId"
          },
          "title": {
            ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 200"
          },
          "description": {
            ".validate": "newData.isString()"
          },
          "completed": {
            ".validate": "newData.isBoolean()"
          },
          "inProgress": {
            ".validate": "newData.isBoolean()"
          },
          "priority": {
            ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 3"
          },
          "createdAt": {
            ".validate": "newData.isNumber()"
          },
          "updatedAt": {
            ".validate": "newData.isNumber()"
          },
          
          // 정의되지 않은 필드는 허용하지 않음
          "$other": {
            ".validate": false
          }
        }
      }
    },
    "users": {
      "$userId": {
        // 인증된 사용자만 자신의 정보에 접근 가능
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",
        
        // 사용자 데이터 유효성 검사
        ".validate": "newData.hasChildren(['name', 'email', 'createdAt'])",
        
        "name": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "email": {
          ".validate": "newData.isString() && newData.val().matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/)"
        },
        "createdAt": {
          ".validate": "newData.isNumber()"
        },
        
        // 정의되지 않은 필드는 허용하지 않음
        "$other": {
          ".validate": false
        }
      }
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
   - 완료 상태와 진행 중 상태가 충돌하지 않도록 관리 (완료된 항목은 진행 중 상태가 아니어야 함)

4. **오프라인 지원**:
   - Firebase의 오프라인 지속성 활성화로 네트워크 연결이 불안정할 때도 앱 사용 가능
   ```typescript
   import { getDatabase, enablePersistence } from 'firebase/database';
   
   const database = getDatabase();
   enablePersistence(database).catch((error) => {
     console.error('오프라인 지속성 활성화 실패:', error);
   });
   ```

5. **에러 처리**:
   - 모든 Firebase 작업은 try-catch로 감싸서 오류 처리
   - 네트워크 오류나 권한 오류 발생 시 사용자에게 적절한 피드백 제공
   - 드래그 앤 드롭 상태 변경 시 오류가 발생하면 적절한 알림 표시

6. **드래그 앤 드롭 관련 규칙**:
   - 상태 변경은 항상 Firebase에 반영되어야 함
   - 드래그 중에는 시각적 피드백 제공
   - 상태 변경 시 사용자에게 알림 표시
   - 동시에 여러 상태 변경이 필요한 경우 (예: 완료→진행 중) 트랜잭션 처리
