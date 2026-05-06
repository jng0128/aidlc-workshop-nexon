# Unit 1 (Admin) - Infrastructure Design

## 배포 환경: Docker Compose (로컬/온프레미스)

---

## 1. 서비스 아키텍처

```
+--------------------------------------------------+
|              Docker Compose Network               |
|                                                   |
|  +-----------+  +-----------+  +-----------+     |
|  | admin-app |  |customer-app|  |  backend  |     |
|  |  (Nginx)  |  |  (Nginx)  |  |  (NestJS) |     |
|  |  :3001    |  |  :3000    |  |  :4000    |     |
|  +-----------+  +-----------+  +-----+-----+     |
|                                      |            |
|                                +-----v-----+     |
|                                | postgres   |     |
|                                | (PG 16)    |     |
|                                |  :5432     |     |
|                                +-----+-----+     |
|                                      |            |
|                                [pgdata volume]    |
+--------------------------------------------------+
```

---

## 2. 서비스 정의

### 2.1 postgres
| 항목 | 값 |
|------|-----|
| 이미지 | postgres:16-alpine |
| 포트 | 5432 (내부), 5432 (외부 - 개발용) |
| 볼륨 | pgdata:/var/lib/postgresql/data |
| 환경 변수 | POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB |
| 헬스체크 | pg_isready |
| 재시작 정책 | always |

### 2.2 backend
| 항목 | 값 |
|------|-----|
| 빌드 | ./backend (multi-stage Dockerfile) |
| 포트 | 4000 |
| 의존성 | postgres (healthy) |
| 환경 변수 | DB_*, JWT_*, BACKEND_PORT |
| 헬스체크 | HTTP GET /api/health |
| 재시작 정책 | always |

### 2.3 admin-app
| 항목 | 값 |
|------|-----|
| 빌드 | ./admin-app (multi-stage: build + nginx) |
| 포트 | 3001 |
| 의존성 | backend (healthy) |
| Nginx 설정 | SPA fallback, API 프록시 |
| 재시작 정책 | always |

### 2.4 customer-app (Unit 2에서 추가)
| 항목 | 값 |
|------|-----|
| 빌드 | ./customer-app (multi-stage: build + nginx) |
| 포트 | 3000 |
| 의존성 | backend (healthy) |
| Nginx 설정 | SPA fallback, API 프록시 |
| 재시작 정책 | always |

---

## 3. Dockerfile 설계

### backend/Dockerfile (Multi-stage)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

### admin-app/Dockerfile (Multi-stage)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3001
```

---

## 4. Nginx 설정

### admin-app/nginx.conf
```nginx
server {
    listen 3001;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SSE proxy (긴 연결 유지)
    location /api/sse/ {
        proxy_pass http://backend:4000/api/sse/;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
    }
}
```

---

## 5. docker-compose.yml 설계

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: always

  backend:
    build: ./backend
    ports:
      - "${BACKEND_PORT:-4000}:4000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-16h}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:4000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: always

  admin-app:
    build: ./admin-app
    ports:
      - "${ADMIN_APP_PORT:-3001}:3001"
    depends_on:
      backend:
        condition: service_healthy
    restart: always

  customer-app:
    build: ./customer-app
    ports:
      - "${CUSTOMER_APP_PORT:-3000}:3000"
    depends_on:
      backend:
        condition: service_healthy
    restart: always

volumes:
  pgdata:
```

---

## 6. 개발 환경 (docker-compose.dev.yml)

```yaml
version: '3.8'

services:
  postgres:
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend/src:/app/src
    command: npm run start:dev
    ports:
      - "4000:4000"

  admin-app:
    build:
      context: ./admin-app
      dockerfile: Dockerfile.dev
    volumes:
      - ./admin-app/src:/app/src
    command: npm run dev
    ports:
      - "3001:3001"
```

**개발 시 실행**: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

---

## 7. DB 초기화 전략

### 마이그레이션
- TypeORM CLI로 마이그레이션 생성/실행
- backend 컨테이너 시작 시 자동 실행: `synchronize: false`, `migrationsRun: true`

### 시드 데이터
- 초기 Store + Admin 계정 생성
- backend 시작 시 시드 스크립트 실행 (데이터 없을 때만)

```typescript
// seed data
{
  store: { identifier: 'store001', name: '테스트 매장' },
  admin: { username: 'admin', password: 'admin1234' }
}
```

---

## 8. 네트워크 및 보안

| 항목 | 설정 |
|------|------|
| Docker Network | 기본 bridge (compose 내부) |
| 외부 접근 | 포트 매핑으로 호스트 노출 |
| DB 접근 | backend만 접근 (내부 네트워크) |
| CORS | backend에서 admin-app, customer-app 도메인 허용 |
| 환경 변수 | .env 파일 (git에 포함하지 않음) |
