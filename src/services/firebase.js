import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase 설정 정보
// 테스트용 임시 구성 (실제 프로젝트에서는 환경변수 사용 권장)
const firebaseConfig = {
  apiKey: "AIzaSyBTqjW9O4-sxNgWs0O4kFhp9B0zDKqL6zM",
  authDomain: "todo-app-demo-12345.firebaseapp.com",
  databaseURL: "https://todo-app-demo-12345-default-rtdb.firebaseio.com",
  projectId: "todo-app-demo-12345",
  storageBucket: "todo-app-demo-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6a7b8c9d0e1"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 인증 서비스 초기화
export const auth = getAuth(app);

// 데이터베이스 서비스 초기화
export const database = getDatabase(app);

export default app; 