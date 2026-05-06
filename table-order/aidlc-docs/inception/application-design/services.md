# 테이블오더 서비스 - 서비스 레이어 설계

## 서비스 오케스트레이션 패턴

### 설계 원칙
- 각 NestJS 모듈은 자체 Service를 가짐
- 모듈 간 통신은 NestJS DI(Dependency Injection)를 통해 Service 주입
- 복잡한 비즈니스 로직은 해당 도메인 Service에 캡슐화
- 크로스커팅 관심사(인증, SSE)는 별도 모듈로 분리

---

## 1. AuthService (인증 서비스)

**책임**: 인증/인가 처리, JWT 토큰 관리, 로그인 시도 제한

**오케스트레이션**:
- 관리자 로그인: AdminRepository 조회 → 비밀번호 검증 → JWT 발급
- 테이블 로그인: TableRepository 조회 → 비밀번호 검증 → JWT 발급
- Guards: JwtAuthGuard, RolesGuard (admin/table 역할 구분)

**의존성**: AdminRepository, TableRepository

---

## 2. CategoryService (카테고리 서비스)

**책임**: 카테고리 CRUD, cascade update, delete protection

**오케스트레이션**:
- 카테고리 수정: Category 업데이트 → MenuService.updateCategoryName() 호출 (cascade)
- 카테고리 삭제: Menu 존재 여부 확인 → 존재 시 거부, 미존재 시 삭제

**의존성**: CategoryRepository, MenuService

---

## 3. MenuService (메뉴 서비스)

**책임**: 메뉴 CRUD, 노출 순서 관리, 카테고리 동기화

**오케스트레이션**:
- 메뉴 생성: 카테고리 존재 확인 → 필드 검증 → 저장
- 카테고리명 동기화: CategoryService에서 호출 시 일괄 업데이트

**의존성**: MenuRepository, CategoryRepository

---

## 4. OrderService (주문 서비스)

**책임**: 주문 생성, 상태 관리, 삭제, 조회

**오케스트레이션**:
- 주문 생성: 세션 확인/생성 → 주문 저장 → SSE 이벤트 발행
- 상태 변경: 유효성 검증 (상태 전이 규칙) → 업데이트 → SSE 이벤트 발행
- 주문 삭제: 주문 삭제 → 테이블 총액 재계산 → SSE 이벤트 발행

**의존성**: OrderRepository, OrderItemRepository, SessionService, SseService

---

## 5. SessionService (세션 서비스)

**책임**: 테이블 세션 라이프사이클 관리

**오케스트레이션**:
- 세션 시작: 첫 주문 시 자동 생성 (getOrCreateSession)
- 이용 완료: 세션 종료 → 주문 이력 이동 → 현재 주문 리셋
- 이력 조회: 과거 세션별 주문 그룹화 조회

**의존성**: TableSessionRepository, OrderRepository, OrderHistoryRepository

---

## 6. SseService (실시간 이벤트 서비스)

**책임**: SSE 연결 관리, 이벤트 브로드캐스트

**오케스트레이션**:
- 클라이언트 연결: 관리자 SSE 구독 등록
- 이벤트 발행: OrderService에서 호출 → 모든 구독 클라이언트에 전송
- 연결 해제: 클라이언트 연결 종료 시 정리

**의존성**: 없음 (다른 서비스에서 주입받아 사용)

---

## 서비스 간 호출 흐름

### 주문 생성 흐름
```
고객 → OrderController.create()
         → SessionService.getOrCreateSession()
         → OrderService.create()
         → SseService.emitOrderEvent()
         → 관리자 대시보드 실시간 업데이트
```

### 이용 완료 흐름
```
관리자 → SessionController.complete()
          → SessionService.completeSession()
            → OrderRepository: 현재 주문 조회
            → OrderHistoryRepository: 이력 저장
            → OrderRepository: 현재 주문 삭제/리셋
            → SseService.emitStatusChange()
```

### 카테고리 수정 흐름
```
관리자 → CategoryController.update()
          → CategoryService.update()
            → CategoryRepository: 카테고리 업데이트
            → MenuService.updateCategoryName()
              → MenuRepository: 해당 카테고리 메뉴 일괄 업데이트
```
