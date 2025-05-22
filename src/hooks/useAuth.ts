import { useState, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInAnonymously,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { User } from '../types';

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (firebaseUser: FirebaseUser | null) => {
        setLoading(true);
        if (firebaseUser) {
          // 사용자 인증 정보를 User 타입으로 변환
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            name: firebaseUser.displayName || undefined
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }, 
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []);

  // 익명 로그인
  const signIn = async (): Promise<void> => {
    try {
      setError(null);
      await signInAnonymously(auth);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('로그인 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  // 로그아웃
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('로그아웃 중 오류가 발생했습니다.'));
      throw err;
    }
  };

  return { user, loading, error, signIn, signOut };
}; 