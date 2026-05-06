# Unit 1 (Admin) - 프론트엔드 컴포넌트 설계

## 페이지 구조

```
admin-app/
├── LoginPage
├── Layout (인증 후 공통 레이아웃)
│   ├── Sidebar (네비게이션)
│   ├── DashboardPage (기본 화면)
│   │   ├── TableGrid
│   │   │   └── TableCard (반복)
│   │   └── OrderDetailModal
│   ├── TableManagementPage
│   │   ├── TableList
│   │   ├── TableSetupForm
│   │   └── OrderHistoryModal
│   ├── MenuManagementPage
│   │   ├── MenuList
│   │   └── MenuForm (생성/수정)
│   └── CategoryManagementPage
│       ├── CategoryList
│       └── CategoryForm (생성/수정)
```

---

## 1. LoginPage

### Props & State
```typescript
// State
interface LoginState {
  storeIdentifier: string;
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}
```

### 사용자 인터랙션
1. 매장 식별자, 사용자명, 비밀번호 입력
2. 로그인 버튼 클릭
3. 성공 → 대시보드로 이동, 토큰 저장
4. 실패 → 에러 메시지 표시

### API 연동
- `POST /api/auth/admin/login` → 토큰 발급

---

## 2. DashboardPage (주문 모니터링)

### Props & State
```typescript
interface DashboardState {
  tables: TableWithOrders[];
  selectedOrder: Order | null;
  isDetailModalOpen: boolean;
  filterTableId: number | null;
}

interface TableWithOrders {
  table: Table;
  currentOrders: Order[];
  totalAmount: number;
}
```

### 사용자 인터랙션
1. 테이블별 카드 그리드 표시
2. 신규 주문 시 카드 강조 (SSE 수신)
3. 카드 클릭 → 주문 상세 모달
4. 상태 변경 버튼 (대기중→준비중→완료, 취소)
5. 테이블 필터링

### API 연동
- `GET /api/tables` → 테이블 목록
- `GET /api/orders?tableId=` → 테이블별 주문
- `PATCH /api/orders/:id/status` → 상태 변경
- `DELETE /api/orders/:id` → 주문 삭제
- `GET /api/sse/orders` → SSE 구독

### SSE 이벤트 처리
```typescript
// SSE 이벤트 수신 시 TanStack Query 캐시 무효화
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'order:created':
      queryClient.invalidateQueries(['orders']);
      break;
    case 'order:statusChanged':
      queryClient.invalidateQueries(['orders']);
      break;
    case 'order:deleted':
      queryClient.invalidateQueries(['orders']);
      break;
    case 'session:completed':
      queryClient.invalidateQueries(['orders']);
      break;
  }
};
```

---

## 3. TableCard

### Props
```typescript
interface TableCardProps {
  table: Table;
  orders: Order[];
  totalAmount: number;
  isNew: boolean;  // 신규 주문 강조
  onClick: () => void;
}
```

### 표시 정보
- 테이블 번호
- 총 주문액
- 최신 주문 2~3개 미리보기 (메뉴명, 수량)
- 신규 주문 시 배경색 변경 + 애니메이션

---

## 4. OrderDetailModal

### Props
```typescript
interface OrderDetailModalProps {
  order: Order;
  items: OrderItem[];
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  onDelete: (orderId: number) => void;
}
```

### 사용자 인터랙션
1. 주문 전체 메뉴 목록 표시
2. 상태 변경 버튼 (현재 상태에 따라 활성/비활성)
3. 삭제 버튼 → 확인 팝업 → 삭제
4. 닫기 버튼

---

## 5. TableManagementPage

### Props & State
```typescript
interface TableManagementState {
  tables: Table[];
  selectedTable: Table | null;
  isSetupFormOpen: boolean;
  isHistoryModalOpen: boolean;
}
```

### 사용자 인터랙션
1. 테이블 목록 표시
2. 테이블 추가 (번호, 비밀번호 설정)
3. 이용 완료 버튼 → 확인 팝업 → 세션 종료
4. 과거 내역 버튼 → 이력 모달

### API 연동
- `GET /api/tables` → 테이블 목록
- `POST /api/tables` → 테이블 생성
- `POST /api/sessions/:tableId/complete` → 이용 완료
- `GET /api/sessions/:tableId/history` → 과거 이력

---

## 6. MenuManagementPage

### Props & State
```typescript
interface MenuManagementState {
  menus: Menu[];
  categories: Category[];
  selectedCategory: number | null;
  editingMenu: Menu | null;
  isFormOpen: boolean;
}
```

### 사용자 인터랙션
1. 카테고리별 메뉴 목록 표시
2. 메뉴 추가 버튼 → 폼 표시
3. 메뉴 수정 버튼 → 폼 (기존 데이터 채움)
4. 메뉴 삭제 버튼 → 확인 팝업
5. 순서 변경 (드래그 또는 화살표 버튼)

### 폼 검증 규칙
- name: 필수, 1~100자
- price: 필수, 0~10,000,000 정수
- categoryId: 필수, 유효한 카테고리
- description: 선택
- imageUrl: 선택, URL 형식 검증

### API 연동
- `GET /api/menus?categoryId=` → 메뉴 목록
- `POST /api/menus` → 메뉴 생성
- `PATCH /api/menus/:id` → 메뉴 수정
- `DELETE /api/menus/:id` → 메뉴 삭제
- `PATCH /api/menus/reorder` → 순서 변경

---

## 7. CategoryManagementPage

### Props & State
```typescript
interface CategoryManagementState {
  categories: Category[];
  editingCategory: Category | null;
  isFormOpen: boolean;
}
```

### 사용자 인터랙션
1. 카테고리 목록 표시 (순서대로)
2. 카테고리 추가 버튼 → 폼
3. 카테고리 수정 버튼 → 폼
4. 카테고리 삭제 버튼 → 확인 팝업 (메뉴 존재 시 에러)
5. 순서 변경

### 폼 검증 규칙
- name: 필수, 1~50자, 중복 불가

### API 연동
- `GET /api/categories` → 카테고리 목록
- `POST /api/categories` → 카테고리 생성
- `PATCH /api/categories/:id` → 카테고리 수정
- `DELETE /api/categories/:id` → 카테고리 삭제
- `PATCH /api/categories/reorder` → 순서 변경

---

## Zustand 스토어

### authStore
```typescript
interface AuthStore {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}
// persist: localStorage
```

### sseStore
```typescript
interface SseStore {
  isConnected: boolean;
  lastEvent: SseEvent | null;
  setConnected: (connected: boolean) => void;
  setLastEvent: (event: SseEvent) => void;
}
```
