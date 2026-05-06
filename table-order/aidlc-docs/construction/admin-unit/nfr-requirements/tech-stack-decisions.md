# Unit 1 (Admin) - Tech Stack Decisions

## 확정된 기술 스택

### 백엔드
| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|-----------|
| Node.js | 20 LTS | 런타임 | 안정적, LTS 지원 |
| NestJS | 10.x | 프레임워크 | 모듈 구조, DI, 데코레이터 |
| TypeScript | 5.x | 언어 | 타입 안전성, 개발 생산성 |
| TypeORM | 0.3.x | ORM | NestJS 통합, 마이그레이션 |
| PostgreSQL | 16 | 데이터베이스 | 관계형, 트랜잭션, JSONB |
| class-validator | latest | 입력 검증 | DTO 데코레이터 기반 |
| class-transformer | latest | 직렬화 | DTO 변환 |
| bcrypt | latest | 비밀번호 | 해싱 표준 |
| @nestjs/jwt | latest | 인증 | JWT 토큰 관리 |
| @nestjs/passport | latest | 인증 | Guard 패턴 |
| @nestjs/config | latest | 설정 | 환경 변수 관리 |

### 프론트엔드 (admin-app)
| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|-----------|
| React | 18.x | UI 라이브러리 | 컴포넌트 기반, 생태계 |
| Vite | 5.x | 빌드 도구 | 빠른 HMR, 간단한 설정 |
| TypeScript | 5.x | 언어 | 타입 안전성 |
| Zustand | 4.x | 상태 관리 | 가벼움, persist |
| TanStack Query | 5.x | 서버 상태 | 캐싱, 자동 갱신 |
| Axios | 1.x | HTTP 클라이언트 | 인터셉터, 에러 처리 |
| React Router | 6.x | 라우팅 | SPA 라우팅 |

### 개발 도구
| 기술 | 용도 |
|------|------|
| ESLint | 코드 린팅 |
| Prettier | 코드 포맷팅 |
| Jest | 단위/통합 테스트 |
| Supertest | API 테스트 |
| fast-check | Property-Based Testing |

### 인프라
| 기술 | 버전 | 용도 |
|------|------|------|
| Docker | latest | 컨테이너화 |
| Docker Compose | v2 | 서비스 오케스트레이션 |
| Nginx | alpine | 프론트엔드 서빙 |

---

## 패키지 구조

### backend/package.json 주요 의존성
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.0.0",
    "bcrypt": "^5.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "fast-check": "^3.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### admin-app/package.json 주요 의존성
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "zustand": "^4.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## Docker 구성 결정

### docker-compose.yml 서비스
| 서비스 | 이미지 | 포트 | 볼륨 |
|--------|--------|------|------|
| postgres | postgres:16-alpine | 5432 | pgdata (named) |
| backend | node:20-alpine (빌드) | 4000 | - |
| admin-app | nginx:alpine (빌드) | 3001 | - |
| customer-app | nginx:alpine (빌드) | 3000 | - (Unit 2) |

### 환경 변수 (.env)
```
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=tableorder
DB_PASSWORD=tableorder_password
DB_DATABASE=tableorder

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=16h

# App
BACKEND_PORT=4000
ADMIN_APP_PORT=3001
CUSTOMER_APP_PORT=3000
```

---

## 결정 근거 요약

| 결정 | 대안 | 선택 이유 |
|------|------|-----------|
| Node 20 LTS | Node 22 | 안정성 우선, LTS 지원 |
| TypeORM | Prisma | NestJS 공식 통합, 데코레이터 패턴 일관성 |
| PostgreSQL 16 | 15 | 최신 안정 버전, 성능 개선 |
| Vite | Webpack | 빠른 개발 서버, 간단한 설정 |
| Zustand | Redux | 소규모 앱에 적합, 보일러플레이트 최소 |
| Jest | Vitest | NestJS 기본 테스트 러너, 생태계 성숙 |
| Nginx alpine | Node serve | 프로덕션 성능, 정적 파일 서빙 최적화 |
