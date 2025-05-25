# Firebase Realtime Database 설정 가이드

## Firebase 콘솔에서 Realtime Database 생성하기

1. **Firebase 콘솔에 로그인**
   - [Firebase 콘솔](https://console.firebase.google.com/)에 접속하여 Google 계정으로 로그인합니다.

2. **프로젝트 선택**
   - todolist-60050 프로젝트를 선택합니다.

3. **Realtime Database 생성**
   - 왼쪽 메뉴에서 "Realtime Database"를 클릭합니다.
   - "데이터베이스 만들기" 버튼을 클릭합니다.
   - 보안 규칙을 선택합니다. 초기 개발을 위해 "테스트 모드로 시작"을 선택할 수 있습니다.
   - 데이터베이스 위치를 선택합니다. 기본값으로 제공되는 위치를 선택하거나, 사용자의 지역에 가까운 위치를 선택할 수 있습니다.

4. **Realtime Database URL 확인**
   - 데이터베이스가 생성되면 대시보드에 데이터베이스 URL이 표시됩니다.
   - 이 URL을 복사하여 environment.js 파일의 databaseURL 값으로 사용합니다.

5. **environment.js 파일 업데이트**
   ```javascript
   // Firebase 환경 설정
   export const firebaseConfig = {
     apiKey: "",
     authDomain: "",
     projectId: "",
     storageBucket: "",
     messagingSenderId: "",
     appId: "",
     databaseURL: ""
   };
   ```

6. **보안 규칙 설정**
   - 데이터베이스 대시보드에서 "규칙" 탭을 클릭합니다.
   - database.rules.json 파일의 내용을 복사하여 붙여넣습니다.
   - "게시" 버튼을 클릭하여 규칙을 저장합니다.

## Firebase CLI를 사용하여 Realtime Database 관리하기

1. **Firebase CLI 로그인**
   ```bash
   npm run firebase:login
   ```

2. **Firebase 프로젝트 초기화**
   ```bash
   npm run firebase:init
   ```
   - Realtime Database와 Hosting 옵션을 선택합니다.
   - 프로젝트를 선택합니다.
   - 데이터베이스 보안 규칙 파일 경로를 지정합니다 (기본값: database.rules.json).
   - 배포할 디렉토리를 지정합니다 (기본값: build).

3. **배포**
   ```bash
   npm run firebase:deploy
   ```
   - 이 명령은 Realtime Database 규칙과 웹 애플리케이션을 배포합니다.

## 주의사항

- Realtime Database URL은 지역 설정에 따라 다양한 형식을 가질 수 있습니다:
  - `https://{프로젝트 ID}-default-rtdb.firebaseio.com`
  - `https://{프로젝트 ID}-rtdb.firebaseio.com`
  - `https://{프로젝트 ID}-default-rtdb.{지역 코드}.firebasedatabase.app`

- 정확한 URL을 찾기 위해서는 Firebase 콘솔의 Realtime Database 대시보드를 확인하세요.

## 문제 해결

### "Firebase error. Please ensure that you have the URL of your Firebase Realtime Database instance configured correctly" 오류

이 오류는 주로 다음과 같은 이유로 발생합니다:

1. **Realtime Database가 생성되지 않은 경우**
   - Firebase 콘솔에서 Realtime Database를 아직 생성하지 않았다면 위의 가이드에 따라 먼저 생성해야 합니다.

2. **데이터베이스 URL 형식이 올바르지 않은 경우**
   - 다양한 URL 형식을 시도해보세요:
     ```javascript
     // 기본 형식
     databaseURL: "https://todolist-60050.firebaseio.com"
     
     // 또는
     databaseURL: "https://todolist-60050-default-rtdb.firebaseio.com"
     
     // 또는 지역 코드 포함
     databaseURL: "https://todolist-60050-default-rtdb.asia-southeast1.firebasedatabase.app"
     ```

3. **Firebase 프로젝트 설정 확인**
   - Firebase 콘솔에서 프로젝트 설정으로 이동
   - "일반" 탭에서 프로젝트 ID와 웹 앱 설정 확인
   - 앱 등록이 완료되었는지 확인

4. **임시 해결책: Firestore 사용**
   - Realtime Database 대신 Firestore를 사용하는 것도 고려할 수 있습니다.
   - Firestore는 URL 지정 없이도 작동할 수 있습니다:
     ```javascript
     import { getFirestore } from 'firebase/firestore';
     
     // Firestore 초기화
     const firestore = getFirestore(app);
     ```

5. **Firebase 콘솔에서 직접 데이터 생성**
   - 데이터베이스가 올바르게 설정되었는지 확인하기 위해 Firebase 콘솔에서 직접 데이터를 생성해 보세요.

6. **최신 Firebase SDK 버전 확인**
   - package.json에서 Firebase 버전을 최신 버전으로 업데이트하세요.
     ```bash
     npm install firebase@latest
     ```

## Firestore로 전환하기

Realtime Database에 연결 문제가 지속되는 경우, 대안으로 Firestore를 사용할 수 있습니다. Firestore는 URL 설정 없이도 작동하며 더 강력한 쿼리 기능을 제공합니다.

### Firestore 설정 방법

1. **Firebase 콘솔에서 Firestore 생성**
   - Firebase 콘솔에서 "Firestore Database" 메뉴 클릭
   - "데이터베이스 만들기" 버튼 클릭
   - 보안 규칙 선택 (테스트 모드 또는 프로덕션 모드)
   - 데이터베이스 위치 선택

2. **코드에서 Firestore 초기화**
   ```javascript
   import { getFirestore } from 'firebase/firestore';
   
   // Firebase 앱 초기화 후
   const firestore = getFirestore(app);
   ```

3. **Firestore 보안 규칙 설정**
   - Firebase 콘솔에서 "Firestore Database" > "규칙" 탭 선택
   - 다음과 같은 규칙 설정:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /todos/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

4. **Firestore CRUD 작업**
   - 컬렉션 참조: `collection(firestore, 'todos/{userId}/items')`
   - 문서 참조: `doc(firestore, 'todos/{userId}/items/{todoId}')`
   - 문서 추가: `addDoc(collection(firestore, 'collection'), data)`
   - 문서 업데이트: `updateDoc(docRef, data)`
   - 문서 삭제: `deleteDoc(docRef)`
   - 실시간 업데이트 구독: `onSnapshot(query, callback)` 