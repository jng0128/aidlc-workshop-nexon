# Unit 1 (Admin) - 비즈니스 규칙

## 1. 인증 규칙

### BR-AUTH-01: 로그인 시도 제한
- 연속 5회 실패 시 계정 잠금
- 잠금 시간: 15분
- 잠금 해제 후 시도 횟수 리셋
- 성공 로그인 시 시도 횟수 리셋

### BR-AUTH-02: JWT 토큰 규칙
- 토큰 만료: 16시간
- Payload: { sub, role, storeId, tableId?, iat, exp }
- role: 'admin' | 'table'
- 만료된 토큰으로 요청 시 401 Unauthorized

### BR-AUTH-03: 비밀번호 규칙
- bcrypt 해싱 (salt rounds: 10)
- 최소 길이: 4자 (MVP 수준)

---

## 2. 카테고리 규칙

### BR-CAT-01: 카테고리명 중복 검증
- 동일 매장 내 카테고리명 중복 불가
- 대소문자 구분 없이 비교 (한국어는 그대로)

### BR-CAT-02: 카테고리 수정 시 Cascade Update
- 카테고리명 변경 시, 해당 카테고리에 속한 모든 메뉴의 categoryId는 변경 불필요 (FK 관계)
- 카테고리 엔티티의 name 필드만 업데이트하면 조회 시 자동 반영

### BR-CAT-03: 카테고리 삭제 보호 (Delete Protection)
- 카테고리에 1개 이상의 메뉴가 존재하면 삭제 불가
- 에러 메시지: "카테고리 내 메뉴가 존재하여 삭제할 수 없습니다"
- 메뉴를 모두 다른 카테고리로 이동하거나 삭제한 후에만 카테고리 삭제 가능

### BR-CAT-04: 카테고리 순서
- displayOrder 필드로 순서 관리
- 0부터 시작, 오름차순 정렬
- 순서 변경 시 관련 카테고리들의 displayOrder 일괄 업데이트

---

## 3. 메뉴 규칙

### BR-MENU-01: 필수 필드 검증
- 필수: name, price, categoryId
- 선택: description, imageUrl
- name: 1~100자
- price: 0 이상의 정수 (원 단위)

### BR-MENU-02: 가격 범위 검증
- 최소: 0 (무료 메뉴 허용)
- 최대: 10,000,000 (천만원)
- 정수만 허용 (소수점 불가)

### BR-MENU-03: 메뉴 순서
- 카테고리 내에서 displayOrder로 순서 관리
- 동일 카테고리 내 순서 변경만 가능

### BR-MENU-04: 카테고리 존재 검증
- 메뉴 생성/수정 시 categoryId가 유효한 카테고리를 참조하는지 확인
- 존재하지 않는 카테고리 ID 시 400 Bad Request

---

## 4. 주문 규칙

### BR-ORD-01: 주문 번호 생성
- 형식: `ORD-{YYYYMMDD}-{4자리 순번}`
- 예: `ORD-20260506-0001`
- 일별 순번 리셋 (매일 0001부터 시작)

### BR-ORD-02: 주문 상태 전이 규칙
| 현재 상태 | 허용 전이 |
|-----------|-----------|
| PENDING | PREPARING, CANCELLED |
| PREPARING | COMPLETED, CANCELLED |
| COMPLETED | (전이 불가) |
| CANCELLED | (전이 불가) |

- 허용되지 않은 전이 시도 시 400 Bad Request
- 에러 메시지: "현재 상태({현재})에서 {대상} 상태로 변경할 수 없습니다"

### BR-ORD-03: 주문 생성 규칙
- 최소 1개 이상의 OrderItem 필요
- 각 OrderItem의 quantity >= 1
- totalAmount = sum(quantity * unitPrice) for all items
- 서버에서 totalAmount 재계산 검증

### BR-ORD-04: 주문 삭제 규칙 (관리자 직권)
- 모든 상태의 주문 삭제 가능 (관리자 권한)
- 삭제 시 해당 테이블의 총 주문액 재계산
- 물리적 삭제 (soft delete 아님)

### BR-ORD-05: 주문 생성 시 세션 자동 시작
- 테이블에 활성 세션이 없으면 자동으로 새 세션 생성
- 활성 세션이 있으면 해당 세션에 주문 연결

---

## 5. 세션 규칙

### BR-SES-01: 세션 시작
- 첫 주문 생성 시 자동 시작 (명시적 시작 API 없음)
- 테이블당 동시에 1개의 ACTIVE 세션만 존재 가능

### BR-SES-02: 이용 완료 처리
- ACTIVE 세션만 완료 가능
- 완료 시 수행 작업:
  1. 세션 상태 → COMPLETED
  2. completedAt 기록
  3. 해당 세션의 모든 주문 → OrderHistory로 이동 (JSON 직렬화)
  4. 해당 세션의 Order, OrderItem 삭제
- 완료 후 새 주문 시 새 세션 자동 생성

### BR-SES-03: 과거 이력 조회
- 테이블별 과거 세션 목록 조회
- 시간 역순 정렬
- 날짜 필터링 지원 (startDate, endDate)

---

## 6. 테이블 규칙

### BR-TBL-01: 테이블 번호 유니크
- 동일 매장 내 테이블 번호 중복 불가
- 테이블 번호: 1 이상의 정수

### BR-TBL-02: 테이블 초기 설정
- 테이블 번호 + 비밀번호 설정
- 설정 완료 시 해당 테이블로 태블릿 로그인 가능

---

## 7. SSE 규칙

### BR-SSE-01: 이벤트 타입
| 이벤트 | 트리거 | 데이터 |
|--------|--------|--------|
| order:created | 주문 생성 | Order + OrderItems |
| order:statusChanged | 상태 변경 | orderId, tableId, newStatus |
| order:deleted | 주문 삭제 | orderId, tableId |
| session:completed | 이용 완료 | tableId |

### BR-SSE-02: 연결 관리
- 관리자 인증 필요 (JWT 검증)
- 하트비트: 30초 간격 ping
- 연결 끊김 시 클라이언트 자동 재연결 (EventSource 기본)
- 서버 재시작 시 모든 연결 해제 (클라이언트 재연결)
