# 테이블오더 서비스

식당 테이블 주문 관리 시스템입니다. 고객이 QR코드를 통해 메뉴를 확인하고 주문할 수 있으며, 관리자가 매장/메뉴/주문을 관리할 수 있습니다.

## 기술 스택

### 백엔드
- **Runtime**: Node.js 20
- **Framework**: NestJS 10
- **Database**: PostgreSQL 16
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **Language**: TypeScript 5 (strict mode)

### 프론트엔드 (관리자 앱)
- **Framework**: React 18
- **Build Tool**: Vite 5
- **State Management**: Zustand
- **Server State**: TanStack Query (React Query) v5
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Language**: TypeScript 5 (strict mode)

### 인프라
- **Container**: Docker + Docker Compose
- **Database**: PostgreSQL 16 Alpine
- **Node Image**: Node 20 Alpine

## 프로젝트 구조

```
├── backend/          # NestJS 백엔드 API (포트: 4000)
├── admin-app/        # React 관리자 앱 (포트: 3001)
├── customer-app/     # React 고객 앱 (포트: 3000) - 추후 구현
├── docker-compose.yml
├── docker-compose.dev.yml
└── .env.example
```

## 시작하기

### 사전 요구사항
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (Docker로 실행 가능)

### 환경 설정

```bash
# 환경 변수 파일 복사
cp .env.example .env

# 필요에 따라 .env 파일 수정
```

### Docker로 실행 (권장)

```bash
# 전체 서비스 실행 (프로덕션 모드)
docker-compose up -d

# 개발 모드 실행 (핫 리로드 지원)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 로컬 개발 환경

```bash
# PostgreSQL만 Docker로 실행
docker-compose up -d postgres

# 백엔드 실행
cd backend
npm install
npm run start:dev

# 관리자 앱 실행 (새 터미널)
cd admin-app
npm install
npm run dev
```

### 데이터베이스 마이그레이션

```bash
cd backend

# 마이그레이션 생성
npm run migration:generate -- src/database/migrations/MigrationName

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 롤백
npm run migration:revert
```

## 테스트

```bash
# 백엔드 단위 테스트
cd backend
npm run test

# 백엔드 테스트 커버리지
npm run test:cov

# 백엔드 E2E 테스트
npm run test:e2e

# 프론트엔드 테스트
cd admin-app
npm run test
```

## API 문서

백엔드 서버 실행 후 아래 URL에서 API 문서를 확인할 수 있습니다:
- API Base URL: `http://localhost:4000/api`

## 주요 포트

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Backend API | 4000 | NestJS REST API |
| Admin App | 3001 | 관리자 웹 앱 |
| Customer App | 3000 | 고객 주문 앱 |
| PostgreSQL | 5432 | 데이터베이스 |
