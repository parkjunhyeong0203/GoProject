# 프로젝트 규칙: JWT 인증 기반 Todo 및 일정 관리 REST API

## 1. 기술 스택 (Tech Stack)
- **프론트엔드:** React / Next.js (클라이언트 중심)
- **백엔드:** Go / Gin (또는 지정된 백엔드 프레임워크) + JWT 인증
- **데이터베이스:** SQLite / PostgreSQL (Prisma ORM)

## 2. 프론트엔드 (Frontend) - 전면 위임 (Full Responsibility)
- **범위:** `ProjectTDL/todo-front/component`, `ProjectTDL/todo-front/app`, `ProjectTDL/todo-front/pages`, UI 디자인 시스템, 상태 관리, 클라이언트 사이드 로직 전체
- **역할 및 지침:** 
  - 할 일(Todo) 및 일정 캘린더 UI, 폼 입력, 상태 관리 등 프론트엔드 화면 구현은 에이전트가 주도적으로 완성하세요.
  - 사용자 경험(UX)과 깔끔한 컴포넌트 분리에 집중하여 자유롭게 코드를 작성해도 좋습니다.

## 3. 백엔드 (Backend) - 제한적 위임 (Restricted Scope)
- **범위:** `ProjectTDL/todo-api`,  API 라우트(`app/api/`) 일부
- **지침:**
  - **기본 원칙:** 백엔드 코드는 사용자가 지정한 명세(API 계약) 외에 **임의로 수정, 리팩토링, 확장하지 마세요.**
  - **허용 작업:** 프론트엔드 연동을 위해 기존에 정의된 API를 호출(Fetch)하는 클라이언트 코드 작성 및, 사용자가 명시적으로 요청한 간단한 API 엔드포인트 추가 외에는 백엔드 로직에 개입하지 않습니다.
  - **DB 스키마:** 데이터베이스 스키마(`schema.prisma` 등)는 절대 임의로 변경(Migrate)하지 마세요. 변경이 필요할 경우 반드시 사용자에게 먼저 승인을 요청하세요.