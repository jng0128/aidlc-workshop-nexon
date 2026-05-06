# Build Instructions - 테이블오더 서비스

## Prerequisites
- **Node.js**: 20 LTS
- **Docker**: 최신 버전 + Docker Compose v2
- **PostgreSQL**: 16 (Docker로 실행)
- **OS**: Windows / macOS / Linux
- **메모리**: 최소 4GB RAM

## 환경 변수 설정

```bash
# 프로젝트 루트에서
cp .env.example .env
```

`.env` 파일 내용:
```env
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=table_order
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=16h
BACKEND_PORT=4000
ADMIN_APP_PORT=3001
CUSTOMER_APP_PORT=3000
```

---

## 방법 1: Docker Compose (권장)

### 프로덕션 빌드 및 실행
```bash
# 전체 서비스 빌드 및 실행
docker-compose up -d --build

# 빌드 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

### 개발 모드 실행
```bash
# 개발 모드 (핫 리로드)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### 빌드 성공 확인
```bash
# 헬스체크
curl http://localhost:4000/api/health
# 기대 응답: {"status":"ok","timestamp":"...","services":{"database":"connected"}}

# 관리자 앱
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
# 기대: 200

# 고객 앱
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# 기대: 200
```

---

## 방법 2: 로컬 개발 환경

### 1. PostgreSQL 실행 (Docker)
```bash
docker-compose up -d postgres
```

### 2. 백엔드 빌드 및 실행
```bash
cd backend
npm install
npm run build          # TypeScript 컴파일
npm run start:dev      # 개발 모드 (watch)
```

### 3. 관리자 앱 빌드 및 실행
```bash
cd admin-app
npm install
npm run build          # 프로덕션 빌드
npm run dev            # 개발 모드 (Vite HMR)
```

### 4. 고객 앱 빌드 및 실행
```bash
cd customer-app
npm install
npm run build          # 프로덕션 빌드
npm run dev            # 개발 모드 (Vite HMR)
```

### 5. 시드 데이터 생성
```bash
cd backend
npm run seed
# 출력: Store created: store001, Admin created: admin
```

---

## 빌드 산출물

| 서비스 | 빌드 명령 | 산출물 위치 |
|--------|-----------|-------------|
| backend | `npm run build` | `backend/dist/` |
| admin-app | `npm run build` | `admin-app/dist/` |
| customer-app | `npm run build` | `customer-app/dist/` |

---

## Troubleshooting

### Docker 빌드 실패
- **원인**: Docker 데몬 미실행
- **해결**: Docker Desktop 실행 확인

### npm install 실패 (bcrypt)
- **원인**: 네이티브 모듈 빌드 도구 미설치
- **해결**: `npm install -g node-gyp` 또는 Docker 사용

### DB 연결 실패
- **원인**: PostgreSQL 미실행 또는 .env 설정 오류
- **해결**: `docker-compose up -d postgres` 후 .env 확인

### 포트 충돌
- **원인**: 4000, 3001, 3000, 5432 포트 사용 중
- **해결**: 해당 프로세스 종료 또는 .env에서 포트 변경
