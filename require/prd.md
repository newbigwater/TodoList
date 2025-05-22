# Project Overview (프로젝트 개요)
 - 이 프로젝트는 사용자가 할 일을 관리할 수 있는 To-do List Web Application으로, Firebase를 활용하여 데이터를 저장하고 관리합니다.
    1. 사용자는 할 일을 추가, 수정, 삭제할 수 있으며, Firebase에 저장된 데이터가 실시간으로 동기화됩니다.
    2. 간단하고 직관적인 I/F를 통해 할 일의 우선순위를 설정하고 완료딘 항목을 체크할 수 있습니다.

# Development Environment (개발환경)
- Application 개발 환경은 다음과 같습니다.
    1. OS: Windows 11, CMD

# Core Functionalities (핵심 기능)
- To-do list의 주요 기능은 다음과 같습니다.
    1. 할 일 추가: 사용자가 새로운 할 일을 추가하면 Firebase에 저장
        - 중복된 할일이 존재할 경우를 알림과 추가 불가능하도록 합니다.
    2. 할 일 수정: 기존 할 일을 수정하면 Firebase에 자동으로 반영됩니다.
        - 기존에 추가된 내용과 동일한 내용일 경우, 알림과 수정 불가능하도록 합니다.
    3. 할 일 삭제: 불필요한 항목을 삭제하면 Firebase에서도 제거가 됩니다.
    4. 완료 체크: 완료된 항목을 체크하면 Firebase에 해당 정보가 업데이트 됩니다.
    5. 우선순위: 할 일의 중요도를 설정하여 우선 처리할 항목을 관리합니다.
    6. 칸반 보드 기능: 드래그 앤 드롭으로 할 일 항목의 상태를 변경할 수 있습니다.
        - 할 일, 진행 중, 완료 상태 간 드래그 앤 드롭으로 상태 변경이 가능합니다.
        - 이동 시 시각적 피드백과 완료 알림을 제공합니다.

# Doc (문서)
- 프로젝트 개발에 사용된 기술 스택과 도구는 다음과 같습니다.
    1. Frontend: React, TailwindCSS, TypeScript를 사용하여 UI와 기능을 구현하겠습니다.
    2. Backend: Firebase를 사용하여 데이터를 관리하고 실시간으로 동기화합니다.
    3. npm 패키지:
        - firebase: firebase 연동을 위해 사용
        - react-icons: 직관적인 I/F를 위해서 아이콘을 제공합니다.
        - UUID: 각 To-do Item에 고유한 ID를 부여합니다.
        - react-beautiful-dnd: 드래그 앤 드롭 기능 구현을 위해 사용합니다.

# Development Checklist (개발 체크리스트)
1. **프로젝트 초기 설정**
   - [x] React 프로젝트 생성 (TypeScript 템플릿)
   - [x] Tailwind CSS 설정
   - [x] 필요한 npm 패키지 설치 (firebase, uuid, react-icons)
   - [x] 기본 UI 구조 설계

2. **Firebase 설정**
   - [x] Firebase 초기화 코드 작성 (src/firebase.ts)
   - [ ] Firebase 프로젝트 생성
   - [ ] Realtime Database 생성 및 설정
   - [ ] Firebase 보안 규칙 설정

3. **컴포넌트 개발**
   - [x] 할 일 목록 컴포넌트 (TodoList)
   - [x] 할 일 항목 컴포넌트 (TodoItem)
   - [x] 할 일 추가 폼 컴포넌트 (AddTodoForm)
   - [x] 우선순위 선택 컴포넌트 (PrioritySelector)
   - [x] 알림 컴포넌트 (Notification)
   - [x] 칸반 보드 구현 (드래그 앤 드롭 기능)

4. **데이터 관리 기능 구현**
   - [x] 할 일 항목 추가 기능
   - [x] 할 일 항목 수정 기능
   - [x] 할 일 항목 삭제 기능
   - [x] 완료 상태 토글 기능
   - [x] 우선순위 설정 기능
   - [x] 데이터 필터링/정렬 기능
   - [x] 드래그 앤 드롭으로 상태 변경 기능

5. **유효성 검사**
   - [x] 중복 데이터 검사 로직
   - [x] 입력 데이터 유효성 검사
   - [x] 에러 처리 및 피드백 제공

6. **UI/UX 개선**
   - [x] 반응형 디자인 적용
   - [x] 로딩 상태 표시
   - [x] 애니메이션 효과
   - [x] 드래그 앤 드롭 시각적 피드백
   - [ ] 다크 모드 지원

7. **테스트 및 배포**
   - [ ] 기능 테스트
   - [ ] 크로스 브라우저 테스트
   - [ ] 성능 최적화
   - [ ] 배포 설정
  
# Current File Structure (현재 파일 구조)
```
todolist/
├── node_modules/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── TodoList/
│   │   │   ├── TodoList.tsx
│   │   │   └── TodoList.css
│   │   ├── TodoItem/
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoItem.css
│   │   ├── AddTodoForm/
│   │   │   ├── AddTodoForm.tsx
│   │   │   └── AddTodoForm.css
│   │   ├── PrioritySelector/
│   │   │   ├── PrioritySelector.tsx
│   │   │   └── PrioritySelector.css
│   │   └── Notification/
│   │       ├── Notification.tsx
│   │       └── Notification.css
│   ├── services/
│   │   ├── firebase.ts
│   │   └── todoService.ts
│   ├── hooks/
│   │   ├── useTodos.ts
│   │   └── useAuth.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── package-lock.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── README.md