# 테이블오더 서비스 - 컴포넌트 정의

## 프로젝트 구조 개요

```
table-order/
├── customer-app/          # 고객용 React 앱 (별도 빌드)
├── admin-app/             # 관리자용 React 앱 (별도 빌드)
├── backend/               # NestJS 백엔드 API 서버
├── database/              # DB 마이그레이션 및 시드
└── docker-compose.yml     # 배포 구성
```

---

## 1. 프론트엔드 컴포넌트

### 1.1 고객용 앱 (customer-app)

| 컴포넌트 | 책임 |
|----------|------|
| **LoginPage** | 초기 설정 화면 (매장ID, 테이블번호, 비밀번호 입력) |
| **MenuPage** | 메뉴 목록 표시, 카테고리 탐색, 장바구니 추가 |
| **CartDrawer** | 장바구니 표시, 수량 조절, 총액 계산 |
| **OrderConfirmPage** | 주문 최종 확인 및 확정 |
| **OrderSuccessPage** | 주문 성공 표시 (5초 후 리다이렉트) |
| **OrderHistoryPage** | 현재 세션 주문 내역 조회 |

**상태 관리**: Zustand (장바구니 persist, 인증 상태)
**API 통신**: TanStack Query + Axios

### 1.2 관리자용 앱 (admin-app)

| 컴포넌트 | 책임 |
|----------|------|
| **LoginPage** | 관리자 로그인 (매장ID, 사용자명, 비밀번호) |
| **DashboardPage** | 테이블별 주문 모니터링 그리드 |
| **TableCard** | 개별 테이블 카드 (주문 요약, 총액) |
| **OrderDetailModal** | 주문 상세 보기 모달 |
| **TableManagementPage** | 테이블 설정, 이용 완료, 과거 내역 |
| **MenuManagementPage** | 메뉴 CRUD |
| **CategoryManagementPage** | 카테고리 CRUD |

**상태 관리**: Zustand (인증 상태, SSE 연결 상태)
**API 통신**: TanStack Query + Axios
**실시간**: EventSource (SSE)

---

## 2. 백엔드 컴포넌트 (NestJS 모듈)

| 모듈 | 책임 |
|------|------|
| **AuthModule** | 인증/인가 (JWT 발급, 검증, 로그인 시도 제한) |
| **StoreModule** | 매장 정보 관리 |
| **TableModule** | 테이블 CRUD, 세션 관리, 초기 설정 |
| **CategoryModule** | 카테고리 CRUD, cascade update, delete protection |
| **MenuModule** | 메뉴 CRUD, 노출 순서 관리 |
| **OrderModule** | 주문 생성, 상태 변경, 삭제, 내역 조회 |
| **SessionModule** | 테이블 세션 라이프사이클 (시작/종료/이력 이동) |
| **SseModule** | Server-Sent Events 관리 (주문 실시간 전달) |

---

## 3. 데이터베이스 엔티티

| 엔티티 | 설명 |
|--------|------|
| **Store** | 매장 정보 (ID, 이름, 설정) |
| **Admin** | 관리자 계정 (사용자명, 비밀번호 해시, 매장 ID) |
| **Table** | 테이블 정보 (번호, 비밀번호, 매장 ID) |
| **TableSession** | 테이블 세션 (시작 시각, 종료 시각, 상태) |
| **Category** | 메뉴 카테고리 (이름, 노출 순서) |
| **Menu** | 메뉴 항목 (이름, 가격, 설명, 이미지URL, 카테고리, 순서) |
| **Order** | 주문 (테이블, 세션, 상태, 총액, 생성 시각) |
| **OrderItem** | 주문 항목 (메뉴명, 수량, 단가) |
| **OrderHistory** | 과거 주문 이력 (세션 종료 후 이동된 주문) |

---

## 4. 기술 스택 결정 요약

| 영역 | 선택 | 이유 |
|------|------|------|
| 프론트엔드 구조 | 별도 앱 2개 | 고객/관리자 독립 배포, 번들 크기 최적화 |
| 백엔드 구조 | NestJS 모듈 기반 | 기능별 명확한 분리, NestJS 표준 패턴 |
| ORM | TypeORM | NestJS 통합 우수, 데코레이터 기반 엔티티 정의 |
| 상태 관리 | Zustand | 가벼움, persist 미들웨어로 장바구니 로컬 저장 |
| API 통신 | TanStack Query + Axios | 서버 상태 캐싱, JWT 인터셉터, SSE 무효화 |
