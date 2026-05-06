# Code Generation Plan - Admin Unit (Unit 1)

## Unit Context
- **유닛**: 관리자 유닛 (백엔드 전체 + 관리자 프론트엔드 + 인프라)
- **스토리**: AS-01~09 (9개)
- **코드 위치**: 워크스페이스 루트 (table-order/)
- **구조**: Greenfield multi-unit (별도 디렉토리)

## 코드 생성 위치
```
table-order/
├── backend/          ← NestJS 백엔드
├── admin-app/        ← 관리자 React 앱
└── docker-compose.yml ← 인프라
```

---

## 실행 계획

### Step 1: 프로젝트 초기 구조 셋업
- [x] backend/ NestJS 프로젝트 초기화 (package.json, tsconfig, nest-cli)
- [x] admin-app/ React + Vite 프로젝트 초기화 (package.json, vite.config, tsconfig)
- [x] 루트 docker-compose.yml, .env.example 생성
- [x] 루트 README.md 생성

### Step 2: 백엔드 - 데이터베이스 및 공통 설정
- [x] TypeORM 설정 (database.module.ts, ormconfig)
- [x] 공통 모듈 (common/): Exception Filter, Guards, Decorators
- [x] 환경 설정 (@nestjs/config)
- [x] Health Check 엔드포인트
- [x] 엔티티 정의 (Store, Admin, Table, TableSession, Category, Menu, Order, OrderItem, OrderHistory)

### Step 3: 백엔드 - AuthModule
- [ ] Auth Controller, Service, Module
- [ ] JWT Strategy, Guard
- [ ] Roles Guard (admin/table)
- [ ] 로그인 시도 제한 로직
- [ ] bcrypt 비밀번호 검증
- [ ] 단위 테스트 (AuthService)

### Step 4: 백엔드 - CategoryModule
- [x] Category Controller, Service, Module
- [x] CRUD 엔드포인트
- [x] 중복 검증, Delete Protection
- [x] Reorder 기능
- [x] 단위 테스트 (CategoryService)

### Step 5: 백엔드 - MenuModule
- [x] Menu Controller, Service, Module
- [x] CRUD 엔드포인트
- [x] 카테고리 존재 검증, 가격 범위 검증
- [x] Reorder 기능
- [x] 단위 테스트 (MenuService)

### Step 6: 백엔드 - OrderModule
- [x] Order Controller, Service, Module
- [x] 주문 생성 (번호 생성, 금액 계산, 세션 연동)
- [x] 상태 변경 (전이 규칙 검증)
- [x] 주문 삭제
- [x] 주문 조회 (세션별, 테이블별)
- [x] 단위 테스트 (OrderService)

### Step 7: 백엔드 - SessionModule
- [x] Session Controller, Service, Module
- [x] getOrCreateSession
- [x] 이용 완료 처리 (트랜잭션: 이력 이동 + 삭제 + 세션 종료)
- [x] 과거 이력 조회 (날짜 필터)
- [x] 단위 테스트 (SessionService)

### Step 8: 백엔드 - TableModule + StoreModule
- [x] Table Controller, Service, Module
- [x] Store Module (시드 데이터용)
- [x] 테이블 CRUD
- [x] 단위 테스트

### Step 9: 백엔드 - SseModule
- [x] SSE Controller, Service, Module
- [x] 클라이언트 연결 관리
- [x] 이벤트 발행 (order:created, order:statusChanged, order:deleted, session:completed)
- [x] 하트비트 (30초 ping)
- [x] OrderModule/SessionModule에서 SSE 연동

### Step 10: 백엔드 - 마이그레이션 및 시드
- [x] TypeORM 마이그레이션 파일 생성
- [x] 시드 스크립트 (초기 Store + Admin 계정)
- [x] Dockerfile (multi-stage)

### Step 11: 관리자 프론트엔드 - 프로젝트 셋업 및 공통
- [x] Vite + React + TypeScript 설정
- [x] Zustand 스토어 (authStore, sseStore)
- [x] Axios 인스턴스 (JWT 인터셉터)
- [x] TanStack Query 설정
- [x] React Router 설정
- [x] 공통 컴포넌트 (Layout, Sidebar, ConfirmModal)

### Step 12: 관리자 프론트엔드 - LoginPage
- [x] 로그인 폼 (매장ID, 사용자명, 비밀번호)
- [x] 로그인 API 연동
- [x] 토큰 저장 및 리다이렉트
- [x] 에러 표시

### Step 13: 관리자 프론트엔드 - DashboardPage (주문 모니터링)
- [x] 테이블 그리드 레이아웃
- [x] TableCard 컴포넌트 (총액, 주문 미리보기, 신규 강조)
- [x] OrderDetailModal (상세 보기, 상태 변경, 삭제)
- [x] SSE 연결 및 실시간 업데이트
- [x] 테이블 필터링

### Step 14: 관리자 프론트엔드 - TableManagementPage
- [x] 테이블 목록
- [x] 테이블 추가 폼
- [x] 이용 완료 버튼 + 확인 팝업
- [x] 과거 내역 모달 (날짜 필터)

### Step 15: 관리자 프론트엔드 - MenuManagementPage + CategoryManagementPage
- [x] 카테고리 CRUD UI
- [x] 메뉴 CRUD UI (카테고리별 필터)
- [x] 순서 변경 UI
- [x] 폼 검증

### Step 16: 관리자 프론트엔드 - Dockerfile + Nginx
- [x] admin-app/Dockerfile (multi-stage)
- [x] admin-app/nginx.conf (SPA + API/SSE 프록시)

### Step 17: 통합 및 배포 구성
- [x] docker-compose.yml 최종 구성
- [x] docker-compose.dev.yml
- [x] .env.example
- [x] .gitignore
- [x] README.md (설치/실행 가이드)

### Step 18: 코드 생성 요약 문서
- [x] `aidlc-docs/construction/admin-unit/code/code-summary.md` 생성
- [x] 생성된 파일 목록 및 구조 문서화

---

## 스토리 매핑

| Step | 관련 스토리 |
|------|------------|
| Step 2 | (공통 인프라) |
| Step 3 | AS-01 (매장 인증) |
| Step 4 | AS-09 (카테고리 관리) |
| Step 5 | AS-08 (메뉴 관리) |
| Step 6 | AS-02, AS-03, AS-05 (주문 모니터링, 상태 관리, 삭제) |
| Step 7 | AS-06, AS-07 (이용 완료, 과거 내역) |
| Step 8 | AS-04 (테이블 초기 설정) |
| Step 9 | AS-02 (실시간 모니터링 - SSE) |
| Step 12 | AS-01 (매장 인증 - UI) |
| Step 13 | AS-02, AS-03, AS-05 (모니터링 - UI) |
| Step 14 | AS-04, AS-06, AS-07 (테이블 관리 - UI) |
| Step 15 | AS-08, AS-09 (메뉴/카테고리 관리 - UI) |
