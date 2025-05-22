// 사용자 정의 타입 및 인터페이스 선언

// 할 일 항목 우선순위
export enum Priority {
    High = 1,
    Medium = 2,
    Low = 3
}

// 알림 타입
export type NotificationType = 'success' | 'error' | 'info' | 'drag-success' | 'drag-error';

// 할 일 항목 인터페이스
export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    inProgress: boolean;
    priority: Priority;
    createdAt: number;
    updatedAt: number;
}

// 알림 인터페이스
export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    timeout?: number;
}

// 사용자 정보 타입
export interface User {
  uid: string;
  name?: string;
  email?: string;
} 