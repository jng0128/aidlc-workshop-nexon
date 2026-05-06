# Unit 1 (Admin) - Deployment Architecture

## 배포 프로세스

### 프로덕션 배포
```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일 수정 (DB 비밀번호, JWT 시크릿 등)

# 2. 빌드 및 실행
docker-compose up -d --build

# 3. 마이그레이션 확인 (자동 실행됨)
docker-compose logs backend | grep "migration"

# 4. 헬스체크 확인
curl http://localhost:4000/api/health
curl http://localhost:3001
curl http://localhost:3000
```

### 업데이트 배포
```bash
# 1. 코드 업데이트
git pull origin main

# 2. 재빌드 및 재시작
docker-compose up -d --build

# 3. 무중단 배포 (선택)
docker-compose up -d --build --no-deps backend
docker-compose up -d --build --no-deps admin-app
```

---

## 운영 명령어

### 로그 확인
```bash
docker-compose logs -f backend      # 백엔드 로그
docker-compose logs -f postgres     # DB 로그
docker-compose logs -f admin-app    # 관리자 앱 로그
```

### DB 백업/복원
```bash
# 백업
docker-compose exec postgres pg_dump -U tableorder tableorder > backup.sql

# 복원
docker-compose exec -T postgres psql -U tableorder tableorder < backup.sql
```

### 서비스 관리
```bash
docker-compose ps          # 상태 확인
docker-compose restart     # 전체 재시작
docker-compose down        # 중지 (데이터 유지)
docker-compose down -v     # 중지 + 볼륨 삭제 (데이터 삭제!)
```

---

## 환경별 설정

### .env.example
```env
# Database
DB_USERNAME=tableorder
DB_PASSWORD=change_me_in_production
DB_DATABASE=tableorder

# JWT
JWT_SECRET=change_me_in_production_use_random_string
JWT_EXPIRES_IN=16h

# Ports
BACKEND_PORT=4000
ADMIN_APP_PORT=3001
CUSTOMER_APP_PORT=3000
```

### 개발 환경 vs 프로덕션
| 항목 | 개발 | 프로덕션 |
|------|------|----------|
| 소스 마운트 | 볼륨 마운트 (HMR) | 빌드된 이미지 |
| DB 동기화 | synchronize: true | migrationsRun: true |
| 로그 레벨 | debug | warn |
| CORS | localhost:* | 특정 도메인 |
| 소스맵 | 포함 | 제외 |

---

## 모니터링 (MVP 수준)

| 항목 | 방법 |
|------|------|
| 서비스 상태 | docker-compose ps |
| 로그 | docker-compose logs |
| DB 상태 | pg_isready 헬스체크 |
| API 상태 | /api/health 엔드포인트 |
| 디스크 | docker system df |

### /api/health 엔드포인트 응답
```json
{
  "status": "ok",
  "timestamp": "2026-05-06T12:00:00.000Z",
  "services": {
    "database": "connected",
    "sse": "active"
  }
}
```

---

## 확장 경로 (향후)

현재 Docker Compose 단일 호스트에서 운영하지만, 향후 확장 시:

| 현재 | 확장 시 |
|------|---------|
| Docker Compose | Docker Swarm 또는 K8s |
| 단일 PostgreSQL | RDS 또는 Cloud SQL |
| 로컬 볼륨 | EBS 또는 Cloud Storage |
| 수동 배포 | CI/CD 파이프라인 |
| 로그 파일 | CloudWatch 또는 ELK |
