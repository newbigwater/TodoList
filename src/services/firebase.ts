import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase 설정 정보
// 환경 변수에서 가져옵니다.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 인증 서비스 초기화
export const auth = getAuth(app);

// 데이터베이스 서비스 초기화
export const database = getDatabase(app);

// 오프라인 지속성 활성화
// enablePersistence 함수는 client SDK v9에서 변경됨
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

// Firestore는 옵션이므로 필요한 경우에만 사용
// const firestore = getFirestore(app);
// enableIndexedDbPersistence(firestore).catch((error) => {
//   console.error('오프라인 지속성 활성화 실패:', error);
// });

// 로컬 개발 환경에서 에뮬레이터 연결 (선택사항)
if (process.env.NODE_ENV === 'development') {
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectDatabaseEmulator(database, 'localhost', 9000);
}

export default app; 