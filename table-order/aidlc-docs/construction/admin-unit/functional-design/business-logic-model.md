# Unit 1 (Admin) - 비즈니스 로직 모델

## 1. 인증 흐름

### 관리자 로그인
```
Input: storeIdentifier, username, password
1. Store 조회 (identifier로)
   - 미존재 → 401 "매장을 찾을 수 없습니다"
2. Admin 조회 (storeId + username)
   - 미존재 → 401 "인증 정보가 올바르지 않습니다"
3. 로그인 시도 제한 확인
   - lockedUntil > now → 403 "계정이 잠겨있습니다. N분 후 다시 시도하세요"
4. 비밀번호 검증 (bcrypt.compare)
   - 실패 → loginAttempts++, 5회 도달 시 lockedUntil 설정 → 401
5. 성공 → loginAttempts = 0, JWT 발급
Output: { accessToken, expiresIn: '16h' }
```

### 테이블 로그인
```
Input: storeIdentifier, tableNumber, password
1. Store 조회 (identifier로)
   - 미존재 → 401
2. Table 조회 (storeId + tableNumber)
   - 미존재 → 401
3. 비밀번호 검증 (bcrypt.compare)
   - 실패 → 401
4. 성공 → JWT 발급 (role: 'table', tableId 포함)
Output: { accessToken, expiresIn: '16h' }
```

---

## 2. 카테고리 관리 흐름

### 카테고리 생성
```
Input: name, displayOrder?
1. 카테고리명 중복 확인 (동일 매장 내)
   - 중복 → 409 "이미 존재하는 카테고리명입니다"
2. displayOrder 미지정 시 → 현재 최대값 + 1
3. Category 엔티티 생성 및 저장
Output: Category
```

### 카테고리 수정
```
Input: categoryId, name?, displayOrder?
1. Category 조회
   - 미존재 → 404
2. name 변경 시 중복 확인
   - 중복 → 409
3. Category 업데이트
   (FK 관계이므로 메뉴의 categoryId는 변경 불필요)
Output: Category
```

### 카테고리 삭제
```
Input: categoryId
1. Category 조회
   - 미존재 → 404
2. 해당 카테고리의 메뉴 수 확인
   - 메뉴 존재 → 400 "카테고리 내 메뉴가 존재하여 삭제할 수 없습니다"
3. Category 삭제
Output: void (204 No Content)
```

---

## 3. 메뉴 관리 흐름

### 메뉴 생성
```
Input: name, price, description?, imageUrl?, categoryId, displayOrder?
1. 필수 필드 검증 (name, price, categoryId)
2. 가격 범위 검증 (0 <= price <= 10,000,000)
3. Category 존재 확인
   - 미존재 → 400 "유효하지 않은 카테고리입니다"
4. displayOrder 미지정 시 → 해당 카테고리 내 최대값 + 1
5. Menu 엔티티 생성 및 저장
Output: Menu
```

### 메뉴 순서 변경
```
Input: items[{ id, displayOrder }]
1. 모든 메뉴 ID 유효성 확인
2. 동일 카테고리 내 메뉴인지 확인
3. displayOrder 일괄 업데이트
Output: Menu[]
```

---

## 4. 주문 관리 흐름

### 주문 생성
```
Input: tableId, items[{ menuName, quantity, unitPrice }]
1. Table 존재 확인
2. 세션 확인/생성 (getOrCreateSession)
   - ACTIVE 세션 있으면 사용
   - 없으면 새 세션 생성
3. 주문 번호 생성 (ORD-YYYYMMDD-NNNN)
4. totalAmount 계산 (서버 측 재계산)
5. Order + OrderItems 저장
6. SSE 이벤트 발행 (order:created)
Output: Order (with items)
```

### 주문 상태 변경
```
Input: orderId, newStatus
1. Order 조회
   - 미존재 → 404
2. 상태 전이 유효성 검증
   - PENDING → PREPARING, CANCELLED (허용)
   - PREPARING → COMPLETED, CANCELLED (허용)
   - COMPLETED, CANCELLED → 어떤 전이도 불가 → 400
3. Order 상태 업데이트
4. SSE 이벤트 발행 (order:statusChanged)
Output: Order
```

### 주문 삭제 (관리자 직권)
```
Input: orderId
1. Order 조회 (with items)
   - 미존재 → 404
2. Order + OrderItems 삭제
3. SSE 이벤트 발행 (order:deleted)
Output: void (204 No Content)
```

---

## 5. 세션 관리 흐름

### 세션 조회/생성
```
Input: tableId
1. ACTIVE 세션 조회 (tableId, status = ACTIVE)
   - 존재 → 반환
   - 미존재 → 새 세션 생성 (status: ACTIVE, startedAt: now)
Output: TableSession
```

### 이용 완료 처리
```
Input: tableId
1. ACTIVE 세션 조회
   - 미존재 → 400 "활성 세션이 없습니다"
2. 해당 세션의 모든 주문 조회 (with items)
3. 각 주문을 OrderHistory로 변환
   - orderData: JSON.stringify({ order, items })
   - completedAt: now
4. OrderHistory 일괄 저장
5. 해당 세션의 OrderItems 삭제
6. 해당 세션의 Orders 삭제
7. 세션 상태 → COMPLETED, completedAt 기록
8. SSE 이벤트 발행 (session:completed)
Output: void (200 OK)
```

### 과거 이력 조회
```
Input: tableId, startDate?, endDate?
1. OrderHistory 조회 (tableId, 날짜 필터)
2. completedAt 역순 정렬
Output: OrderHistory[]
```

---

## 6. SSE 이벤트 흐름

### 구독
```
Input: HTTP GET /api/sse/orders (Authorization: Bearer {token})
1. JWT 검증 (admin role 확인)
2. SSE 연결 설정 (Content-Type: text/event-stream)
3. 클라이언트 등록 (clientId = UUID)
4. 하트비트 타이머 시작 (30초)
5. 연결 종료 시 클라이언트 제거
Output: EventSource stream
```

### 이벤트 발행
```
Input: event (type, data)
1. 등록된 모든 클라이언트에 이벤트 전송
2. 전송 실패 클라이언트 제거
Output: void
```
