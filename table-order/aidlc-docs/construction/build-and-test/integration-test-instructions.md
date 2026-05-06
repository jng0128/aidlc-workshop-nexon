# Integration Test Instructions - 테이블오더 서비스

## 목적
백엔드 API 엔드포인트의 통합 동작을 검증합니다 (Controller → Service → Repository → DB).

## 환경 설정

### 1. 테스트 DB 실행
```bash
docker-compose up -d postgres
```

### 2. 환경 변수 설정
```bash
# backend/.env.test
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=table_order_test
JWT_SECRET=test-secret
JWT_EXPIRES_IN=1h
NODE_ENV=test
```

### 3. 테스트 DB 생성
```bash
docker-compose exec postgres createdb -U postgres table_order_test
```

---

## 통합 테스트 시나리오

### Scenario 1: 인증 흐름
1. 시드 데이터 생성 (Store + Admin)
2. POST /api/auth/admin/login → 토큰 발급 확인
3. 잘못된 비밀번호 5회 → 계정 잠금 확인
4. POST /api/auth/table/login → 테이블 토큰 발급 확인

### Scenario 2: 메뉴/카테고리 관리 흐름
1. 관리자 로그인
2. POST /api/categories → 카테고리 생성
3. POST /api/menus → 메뉴 생성 (카테고리 연결)
4. DELETE /api/categories/:id → 메뉴 존재 시 거부 확인
5. DELETE /api/menus/:id → 메뉴 삭제
6. DELETE /api/categories/:id → 성공 확인

### Scenario 3: 주문 생성 → 모니터링 → 완료 흐름
1. 테이블 로그인
2. POST /api/orders → 주문 생성 (세션 자동 생성 확인)
3. GET /api/orders?sessionId= → 주문 조회
4. 관리자 로그인
5. PATCH /api/orders/:id/status → 상태 변경 (PENDING → PREPARING → COMPLETED)
6. 잘못된 전이 시도 → 400 에러 확인

### Scenario 4: 세션 이용 완료 흐름
1. 테이블 로그인 → 주문 2건 생성
2. 관리자 로그인
3. POST /api/sessions/:tableId/complete → 이용 완료
4. GET /api/sessions/:tableId/history → 이력 확인
5. 테이블에서 새 주문 → 새 세션 생성 확인

### Scenario 5: SSE 실시간 이벤트
1. 관리자 SSE 구독 (GET /api/sse/orders?token=)
2. 테이블에서 주문 생성
3. SSE 이벤트 수신 확인 (order:created)
4. 관리자가 상태 변경
5. SSE 이벤트 수신 확인 (order:statusChanged)

---

## 실행 방법

### E2E 테스트 (Supertest)
```bash
cd backend

# E2E 테스트 실행
npm run test:e2e
```

### 수동 통합 테스트 (curl)
```bash
# 1. 서비스 시작
docker-compose up -d

# 2. 시드 데이터
cd backend && npm run seed

# 3. 관리자 로그인
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"storeIdentifier":"store001","username":"admin","password":"admin1234"}' \
  | jq -r '.accessToken')

# 4. 카테고리 생성
curl -X POST http://localhost:4000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"메인 메뉴"}'

# 5. 메뉴 생성
curl -X POST http://localhost:4000/api/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"김치찌개","price":9000,"categoryId":1}'

# 6. 테이블 생성
curl -X POST http://localhost:4000/api/tables \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"tableNumber":1,"password":"1234"}'

# 7. 테이블 로그인
TABLE_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/table/login \
  -H "Content-Type: application/json" \
  -d '{"storeIdentifier":"store001","tableNumber":1,"password":"1234"}' \
  | jq -r '.accessToken')

# 8. 주문 생성
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TABLE_TOKEN" \
  -d '{"items":[{"menuName":"김치찌개","quantity":2,"unitPrice":9000}]}'
```

---

## 정리
```bash
# 테스트 DB 삭제
docker-compose exec postgres dropdb -U postgres table_order_test

# 전체 서비스 중지
docker-compose down
```
