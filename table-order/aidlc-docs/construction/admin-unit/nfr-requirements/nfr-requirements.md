# Unit 1 (Admin) - NFR Requirements

## 1. 성능 (Performance)

| 항목 | 요구사항 | 근거 |
|------|----------|------|
| API 응답 시간 | < 500ms (95th percentile) | 소규모 운영, 단일 DB |
| SSE 이벤트 전달 | < 2초 | 요구사항 명시 |
| 페이지 로드 | < 3초 (초기 로드) | 태블릿 환경 고려 |
| DB 쿼리 | < 100ms | 소규모 데이터셋 |

### 성능 설계 결정
- 인덱스: tableId, sessionId, categoryId, status 필드에 인덱스 추가
- 페이지네이션: 과거 이력 조회에만 적용 (현재 주문은 소량)
- 캐싱: 불필요 (소규모, 실시간 데이터 위주)

---

## 2. 확장성 (Scalability)

| 항목 | 현재 규모 | 설계 한계 |
|------|-----------|-----------|
| 동시 접속 | 10명 이하 | 50명까지 무리 없음 |
| 테이블 수 | 1~10개 | 100개까지 확장 가능 |
| 일일 주문 | ~100건 | ~1,000건까지 |
| SSE 연결 | 1~2개 (관리자) | 10개까지 |

### 확장성 설계 결정
- 수평 확장 불필요 (단일 인스턴스 충분)
- DB 커넥션 풀: 10개 (소규모 충분)
- SSE: 인메모리 클라이언트 관리 (Redis 불필요)

---

## 3. 가용성 (Availability)

| 항목 | 요구사항 | 구현 방식 |
|------|----------|-----------|
| 목표 가용성 | 99% (매장 영업시간 기준) | Docker restart policy |
| 장애 복구 | 수동 재시작 허용 | docker-compose restart |
| 데이터 보존 | DB 볼륨 영속화 | Docker named volume |
| 세션 유지 | 서버 재시작 후 재로그인 | JWT 무상태 (DB 불필요) |

### 가용성 설계 결정
- Docker restart: `always` 정책
- DB 볼륨: named volume으로 데이터 영속화
- 백업: 수동 pg_dump (자동 백업 미구현 - MVP)
- 모니터링: Docker 로그 기반 (별도 모니터링 도구 미사용)

---

## 4. 보안 (Security)

| 항목 | 요구사항 | 구현 방식 |
|------|----------|-----------|
| 인증 | JWT 토큰 | @nestjs/jwt |
| 비밀번호 | bcrypt 해싱 | bcrypt (salt: 10) |
| 로그인 제한 | 5회 실패 시 15분 잠금 | DB 기반 카운터 |
| CORS | 프론트엔드 도메인만 허용 | NestJS CORS 설정 |
| 입력 검증 | DTO 기반 검증 | class-validator |
| SQL Injection | ORM 사용 | TypeORM 파라미터 바인딩 |

### 보안 설계 결정 (MVP 수준)
- HTTPS: Docker 환경에서는 리버스 프록시로 처리 (Nginx 또는 외부)
- Rate Limiting: 로그인 API에만 적용
- 보안 헤더: helmet 미들웨어 적용
- 환경 변수: JWT_SECRET, DB 비밀번호 등 .env 파일 관리

---

## 5. 신뢰성 (Reliability)

| 항목 | 요구사항 | 구현 방식 |
|------|----------|-----------|
| 에러 처리 | 일관된 에러 응답 형식 | NestJS Exception Filter |
| 트랜잭션 | 이용 완료 처리 시 | TypeORM QueryRunner |
| 데이터 정합성 | FK 제약조건 | PostgreSQL FK constraints |
| 로깅 | 요청/에러 로깅 | NestJS Logger |

### 신뢰성 설계 결정
- 이용 완료 처리: 트랜잭션으로 원자성 보장 (주문 이동 + 삭제 + 세션 종료)
- 주문 번호: 일별 순번으로 유니크 보장
- SSE 재연결: 클라이언트 EventSource 기본 재연결 활용

---

## 6. 유지보수성 (Maintainability)

| 항목 | 요구사항 | 구현 방식 |
|------|----------|-----------|
| 코드 품질 | TypeScript strict mode | tsconfig strict: true |
| 코드 스타일 | 일관된 포맷팅 | ESLint + Prettier |
| DB 마이그레이션 | 버전 관리 | TypeORM migrations |
| 환경 설정 | 환경별 분리 | @nestjs/config + .env |
| API 문서 | 자동 생성 | Swagger (선택) |

---

## 7. 테스트 전략

| 레벨 | 범위 | 도구 |
|------|------|------|
| 단위 테스트 | Service 비즈니스 로직 | Jest |
| 통합 테스트 | API 엔드포인트 | Supertest + Jest |
| E2E 테스트 | 주요 사용자 흐름 | (선택, MVP 이후) |

### PBT (Property-Based Testing) - Partial 적용
- 순수 함수: 주문 금액 계산, 주문 번호 생성
- 직렬화: OrderHistory JSON 직렬화/역직렬화 round-trip
- 도구: fast-check
