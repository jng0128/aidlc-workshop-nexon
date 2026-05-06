# 테이블오더 서비스 - 컴포넌트 메서드 정의

## 1. AuthModule

### AuthController
| 메서드 | HTTP | 엔드포인트 | 설명 |
|--------|------|-----------|------|
| `adminLogin()` | POST | `/api/auth/admin/login` | 관리자 로그인 (JWT 발급) |
| `tableLogin()` | POST | `/api/auth/table/login` | 테이블 태블릿 로그인 |
| `refreshToken()` | POST | `/api/auth/refresh` | 토큰 갱신 |
| `logout()` | POST | `/api/auth/logout` | 로그아웃 |

### AuthService
| 메서드 | 입력 | 출력 | 설명 |
|--------|------|------|------|
| `validateAdmin(storeId, username, password)` | string, string, string | Admin \| null | 관리자 인증 |
| `validateTable(storeId, tableNumber, password)` | string, number, string | Table \| null | 테이블 인증 |
| `generateToken(payload)` | JwtPayload | string | JWT 토큰 생성 |
| `checkLoginAttempts(identifier)` | string | boolean | 로그인 시도 제한 확인 |

---

## 2. CategoryModule

### CategoryController
| 메서드 | HTTP | 엔드포인트 | 설명 |
|--------|------|-----------|------|
| `findAll()` | GET | `/api/categories` | 카테고리 목록 조회 |
| `create(dto)` | POST | `/api/categories` | 카테고리 생성 |
| `update(id, dto)` | PATCH | `/api/categories/:id` | 카테고리 수정 (cascade) |
| `delete(id)` | DELETE | `/api/categories/:id` | 카테고리 삭제 (protection) |
| `reorder(dto)` | PATCH | `/api/categories/reorder` | 카테고리 순서 변경 |

### CategoryService
| 메서드 | 입력 | 출력 | 설명 |
|--------|------|------|------|
| `findAll()` | - | Category[] | 전체 카테고리 조회 (순서대로) |
| `create(dto)` | CreateCategoryDto | Category | 카테고리 생성 (중복 검증) |
| `update(id, dto)` | number, UpdateCategoryDto | Category | 수정 + 하위 메뉴 동기화 |
| `delete(id)` | number | void | 삭제 (메뉴 존재 시 거부) |
| `reorder(dto)` | ReorderDto | Category[] | 순서 변경 |

---

## 3. MenuModule

### MenuController
| 메서드 | HTTP | 엔드포인트 | 설명 |
|--------|------|-----------|------|
| `findAll(categoryId?)` | GET | `/api/menus` | 메뉴 목록 조회 (카테고리 필터) |
| `findOne(id)` | GET | `/api/menus/:id` | 메뉴 상세 조회 |
| `create(dto)` | POST | `/api/menus` | 메뉴 등록 |
| `update(id, dto)` | PATCH | `/api/menus/:id` | 메뉴 수정 |
| `delete(id)` | DELETE | `/api/menus/:id` | 메뉴 삭제 |
| `reorder(dto)` | PATCH | `/api/menus/reorder` | 메뉴 순서 변경 |

### MenuService
| 메서드 | 입력 | 출력 | 설명 |
|--------|------|------|------|
| `findAll(categoryId?)` | number? | Menu[] | 메뉴 조회 (카테고리별) |
| `findOne(id)` | number | Menu | 단일 메뉴 조회 |
| `create(dto)` | CreateMenuDto | Menu | 메뉴 생성 (검증 포함) |
| `update(id, dto)` | number, UpdateMenuDto | Menu | 메뉴 수정 |
| `delete(id)` | number | void | 메뉴 삭제 |
| `reorder(dto)` | ReorderDto | Menu[] | 순서 변경 |
| `updateCategoryName(oldName, newName)` | string, string | void | 카테고리명 변경 시 동기화 |

---

## 4. OrderModule

### OrderController
| 메서드 | HTTP | 엔드포인트 | 설명 |
|--------|------|-----------|------|
| `create(dto)` | POST | `/api/orders` | 주문 생성 |
| `findBySession(sessionId)` | GET | `/api/orders?sessionId=` | 세션별 주문 조회 |
| `findByTable(tableId)` | GET | `/api/orders?tableId=` | 테이블별 주문 조회 |
| `updateStatus(id, dto)` | PATCH | `/api/orders/:id/status` | 주문 상태 변경 |
| `delete(id)` | DELETE | `/api/orders/:id` | 주문 삭제 (관리자) |

### OrderService
| 메서드 | 입력 | 출력 | 설명 |
|--------|------|------|------|
| `create(dto)` | CreateOrderDto | Order | 주문 생성 + SSE 알림 |
| `findBySession(sessionId)` | string | Order[] | 세션별 주문 조회 |
| `findByTable(tableId)` | number | Order[] | 테이블별 현재 주문 |
| `updateStatus(id, status)` | number, OrderStatus | Order | 상태 변경 (유효성 검증) |
| `delete(id)` | number | void | 주문 삭제 + 총액 재계산 |
| `getTableTotal(tableId)` | number | number | 테이블 총 주문액 계산 |

---

## 5. TableModule

### TableController
| 메서드 | HTTP | 엔드포인트 | 설명 |
|--------|------|-----------|------|
| `findAll()` | GET | `/api/tables` | 테이블 목록 조회 |
| `create(dto)` | POST | `/api/tables` | 테이블 생성 (초기 설정) |
| `update(id, dto)` | PATCH | `/api/tables/:id` | 테이블 정보 수정 |

### TableService
| 메서드 | 입력 | 출력 | 설명 |
|--------|------|------|------|
| `findAll()` | - | Table[] | 전체 테이블 조회 |
| `create(dto)` | CreateTableDto | Table | 테이블 생성 |
| `update(id, dto)` | number, UpdateTableDto | Table | 테이블 수정 |
| `findByNumber(tableNumber)` | number | Table | 번호로 테이블 조회 |

---

## 6. SessionModule

### SessionController
| 메서드 | HTTP | 엔드포인트 | 설명 |
|--------|------|-----------|------|
| `getCurrent(tableId)` | GET | `/api/sessions/current?tableId=` | 현재 활성 세션 조회 |
| `complete(tableId)` | POST | `/api/sessions/:tableId/complete` | 이용 완료 처리 |
| `getHistory(tableId)` | GET | `/api/sessions/:tableId/history` | 과거 세션 이력 조회 |

### SessionService
| 메서드 | 입력 | 출력 | 설명 |
|--------|------|------|------|
| `getOrCreateSession(tableId)` | number | TableSession | 현재 세션 조회 또는 생성 |
| `completeSession(tableId)` | number | void | 세션 종료 + 주문 이력 이동 |
| `getHistory(tableId, dateFilter?)` | number, DateFilter? | OrderHistory[] | 과거 이력 조회 |

---

## 7. SseModule

### SseController
| 메서드 | HTTP | 엔드포인트 | 설명 |
|--------|------|-----------|------|
| `subscribe()` | GET | `/api/sse/orders` | SSE 구독 (관리자용) |

### SseService
| 메서드 | 입력 | 출력 | 설명 |
|--------|------|------|------|
| `addClient(clientId, response)` | string, Response | void | SSE 클라이언트 등록 |
| `removeClient(clientId)` | string | void | SSE 클라이언트 제거 |
| `emitOrderEvent(event)` | OrderEvent | void | 주문 이벤트 전송 |
| `emitStatusChange(event)` | StatusChangeEvent | void | 상태 변경 이벤트 전송 |

---

## API 엔드포인트 요약

### 고객용 API (테이블 인증 필요)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/table/login` | 테이블 로그인 |
| GET | `/api/categories` | 카테고리 목록 |
| GET | `/api/menus?categoryId=` | 메뉴 목록 |
| POST | `/api/orders` | 주문 생성 |
| GET | `/api/orders?sessionId=` | 주문 내역 조회 |

### 관리자용 API (관리자 인증 필요)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/admin/login` | 관리자 로그인 |
| GET | `/api/tables` | 테이블 목록 |
| POST | `/api/tables` | 테이블 생성 |
| GET | `/api/orders?tableId=` | 테이블별 주문 |
| PATCH | `/api/orders/:id/status` | 주문 상태 변경 |
| DELETE | `/api/orders/:id` | 주문 삭제 |
| POST | `/api/sessions/:tableId/complete` | 이용 완료 |
| GET | `/api/sessions/:tableId/history` | 과거 이력 |
| CRUD | `/api/categories` | 카테고리 관리 |
| CRUD | `/api/menus` | 메뉴 관리 |
| GET | `/api/sse/orders` | SSE 구독 |
