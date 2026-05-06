# Unit 1 (Admin) - 백엔드 API 명세

## 개요
이 문서는 Unit 2 (고객 앱)가 병렬 개발할 수 있도록 확정된 API 계약(contract)을 정의합니다.

**Base URL**: `http://localhost:4000/api`
**인증**: Bearer Token (JWT)
**Content-Type**: `application/json`

---

## 공통 응답 형식

### 성공 응답
```json
{
  "statusCode": 200,
  "data": { ... }
}
```

### 에러 응답
```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

### 공통 HTTP 상태 코드
| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 204 | 삭제 성공 (본문 없음) |
| 400 | 잘못된 요청 (검증 실패) |
| 401 | 인증 실패 |
| 403 | 권한 없음 / 계정 잠금 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복) |

---

## 1. 인증 API

### POST /api/auth/table/login
**설명**: 테이블 태블릿 로그인 (고객용)
**인증**: 불필요

**Request Body**:
```json
{
  "storeIdentifier": "string",
  "tableNumber": 1,
  "password": "string"
}
```

**Response 200**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "16h",
  "table": {
    "id": 1,
    "tableNumber": 1,
    "storeId": 1
  }
}
```

**Response 401**:
```json
{
  "statusCode": 401,
  "message": "인증 정보가 올바르지 않습니다",
  "error": "Unauthorized"
}
```

---

### POST /api/auth/admin/login
**설명**: 관리자 로그인
**인증**: 불필요

**Request Body**:
```json
{
  "storeIdentifier": "string",
  "username": "string",
  "password": "string"
}
```

**Response 200**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "16h",
  "admin": {
    "id": 1,
    "username": "admin",
    "storeId": 1
  }
}
```

**Response 401**: 인증 실패
**Response 403**: 계정 잠금 (`"계정이 잠겨있습니다. N분 후 다시 시도하세요"`)

---

## 2. 카테고리 API

### GET /api/categories
**설명**: 카테고리 목록 조회 (순서대로)
**인증**: Bearer Token (admin 또는 table)

**Response 200**:
```json
[
  {
    "id": 1,
    "name": "메인 메뉴",
    "displayOrder": 0,
    "storeId": 1,
    "createdAt": "2026-05-06T00:00:00.000Z",
    "updatedAt": "2026-05-06T00:00:00.000Z"
  },
  {
    "id": 2,
    "name": "사이드",
    "displayOrder": 1,
    "storeId": 1,
    "createdAt": "2026-05-06T00:00:00.000Z",
    "updatedAt": "2026-05-06T00:00:00.000Z"
  }
]
```

---

### POST /api/categories
**설명**: 카테고리 생성
**인증**: Bearer Token (admin only)

**Request Body**:
```json
{
  "name": "string (필수, 1~50자)",
  "displayOrder": 0
}
```

**Response 201**:
```json
{
  "id": 3,
  "name": "음료",
  "displayOrder": 2,
  "storeId": 1,
  "createdAt": "2026-05-06T00:00:00.000Z",
  "updatedAt": "2026-05-06T00:00:00.000Z"
}
```

**Response 409**: `"이미 존재하는 카테고리명입니다"`

---

### PATCH /api/categories/:id
**설명**: 카테고리 수정 (cascade: 하위 메뉴 자동 반영)
**인증**: Bearer Token (admin only)

**Request Body**:
```json
{
  "name": "string (선택)",
  "displayOrder": 0
}
```

**Response 200**: 수정된 Category 객체

---

### DELETE /api/categories/:id
**설명**: 카테고리 삭제 (메뉴 존재 시 거부)
**인증**: Bearer Token (admin only)

**Response 204**: 삭제 성공 (본문 없음)
**Response 400**: `"카테고리 내 메뉴가 존재하여 삭제할 수 없습니다"`

---

### PATCH /api/categories/reorder
**설명**: 카테고리 순서 변경
**인증**: Bearer Token (admin only)

**Request Body**:
```json
{
  "items": [
    { "id": 1, "displayOrder": 0 },
    { "id": 2, "displayOrder": 1 },
    { "id": 3, "displayOrder": 2 }
  ]
}
```

**Response 200**: 업데이트된 Category[] 배열

---

## 3. 메뉴 API

### GET /api/menus
**설명**: 메뉴 목록 조회
**인증**: Bearer Token (admin 또는 table)

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| categoryId | number | 선택 | 카테고리 필터 |

**Response 200**:
```json
[
  {
    "id": 1,
    "name": "김치찌개",
    "price": 9000,
    "description": "매콤한 김치찌개",
    "imageUrl": "https://example.com/kimchi.jpg",
    "categoryId": 1,
    "displayOrder": 0,
    "storeId": 1,
    "category": {
      "id": 1,
      "name": "메인 메뉴"
    },
    "createdAt": "2026-05-06T00:00:00.000Z",
    "updatedAt": "2026-05-06T00:00:00.000Z"
  }
]
```

---

### GET /api/menus/:id
**설명**: 메뉴 상세 조회
**인증**: Bearer Token (admin 또는 table)

**Response 200**: 단일 Menu 객체 (위와 동일 구조)
**Response 404**: 메뉴 없음

---

### POST /api/menus
**설명**: 메뉴 등록
**인증**: Bearer Token (admin only)

**Request Body**:
```json
{
  "name": "string (필수, 1~100자)",
  "price": 9000,
  "description": "string (선택)",
  "imageUrl": "string (선택, URL 형식)",
  "categoryId": 1,
  "displayOrder": 0
}
```

**Response 201**: 생성된 Menu 객체
**Response 400**: 검증 실패 (필수 필드 누락, 가격 범위 초과, 카테고리 미존재)

---

### PATCH /api/menus/:id
**설명**: 메뉴 수정
**인증**: Bearer Token (admin only)

**Request Body**: POST와 동일 (모든 필드 선택)
**Response 200**: 수정된 Menu 객체

---

### DELETE /api/menus/:id
**설명**: 메뉴 삭제
**인증**: Bearer Token (admin only)

**Response 204**: 삭제 성공
**Response 404**: 메뉴 없음

---

### PATCH /api/menus/reorder
**설명**: 메뉴 순서 변경
**인증**: Bearer Token (admin only)

**Request Body**:
```json
{
  "items": [
    { "id": 1, "displayOrder": 0 },
    { "id": 2, "displayOrder": 1 }
  ]
}
```

**Response 200**: 업데이트된 Menu[] 배열

---

## 4. 주문 API

### POST /api/orders
**설명**: 주문 생성
**인증**: Bearer Token (table)

**Request Body**:
```json
{
  "items": [
    {
      "menuName": "김치찌개",
      "quantity": 2,
      "unitPrice": 9000
    },
    {
      "menuName": "된장찌개",
      "quantity": 1,
      "unitPrice": 8000
    }
  ]
}
```

**참고**: tableId와 sessionId는 JWT 토큰에서 추출 (클라이언트가 전송하지 않음)

**Response 201**:
```json
{
  "id": 1,
  "orderNumber": "ORD-20260506-0001",
  "tableId": 1,
  "sessionId": 1,
  "status": "PENDING",
  "totalAmount": 26000,
  "items": [
    {
      "id": 1,
      "menuName": "김치찌개",
      "quantity": 2,
      "unitPrice": 9000
    },
    {
      "id": 2,
      "menuName": "된장찌개",
      "quantity": 1,
      "unitPrice": 8000
    }
  ],
  "createdAt": "2026-05-06T12:30:00.000Z"
}
```

**Response 400**: 검증 실패 (빈 items, quantity < 1)

---

### GET /api/orders
**설명**: 주문 목록 조회
**인증**: Bearer Token (admin 또는 table)

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| sessionId | number | 선택 | 세션별 조회 (고객용) |
| tableId | number | 선택 | 테이블별 조회 (관리자용) |

**Response 200**:
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-20260506-0001",
    "tableId": 1,
    "sessionId": 1,
    "status": "PENDING",
    "totalAmount": 26000,
    "items": [
      {
        "id": 1,
        "menuName": "김치찌개",
        "quantity": 2,
        "unitPrice": 9000
      }
    ],
    "createdAt": "2026-05-06T12:30:00.000Z",
    "updatedAt": "2026-05-06T12:30:00.000Z"
  }
]
```

**정렬**: createdAt 오름차순 (오래된 주문 먼저)

---

### PATCH /api/orders/:id/status
**설명**: 주문 상태 변경
**인증**: Bearer Token (admin only)

**Request Body**:
```json
{
  "status": "PREPARING"
}
```

**허용 값**: `"PREPARING"`, `"COMPLETED"`, `"CANCELLED"`

**Response 200**: 업데이트된 Order 객체
**Response 400**: `"현재 상태(COMPLETED)에서 CANCELLED 상태로 변경할 수 없습니다"`
**Response 404**: 주문 없음

---

### DELETE /api/orders/:id
**설명**: 주문 삭제 (관리자 직권)
**인증**: Bearer Token (admin only)

**Response 204**: 삭제 성공
**Response 404**: 주문 없음

---

## 5. 세션 API

### GET /api/sessions/current
**설명**: 현재 활성 세션 조회
**인증**: Bearer Token (table)

**참고**: tableId는 JWT에서 추출

**Response 200**:
```json
{
  "id": 1,
  "tableId": 1,
  "status": "ACTIVE",
  "startedAt": "2026-05-06T11:00:00.000Z",
  "completedAt": null
}
```

**Response 200 (세션 없음)**:
```json
null
```

---

### POST /api/sessions/:tableId/complete
**설명**: 이용 완료 처리
**인증**: Bearer Token (admin only)

**Response 200**:
```json
{
  "message": "이용 완료 처리되었습니다",
  "tableId": 1,
  "completedAt": "2026-05-06T14:00:00.000Z"
}
```

**Response 400**: `"활성 세션이 없습니다"`

---

### GET /api/sessions/:tableId/history
**설명**: 과거 주문 이력 조회
**인증**: Bearer Token (admin only)

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| startDate | string (ISO) | 선택 | 시작 날짜 |
| endDate | string (ISO) | 선택 | 종료 날짜 |

**Response 200**:
```json
[
  {
    "id": 1,
    "tableId": 1,
    "sessionId": 1,
    "orderNumber": "ORD-20260506-0001",
    "orderData": {
      "items": [
        { "menuName": "김치찌개", "quantity": 2, "unitPrice": 9000 }
      ]
    },
    "totalAmount": 18000,
    "orderedAt": "2026-05-06T12:30:00.000Z",
    "completedAt": "2026-05-06T14:00:00.000Z"
  }
]
```

**정렬**: completedAt 내림차순 (최신 먼저)

---

## 6. 테이블 API

### GET /api/tables
**설명**: 테이블 목록 조회
**인증**: Bearer Token (admin only)

**Response 200**:
```json
[
  {
    "id": 1,
    "tableNumber": 1,
    "storeId": 1,
    "createdAt": "2026-05-06T00:00:00.000Z"
  }
]
```

---

### POST /api/tables
**설명**: 테이블 생성 (초기 설정)
**인증**: Bearer Token (admin only)

**Request Body**:
```json
{
  "tableNumber": 1,
  "password": "string"
}
```

**Response 201**: 생성된 Table 객체 (passwordHash 제외)
**Response 409**: `"이미 존재하는 테이블 번호입니다"`

---

## 7. SSE API

### GET /api/sse/orders
**설명**: 실시간 주문 이벤트 구독
**인증**: Bearer Token (admin only, query param으로 전달)

**연결**: `GET /api/sse/orders?token={accessToken}`

**이벤트 형식**:
```
event: order:created
data: {"type":"order:created","order":{"id":1,"orderNumber":"ORD-20260506-0001","tableId":1,"status":"PENDING","totalAmount":26000,"items":[...],"createdAt":"..."}}

event: order:statusChanged
data: {"type":"order:statusChanged","orderId":1,"tableId":1,"newStatus":"PREPARING"}

event: order:deleted
data: {"type":"order:deleted","orderId":1,"tableId":1}

event: session:completed
data: {"type":"session:completed","tableId":1}

event: ping
data: {"type":"ping","timestamp":"2026-05-06T12:30:00.000Z"}
```

**하트비트**: 30초 간격 ping 이벤트

---

## JWT 토큰 구조

### Payload (admin)
```json
{
  "sub": "1",
  "role": "admin",
  "storeId": 1,
  "iat": 1746489600,
  "exp": 1746547200
}
```

### Payload (table)
```json
{
  "sub": "1",
  "role": "table",
  "storeId": 1,
  "tableId": 1,
  "iat": 1746489600,
  "exp": 1746547200
}
```

---

## 고객 앱 (Unit 2)이 사용하는 API 요약

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/api/auth/table/login` | 테이블 로그인 | 불필요 |
| GET | `/api/categories` | 카테고리 목록 | table |
| GET | `/api/menus?categoryId=` | 메뉴 목록 | table |
| GET | `/api/menus/:id` | 메뉴 상세 | table |
| POST | `/api/orders` | 주문 생성 | table |
| GET | `/api/orders?sessionId=` | 주문 내역 | table |
| GET | `/api/sessions/current` | 현재 세션 | table |

이 7개 엔드포인트의 Request/Response 형식이 확정되었으므로, Unit 2는 이 명세를 기반으로 독립적으로 개발할 수 있습니다.
