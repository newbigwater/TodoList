import { useState, useEffect } from 'react';

// Firebase 인증을 사용하지 않고 로컬 상태로만 모의 구현
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 가상의 user ID 생성
  const mockUser = {
    uid: 'local-user-123456',
    email: 'test@example.com',
    name: '테스트 사용자'
  };

  // 컴포넌트 마운트 시 자동 로그인
  useEffect(() => {
    // 이미 로그인된 상태이면 아무것도 하지 않음
    if (user) return;
    
    // 로컬 스토리지에서 로그인 상태 확인
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [user]);

  // 가상 로그인
  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 실제 인증 없이 가상의 사용자 정보 사용
      setUser(mockUser);
      
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      
      setLoading(false);
    } catch (err) {
      setError(new Error('로그인 중 오류가 발생했습니다.'));
      setLoading(false);
      throw err;
    }
  };

  // 가상 로그아웃
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 사용자 상태 및 로컬 스토리지 초기화
      setUser(null);
      localStorage.removeItem('mock_user');
      
      setLoading(false);
    } catch (err) {
      setError(new Error('로그아웃 중 오류가 발생했습니다.'));
      setLoading(false);
      throw err;
    }
  };

  return { user, loading, error, signIn, signOut };
}; 