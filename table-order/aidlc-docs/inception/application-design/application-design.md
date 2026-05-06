# 테이블오더 서비스 - Application Design (통합 문서)

## 1. 아키텍처 개요

### 시스템 구성
```
+-------------------+     +-------------------+
|   customer-app    |     |    admin-app      |
|   (React, Vite)   |     |   (React, Vite)   |
+--------+----------+     +--------+----------+
         |                          |
         | HTTP (REST)              | HTTP (REST) + SSE
         |                          |
         v                          v
+-----------------------------------------------+
|              backend (NestJS)                  |
|  +--------+ +--------+ +--------+ +--------+ |
|  |  Auth  | | Category| |  Menu  | | Order  | |
|  | Module | | Module  | | Module | | Module | |
|  +--------+ +--------+ +--------+ +--------+ |
|  +--------+ +--------+ +--------+             |
|  | Table  | |Session | |  SSE   |             |
|  | Module | | Module | | Module |             |
|  +--------+ +--------+ +--------+             |
+----------------------+------------------------+
                       |
                       | TypeORM
                       v
              +------------------+
              |   PostgreSQL     |
              +------------------+
```

### 기술 스택
| 계층 | 기술 | 선택 이유 |
|------|------|-----------|
| 고객 프론트엔드 | React + Vite + TypeScript | 빠른 빌드, 타입 안전성 |
| 관리자 프론트엔드 | React + Vite + TypeScript | 동일 기술로 유지보수 용이 |
| 상태 관리 | Zustand | 가벼움, persist 미들웨어 |
| API 통신 | TanStack Query + Axios | 캐싱, 자동 갱신, 인터셉터 |
| 백엔드 | NestJS + TypeScript | 모듈 구조, DI, 데코레이터 |
| ORM | TypeORM | NestJS 통합, 데코레이터 기반 |
| DB | PostgreSQL | 관계형 데이터, 트랜잭션 |
| 실시간 | SSE (Server-Sent Events) | 단방향 실시간, 간단한 구현 |
| 인증 | JWT + bcrypt | 무상태 인증, 안전한 비밀번호 |
| 배포 | Docker Compose | 일관된 환경, 간편한 배포 |
| i18n | react-i18next | 한국어/영어 지원 |

---

## 2. 프로젝트 구조

```
table-order/
├── customer-app/              # 고객용 React 앱
│   ├── src/
│   │   ├── components/        # UI 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── stores/            # Zustand 스토어
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── api/               # API 클라이언트
│   │   ├── i18n/              # 다국어 리소스
│   │   └── types/             # TypeScript 타입
│   ├── package.json
│   └── Dockerfile
│
├── admin-app/                 # 관리자용 React 앱
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── package.json
│   └── Dockerfile
│
├── backend/                   # NestJS 백엔드
│   ├── src/
│   │   ├── auth/              # AuthModule
│   │   ├── category/          # CategoryModule
│   │   ├── menu/              # MenuModule
│   │   ├── order/             # OrderModule
│   │   ├── table/             # TableModule
│   │   ├── session/           # SessionModule
│   │   ├── sse/               # SseModule
│   │   ├── store/             # StoreModule
│   │   ├── common/            # 공통 (guards, decorators, filters)
│   │   └── database/          # DB 설정, 마이그레이션, 시드
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml         # 전체 서비스 오케스트레이션
├── docker-compose.dev.yml     # 개발 환경 오버라이드
└── README.md
```

---

## 3. 데이터 모델 (ERD 개요)

```
Store (1) ──── (N) Admin
Store (1) ──── (N) Table
Store (1) ──── (N) Category

Category (1) ──── (N) Menu

Table (1) ──── (N) TableSession
TableSession (1) ──── (N) Order
Order (1) ──── (N) OrderItem

TableSession (1) ──── (N) OrderHistory (세션 종료 후)
```

### 주요 엔티티 필드

| 엔티티 | 주요 필드 |
|--------|-----------|
| Store | id, name, identifier |
| Admin | id, username, passwordHash, storeId |
| Table | id, tableNumber, passwordHash, storeId |
| TableSession | id, tableId, startedAt, completedAt, status |
| Category | id, name, displayOrder, storeId |
| Menu | id, name, price, description, imageUrl, categoryId, displayOrder |
| Order | id, orderNumber, sessionId, tableId, status, totalAmount, createdAt |
| OrderItem | id, orderId, menuName, quantity, unitPrice |
| OrderHistory | id, originalOrderId, sessionId, tableId, completedAt, orderData(JSON) |

---

## 4. 인증 설계

### 역할 기반 접근 제어
| 역할 | 접근 가능 API | 토큰 만료 |
|------|--------------|-----------|
| admin | 관리자 전체 API | 16시간 |
| table | 메뉴 조회, 주문 생성/조회 | 16시간 |

### JWT Payload
```typescript
interface JwtPayload {
  sub: string;        // 사용자/테이블 ID
  role: 'admin' | 'table';
  storeId: string;
  tableId?: number;   // table 역할일 때만
  iat: number;
  exp: number;
}
```

---

## 5. 실시간 통신 (SSE)

### 이벤트 타입
| 이벤트 | 데이터 | 트리거 |
|--------|--------|--------|
| `order:created` | Order 전체 정보 | 고객 주문 생성 시 |
| `order:statusChanged` | orderId, newStatus | 관리자 상태 변경 시 |
| `order:deleted` | orderId, tableId | 관리자 주문 삭제 시 |
| `session:completed` | tableId | 이용 완료 처리 시 |

### SSE 연결 관리
- 관리자 앱 로그인 시 SSE 구독 시작
- 연결 끊김 시 자동 재연결 (EventSource 기본 동작)
- 하트비트: 30초 간격 ping 이벤트

---

## 6. Docker Compose 구성

### 서비스 구성
| 서비스 | 포트 | 설명 |
|--------|------|------|
| customer-app | 3000 | 고객용 프론트엔드 (Nginx) |
| admin-app | 3001 | 관리자용 프론트엔드 (Nginx) |
| backend | 4000 | NestJS API 서버 |
| postgres | 5432 | PostgreSQL 데이터베이스 |

---

## 7. 설계 결정 요약

| 결정 사항 | 선택 | 근거 |
|-----------|------|------|
| 프론트엔드 분리 | 별도 앱 2개 | 독립 배포, 번들 최적화, 보안 분리 |
| 백엔드 구조 | NestJS 모듈 기반 | 표준 패턴, 명확한 책임 분리 |
| ORM | TypeORM | NestJS 통합, 마이그레이션 지원 |
| 상태 관리 | Zustand | 가벼움, persist로 장바구니 유지 |
| API 통신 | TanStack Query + Axios | 캐싱, 자동 갱신, JWT 인터셉터 |
| 실시간 | SSE | 단방향 충분, WebSocket보다 간단 |
| 세션 관리 | DB 기반 TableSession | 서버 재시작에도 유지, 이력 추적 |
