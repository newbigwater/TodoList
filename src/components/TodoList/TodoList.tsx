import React, { useState, useEffect, useRef } from 'react';
import { Todo, Priority } from '../../types';
import TodoItem from '../TodoItem/TodoItem';
import AddTodoForm from '../AddTodoForm/AddTodoForm';
import { useNotifications, NotificationsWrapper } from '../Notification/Notification';
import './TodoList.css';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddTodo: (title: string, description?: string, priority?: number) => Promise<void>;
  onUpdateTodo: (todoId: string, updates: Partial<Todo>) => Promise<void>;
  onDeleteTodo: (todoId: string) => Promise<void>;
  onToggleComplete: (todoId: string, completed: boolean) => Promise<void>;
  onToggleInProgress: (todoId: string, inProgress: boolean) => Promise<void>;
  onChangePriority: (todoId: string, priority: number) => Promise<void>;
}

// 칸반 열 정의
const COLUMN_TODO = 'todo';
const COLUMN_IN_PROGRESS = 'inProgress';
const COLUMN_COMPLETED = 'completed';

// 우선순위 정의
const PRIORITY_HIGH = 'high';
const PRIORITY_MEDIUM = 'medium';
const PRIORITY_LOW = 'low';

interface ColumnConfig {
  id: string;
  title: string;
}

// 칸반 열 설정
const columns: ColumnConfig[] = [
  { id: COLUMN_TODO, title: '할 일' },
  { id: COLUMN_IN_PROGRESS, title: '진행 중' },
  { id: COLUMN_COMPLETED, title: '완료' }
];

// 우선순위 스윔레인 설정
const swimlanes = [
  { id: PRIORITY_HIGH, title: '중요', priority: Priority.High },
  { id: PRIORITY_MEDIUM, title: '보통', priority: Priority.Medium },
  { id: PRIORITY_LOW, title: '낮음', priority: Priority.Low }
];

const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading,
  searchQuery,
  setSearchQuery,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
  onToggleInProgress,
  onChangePriority
}) => {
  const { notifications, addNotification, removeNotification } = useNotifications();
  const [isDragging, setIsDragging] = useState(false);
  const [currentDraggedId, setCurrentDraggedId] = useState<string | null>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await onToggleComplete(id, completed);
      addNotification(
        completed ? '할 일이 완료됨으로 표시되었습니다.' : '할 일이 미완료됨으로 표시되었습니다.',
        'success'
      );
    } catch (error) {
      addNotification('상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleToggleInProgress = async (id: string, inProgress: boolean) => {
    try {
      await onToggleInProgress(id, inProgress);
      addNotification(
        inProgress ? '할 일이 진행 중으로 표시되었습니다.' : '할 일이 진행 중에서 제외되었습니다.',
        'success'
      );
    } catch (error) {
      addNotification('진행 상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 네이티브 드래그 앤 드롭 이벤트 초기화
  useEffect(() => {
    // 전역 드래그 상태 관리 핸들러
    const handleGlobalDragStart = (e: Event) => {
      const dragEvent = e as DragEvent;
      const target = dragEvent.target as HTMLElement;
      if (!target) return;
      
      // TodoItem 요소를 찾음
      const todoItem = target.closest('[data-todo-id]');
      if (!todoItem) return;
      
      const todoId = todoItem.getAttribute('data-todo-id');
      if (!todoId) return;
      
      setIsDragging(true);
      setCurrentDraggedId(todoId);
      document.body.classList.add('dragging-active');
    };
    
    const handleGlobalDragEnd = (e: Event) => {
      setIsDragging(false);
      setCurrentDraggedId(null);
      document.body.classList.remove('dragging-active');
      
      // 드래그 관련 클래스 제거
      document.querySelectorAll('.dragging').forEach(el => {
        el.classList.remove('dragging');
      });
      
      document.querySelectorAll('.dragging-over').forEach(el => {
        el.classList.remove('dragging-over');
      });
    };
    
    // 전역 이벤트 리스너 등록
    document.addEventListener('dragstart', handleGlobalDragStart, false);
    document.addEventListener('dragend', handleGlobalDragEnd, false);
    
    return () => {
      document.removeEventListener('dragstart', handleGlobalDragStart);
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, [currentDraggedId]);

  // 칸반 컬럼 드롭 이벤트 설정
  useEffect(() => {
    const setupDropZones = () => {
      // 모든 칸반 컬럼 가져오기
      const columns = document.querySelectorAll('[data-column-id]');
      if (!columns.length) {
        return undefined;
      }
      
      const handleDragOver = (e: Event) => {
        e.preventDefault(); // 필수: 드롭을 허용하기 위해
        e.stopPropagation();
        
        const column = e.currentTarget as HTMLElement;
        
        if (!isDragging || !currentDraggedId) return;
        
        // 같은 칸반 컬럼 내에서는 하이라이트하지 않음
        const columnId = column.getAttribute('data-column-id');
        const todoElement = document.querySelector(`[data-todo-id="${currentDraggedId}"]`);
        if (!todoElement) return;
        
        const todoCompleted = todoElement.getAttribute('data-completed') === 'true';
        const todoInProgress = todoElement.getAttribute('data-in-progress') === 'true';
        
        // 현재 상태에 따라 드롭 가능 여부 결정
        let canDrop = false;
        if (columnId === COLUMN_TODO && (todoCompleted || todoInProgress)) {
          canDrop = true;
        } else if (columnId === COLUMN_IN_PROGRESS && (!todoInProgress || todoCompleted)) {
          canDrop = true;
        } else if (columnId === COLUMN_COMPLETED && !todoCompleted) {
          canDrop = true;
        }
        
        if (canDrop) {
          column.classList.add('dragging-over');
        }
      };
      
      const handleDragLeave = (e: Event) => {
        const dragEvent = e as DragEvent;
        const column = e.currentTarget as HTMLElement;
        const relatedTarget = dragEvent.relatedTarget as HTMLElement;
        
        // 칸반 컬럼 내부 요소로 이동하는 경우는 무시
        if (column.contains(relatedTarget)) return;
        
        column.classList.remove('dragging-over');
      };
      
      const handleDrop = async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        const dragEvent = e as DragEvent;
        const column = e.currentTarget as HTMLElement;
        const columnId = column.getAttribute('data-column-id');
        
        // dataTransfer에서 데이터 추출
        if (!dragEvent.dataTransfer) {
          return;
        }
        
        const todoId = dragEvent.dataTransfer.getData('text/plain');
        if (!todoId) {
          return;
        }
        
        if (!columnId || !todoId) return;
        
        column.classList.remove('dragging-over');
        
        try {
          const todo = todos.find(t => t.id === todoId);
          if (!todo) {
            return;
          }
          
          // 칸반 컬럼 ID에 따라 상태 변경
          if (columnId === COLUMN_COMPLETED && !todo.completed) {
            // 완료 상태로 변경
            if (todo.inProgress) {
              await handleToggleInProgress(todoId, false);
            }
            await handleToggleComplete(todoId, true);
            addNotification('할 일이 완료 상태로 이동되었습니다.', 'drag-success');
          } 
          else if (columnId === COLUMN_IN_PROGRESS && !todo.inProgress) {
            // 진행 중 상태로 변경
            if (todo.completed) {
              await handleToggleComplete(todoId, false);
            }
            await handleToggleInProgress(todoId, true);
            addNotification('할 일이 진행 중 상태로 이동되었습니다.', 'drag-success');
          }
          else if (columnId === COLUMN_TODO && (todo.inProgress || todo.completed)) {
            // 할 일 상태로 변경
            if (todo.inProgress) {
              await handleToggleInProgress(todoId, false);
            }
            if (todo.completed) {
              await handleToggleComplete(todoId, false);
            }
            addNotification('할 일이 할 일 상태로 이동되었습니다.', 'drag-success');
          }
        } catch (error) {
          addNotification('할 일 상태 변경 중 오류가 발생했습니다.', 'drag-error');
        }
      };
      
      // 각 칸반 컬럼에 이벤트 등록
      columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
      });
      
      // 클린업 함수
      return () => {
        columns.forEach(column => {
          column.removeEventListener('dragover', handleDragOver);
          column.removeEventListener('dragleave', handleDragLeave);
          column.removeEventListener('drop', handleDrop);
        });
      };
    };
    
    // DOM이 렌더링된 후 실행
    const timeoutId = setTimeout(setupDropZones, 500);
    
    // 컴포넌트 언마운트 시 타임아웃 정리
    return () => {
      clearTimeout(timeoutId);
    };
  }, [todos, isDragging, currentDraggedId, handleToggleComplete, handleToggleInProgress, addNotification]);

  const handleAddTodo = async (title: string, description?: string, priority: number = Priority.Medium) => {
    try {
      await onAddTodo(title, description, priority);
      addNotification('할 일이 추가되었습니다.', 'success');
    } catch (error) {
      if (error instanceof Error) {
        addNotification(error.message, 'error');
      } else {
        addNotification('할 일 추가 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  const handleUpdateTodo = async (id: string, title: string, description?: string, priority: number = Priority.Medium) => {
    try {
      await onUpdateTodo(id, { title, description, priority });
      addNotification('할 일이 수정되었습니다.', 'success');
    } catch (error) {
      if (error instanceof Error) {
        addNotification(error.message, 'error');
      } else {
        addNotification('할 일 수정 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await onDeleteTodo(id);
      addNotification('할 일이 삭제되었습니다.', 'success');
    } catch (error) {
      addNotification('할 일 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleChangePriority = async (id: string, priority: number) => {
    try {
      await onChangePriority(id, priority);
      addNotification('우선순위가 변경되었습니다.', 'success');
    } catch (error) {
      addNotification('우선순위 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  // 검색어에 따른 필터링
  const filterBySearch = (todo: Todo) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      todo.title.toLowerCase().includes(query) ||
      (todo.description && todo.description.toLowerCase().includes(query))
    );
  };

  // 아이템 분류
  const getTodosByColumn = (columnId: string) => {
    switch (columnId) {
      case COLUMN_TODO:
        return todos.filter(todo => !todo.completed && !todo.inProgress && filterBySearch(todo));
      case COLUMN_IN_PROGRESS:
        return todos.filter(todo => todo.inProgress && !todo.completed && filterBySearch(todo));
      case COLUMN_COMPLETED:
        return todos.filter(todo => todo.completed && filterBySearch(todo));
      default:
        return [];
    }
  };

  // 우선순위별 아이템 필터링
  const getTodosByPriority = (todos: Todo[], priority: number) => {
    return todos.filter(todo => todo.priority === priority);
  };

  return (
    <div className="app-container">
      <div className="header-section">
        <h1 className="app-title">할 일 관리 애플리케이션</h1>
        <h2 className="app-subtitle">로컬 스토리지 기반 투두리스트 앱</h2>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="add-todo-title">
            <div className="icon-plus">+</div>
            <h2>새로운 할 일 추가</h2>
          </div>
        </div>
        <div className="card-body">
          <AddTodoForm onAddTodo={handleAddTodo} />
        </div>
      </div>

      <div className="card">
        <div className="card-header filter-section">
          <div className="filter-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
            </svg>
          </div>
          <h2>검색</h2>
        </div>
        <div className="card-body">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="할 일 검색..." 
              className="search-input full-width" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div 
          ref={columnsRef}
          className={`kanban-board ${isDragging ? 'is-dragging' : ''}`}
        >
          {columns.map(column => {
            const columnTodos = getTodosByColumn(column.id);
            
            return (
              <div 
                key={column.id}
                className={`kanban-column`}
                data-column-id={column.id}
                data-testid={`column-${column.id}`}
              >
                <div className="column-header">
                  <h2>{column.title}</h2>
                  <span className="column-count">{columnTodos.length}</span>
                </div>
                <div className="column-content">
                  {columnTodos.length === 0 ? (
                    <div className="empty-column">
                      <p>{column.id === COLUMN_TODO 
                          ? '할 일이 없습니다' 
                          : column.id === COLUMN_IN_PROGRESS 
                            ? '진행 중인 항목이 없습니다' 
                            : '완료된 항목이 없습니다'}</p>
                    </div>
                  ) : (
                    // 우선순위별 스윔레인으로 분류
                    swimlanes.map(swimlane => {
                      const swimlaneTodos = getTodosByPriority(columnTodos, swimlane.priority);
                      
                      if (swimlaneTodos.length === 0) return null;
                      
                      return (
                        <div 
                          key={`${column.id}-${swimlane.id}`} 
                          className={`swimlane swimlane-${swimlane.id}`}
                          data-swimlane-id={swimlane.id}
                          data-swimlane-priority={swimlane.priority}
                        >
                          <div className="swimlane-title">
                            {swimlane.title}
                          </div>
                          
                          {swimlaneTodos.map(todo => (
                            <div 
                              key={todo.id}
                              id={`todo-wrapper-${todo.id}`}
                              className={`todo-item-wrapper ${currentDraggedId === todo.id ? 'dragging' : ''}`}
                              data-todo-wrapper-id={todo.id}
                            >
                              <TodoItem
                                todo={todo}
                                onToggleComplete={handleToggleComplete}
                                onToggleInProgress={handleToggleInProgress}
                                onDelete={handleDeleteTodo}
                                onEdit={handleUpdateTodo}
                                onChangePriority={handleChangePriority}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NotificationsWrapper
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
};

export default TodoList;