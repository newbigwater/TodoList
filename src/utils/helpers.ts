import { Priority } from '../types';

// 일반적인 날짜 포맷 함수
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 시간 경과 표시 함수 (예: "3분 전", "2시간 전")
export const timeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval}년 전`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval}달 전`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval}일 전`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval}시간 전`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval}분 전`;
  }
  
  if (seconds < 10) return '방금 전';
  
  return `${Math.floor(seconds)}초 전`;
};

// 우선순위에 따른 텍스트 반환
export const getPriorityText = (priority: number): string => {
  switch (priority) {
    case Priority.High:
      return '높음';
    case Priority.Medium:
      return '중간';
    case Priority.Low:
      return '낮음';
    default:
      return '중간';
  }
};

// 우선순위에 따른 색상 클래스 반환
export const getPriorityColorClass = (priority: number): string => {
  switch (priority) {
    case Priority.High:
      return 'todo-priority-high';
    case Priority.Medium:
      return 'todo-priority-medium';
    case Priority.Low:
      return 'todo-priority-low';
    default:
      return '';
  }
};

// 문자열 자르기 (긴 텍스트를 축약)
export const truncateString = (str: string, maxLength: number = 50): string => {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

// 고유 ID 생성 (UUID 라이브러리 없이 간단히 구현)
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 