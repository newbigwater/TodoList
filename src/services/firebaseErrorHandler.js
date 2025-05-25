/**
 * Firebase 오류 메시지를 사용자 친화적인 메시지로 변환
 * @param {Error} error - Firebase 오류 객체
 * @returns {string} 사용자 친화적인 오류 메시지
 */
export const getFirebaseErrorMessage = (error) => {
  // 오류 코드 확인
  const errorCode = error.code || '';
  const errorMessage = error.message || '';

  // 데이터베이스 URL 관련 오류
  if (errorMessage.includes('URL of your Firebase Realtime Database')) {
    return 'Firebase Realtime Database URL이 올바르지 않습니다. Firebase 콘솔에서 올바른 URL을 확인하세요.';
  }

  // 인증 관련 오류
  if (errorCode.includes('auth/')) {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '사용자를 찾을 수 없습니다.';
      case 'auth/wrong-password':
        return '잘못된 비밀번호입니다.';
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.';
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 형식입니다.';
      case 'auth/weak-password':
        return '비밀번호가 너무 약합니다.';
      default:
        return '인증 중 오류가 발생했습니다.';
    }
  }

  // 데이터베이스 관련 오류
  if (errorCode.includes('database/')) {
    switch (errorCode) {
      case 'database/permission-denied':
        return '데이터베이스 접근 권한이 없습니다.';
      default:
        return '데이터베이스 작업 중 오류가 발생했습니다.';
    }
  }

  // 네트워크 관련 오류
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return '네트워크 연결 오류가 발생했습니다. 인터넷 연결을 확인하세요.';
  }

  // 기본 오류 메시지
  return errorMessage || '알 수 없는 오류가 발생했습니다.';
};

/**
 * Firebase 데이터베이스 URL 확인 가이드 메시지
 * @returns {string} 가이드 메시지
 */
export const getDatabaseUrlGuide = () => {
  return `
Firebase Realtime Database URL을 확인하는 방법:

1. Firebase 콘솔(https://console.firebase.google.com/)에 로그인합니다.
2. 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 "Realtime Database"를 클릭합니다.
4. 데이터베이스 URL이 상단에 표시됩니다.
5. 이 URL을 environment.js 파일의 databaseURL 값으로 설정합니다.

일반적인 URL 형식:
- https://{프로젝트 ID}-default-rtdb.firebaseio.com
- https://{프로젝트 ID}-rtdb.firebaseio.com
- https://{프로젝트 ID}-default-rtdb.{지역 코드}.firebasedatabase.app
`;
}; 