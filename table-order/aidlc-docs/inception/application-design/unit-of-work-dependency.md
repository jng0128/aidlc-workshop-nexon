# 테이블오더 서비스 - Unit of Work 의존성

## 의존성 매트릭스

| 유닛 | 의존 대상 | 의존 유형 |
|------|-----------|-----------|
| **Unit 1 (관리자)** | 없음 | 독립 (인프라 포함) |
| **Unit 2 (고객)** | Unit 1 | 백엔드 API 사용 |

---

## 개발 순서

```
Phase 1: Unit 1 (관리자 유닛)
├── 백엔드 전체 구축 (DB, API, SSE)
├── 관리자 프론트엔드 구축
├── Docker Compose 구성
└── 통합 테스트

Phase 2: Unit 2 (고객 유닛) — Phase 1 완료 후 또는 API 안정화 후 병렬 시작
├── 고객 프론트엔드 구축
├── 백엔드 API 연동
├── i18n 적용
└── 통합 테스트
```

---

## 통합 포인트

### Unit 1 → Unit 2 제공 인터페이스

| 인터페이스 | 유형 | 설명 |
|-----------|------|------|
| `/api/auth/table/login` | REST API | 테이블 인증 토큰 발급 |
| `/api/categories` | REST API | 카테고리 목록 조회 |
| `/api/menus` | REST API | 메뉴 목록 조회 |
| `/api/orders` (POST) | REST API | 주문 생성 |
| `/api/orders` (GET) | REST API | 주문 내역 조회 |
| JWT 토큰 스키마 | 데이터 계약 | 토큰 payload 구조 |

### 공유 리소스

| 리소스 | 소유 유닛 | 사용 유닛 |
|--------|-----------|-----------|
| PostgreSQL DB | Unit 1 | Unit 1 (직접), Unit 2 (API 통해) |
| Docker Network | Unit 1 | Unit 1, Unit 2 |
| JWT Secret | Unit 1 | Unit 1 (발급+검증) |

---

## 병렬 개발 조건

Unit 2는 다음 조건이 충족되면 병렬 개발 시작 가능:
1. ✅ 백엔드 API 엔드포인트 구현 완료 (고객용 5개)
2. ✅ JWT 인증 흐름 동작 확인
3. ✅ DB 스키마 안정화 (Menu, Category, Order 테이블)

---

## 위험 요소 및 완화

| 위험 | 영향 | 완화 방법 |
|------|------|-----------|
| API 스펙 변경 | Unit 2 재작업 | API 스펙을 먼저 확정하고 Unit 1에서 구현 |
| DB 스키마 변경 | 양쪽 영향 | Unit 1에서 스키마 먼저 확정 |
| SSE 이벤트 구조 변경 | Unit 2 영향 없음 | SSE는 관리자 전용이므로 Unit 2에 영향 없음 |
