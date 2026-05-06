# Unit 1 (Admin) - 도메인 엔티티 설계

## 엔티티 관계도 (ERD)

```
Store (1) ──── (N) Admin
Store (1) ──── (N) Table
Store (1) ──── (N) Category

Category (1) ──── (N) Menu

Table (1) ──── (N) TableSession
TableSession (1) ──── (N) Order
Order (1) ──── (N) OrderItem

Table (1) ──── (N) OrderHistory
```

---

## 엔티티 상세 정의

### Store (매장)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | number (PK) | auto-increment | 매장 고유 ID |
| identifier | string | unique, not null | 매장 식별자 (로그인용) |
| name | string | not null | 매장명 |
| createdAt | timestamp | default now | 생성 시각 |

---

### Admin (관리자)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | number (PK) | auto-increment | 관리자 고유 ID |
| username | string | not null | 사용자명 |
| passwordHash | string | not null | bcrypt 해시 비밀번호 |
| storeId | number (FK) | not null, references Store | 소속 매장 |
| loginAttempts | number | default 0 | 로그인 시도 횟수 |
| lockedUntil | timestamp | nullable | 잠금 해제 시각 |
| createdAt | timestamp | default now | 생성 시각 |

---

### Table (테이블)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | number (PK) | auto-increment | 테이블 고유 ID |
| tableNumber | number | not null | 테이블 번호 |
| passwordHash | string | not null | bcrypt 해시 비밀번호 |
| storeId | number (FK) | not null, references Store | 소속 매장 |
| createdAt | timestamp | default now | 생성 시각 |

**유니크 제약**: (storeId, tableNumber) 복합 유니크

---

### TableSession (테이블 세션)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | number (PK) | auto-increment | 세션 고유 ID |
| tableId | number (FK) | not null, references Table | 테이블 |
| status | enum | not null, default 'ACTIVE' | 세션 상태 |
| startedAt | timestamp | default now | 세션 시작 시각 |
| completedAt | timestamp | nullable | 이용 완료 시각 |

**상태 enum**: `ACTIVE`, `COMPLETED`

---

### Category (카테고리)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | number (PK) | auto-increment | 카테고리 고유 ID |
| name | string | not null | 카테고리명 |
| displayOrder | number | not null, default 0 | 노출 순서 |
| storeId | number (FK) | not null, references Store | 소속 매장 |
| createdAt | timestamp | default now | 생성 시각 |
| updatedAt | timestamp | default now | 수정 시각 |

**유니크 제약**: (storeId, name) 복합 유니크

---

### Menu (메뉴)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | number (PK) | auto-increment | 메뉴 고유 ID |
| name | string | not null | 메뉴명 |
| price | number | not null, >= 0 | 가격 |
| description | string | nullable | 메뉴 설명 |
| imageUrl | string | nullable | 이미지 URL |
| categoryId | number (FK) | not null, references Category | 카테고리 |
| displayOrder | number | not null, default 0 | 노출 순서 |
| storeId | number (FK) | not null, references Store | 소속 매장 |
| createdAt | timestamp | default now | 생성 시각 |
| updatedAt | timestamp | default now | 수정 시각 |

---

### Order (주문)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | number (PK) | auto-increment | 주문 고유 ID |
| orderNumber | string | not null, unique | 주문 번호 (표시용) |
| tableId | number (FK) | not null, references Table | 테이블 |
| sessionId | number (FK) | not null, references TableSession | 세션 |
| status | enum | not null, default 'PENDING' | 주문 상태 |
| totalAmount | number | not null | 총 주문 금액 |
| createdAt | timestamp | default now | 주문 시각 |
| updatedAt | timestamp | default now | 상태 변경 시각 |

**상태 enum**: `PENDING`, `PREPARING`, `COMPLETED`, `CANCELLED`

---

### OrderItem (주문 항목)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | number (PK) | auto-increment | 항목 고유 ID |
| orderId | number (FK) | not null, references Order | 주문 |
| menuName | string | not null | 메뉴명 (스냅샷) |
| quantity | number | not null, >= 1 | 수량 |
| unitPrice | number | not null, >= 0 | 단가 (스냅샷) |

**참고**: menuName과 unitPrice는 주문 시점의 스냅샷 (메뉴 변경에 영향 받지 않음)

---

### OrderHistory (과거 주문 이력)
| 필드 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | number (PK) | auto-increment | 이력 고유 ID |
| tableId | number (FK) | not null, references Table | 테이블 |
| sessionId | number | not null | 원본 세션 ID |
| orderNumber | string | not null | 주문 번호 |
| orderData | jsonb | not null | 주문 전체 데이터 (JSON) |
| totalAmount | number | not null | 총 금액 |
| orderedAt | timestamp | not null | 원본 주문 시각 |
| completedAt | timestamp | not null | 이용 완료 시각 |

**참고**: 세션 종료 시 Order + OrderItem을 JSON으로 직렬화하여 저장
