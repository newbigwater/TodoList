import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { firebaseConfig } from '../environment';
import { getFirebaseErrorMessage, getDatabaseUrlGuide } from './firebaseErrorHandler';

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

  // Realtime Database 초기화 시도
  try {
    database = getDatabase(app);
    console.log('Realtime Database 초기화 성공');
  } catch (dbError) {
    console.warn('Realtime Database 초기화 실패:', getFirebaseErrorMessage(dbError));
    database = null;  // 초기화 실패 시 null로 설정
  }
  
  // Firestore 초기화 (Realtime Database가 실패하는 경우 대안으로 사용)
  firestore = getFirestore(app);
  console.log('Firestore 초기화 성공');
  
  // 오프라인 지속성 활성화 (선택 사항)
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

  // 로컬 개발 환경에서 에뮬레이터 연결 (선택사항)
  if (process.env.NODE_ENV === 'development') {
    // 에뮬레이터 사용 시 주석 해제
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectDatabaseEmulator(database, 'localhost', 9000);
  }
} catch (error) {
  console.error('Firebase 초기화 중 오류 발생:', getFirebaseErrorMessage(error));
  console.info(getDatabaseUrlGuide());
  
  // 오류 시 더미 객체 생성 (앱이 크래시되지 않도록)
  if (!app) app = {};
  if (!auth) auth = {};
  if (!database) database = {};
  if (!firestore) firestore = {};
  firebaseInitialized = false;
}

// Realtime Database는 기본적으로 오프라인 지속성이 활성화되어 있음
// 필요한 경우 설정을 조정할 수 있음
// ref: https://firebase.google.com/docs/database/web/offline-capabilities

// Firebase 상태 확인 함수
const checkFirebaseStatus = () => {
  return {
    initialized: firebaseInitialized,
    services: {
      app: !!app,
      auth: !!auth,
      database: !!database,
      firestore: !!firestore
    },
    config: {
      projectId: firebaseConfig.projectId,
      databaseURL: firebaseConfig.databaseURL,
      hasApiKey: !!firebaseConfig.apiKey
    }
  };
};

// Firebase 서비스 내보내기
export { auth, database, firestore, checkFirebaseStatus };
export default app; 