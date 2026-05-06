# 테이블오더 서비스 - 컴포넌트 의존성

## 의존성 매트릭스

| 모듈 | 의존하는 모듈 |
|------|--------------|
| **AuthModule** | StoreModule, TableModule |
| **CategoryModule** | MenuModule |
| **MenuModule** | CategoryModule |
| **OrderModule** | SessionModule, SseModule |
| **SessionModule** | OrderModule (Repository 레벨) |
| **SseModule** | 없음 (독립) |
| **TableModule** | 없음 (독립) |
| **StoreModule** | 없음 (독립) |

---

## 통신 패턴

### 프론트엔드 → 백엔드
- **HTTP REST**: 모든 CRUD 작업, 주문 생성, 상태 변경
- **SSE (단방향)**: 백엔드 → 관리자 앱 (실시간 주문 알림)

### 백엔드 내부
- **NestJS DI**: 모듈 간 Service 주입을 통한 동기 호출
- **TypeORM Relations**: 엔티티 간 관계를 통한 데이터 접근

### 백엔드 → 데이터베이스
- **TypeORM**: Repository 패턴을 통한 DB 접근
- **Connection Pool**: PostgreSQL 커넥션 풀 관리

---

## 데이터 흐름 다이어그램

### 고객 주문 흐름
```
[고객 앱]
    |
    | POST /api/orders
    v
[OrderController]
    |
    v
[OrderService]
    |--- SessionService.getOrCreateSession()
    |--- OrderRepository.save()
    |--- SseService.emitOrderEvent()
    |
    v
[SSE Channel] -----> [관리자 앱 대시보드]
```

### 관리자 모니터링 흐름
```
[관리자 앱]
    |
    | GET /api/sse/orders (SSE 구독)
    v
[SseController]
    |
    | EventSource 연결 유지
    v
[SseService]
    |
    | 주문 이벤트 수신 시
    v
[관리자 앱] <--- Server-Sent Event (실시간)
```

### 카테고리 Cascade 흐름
```
[관리자 앱]
    |
    | PATCH /api/categories/:id
    v
[CategoryController]
    |
    v
[CategoryService]
    |--- CategoryRepository.update()
    |--- MenuService.updateCategoryName()
    |       |
    |       v
    |    MenuRepository.updateMany()
    v
[응답 반환]
```

---

## 순환 의존성 방지

| 관계 | 해결 방법 |
|------|-----------|
| CategoryModule ↔ MenuModule | forwardRef() 사용 또는 Repository 직접 주입 |
| OrderModule ↔ SessionModule | SessionModule에서 OrderRepository 직접 주입 (Service 레벨 순환 방지) |

---

## 인증 흐름

```
[요청] → [JwtAuthGuard] → [RolesGuard] → [Controller]
              |                  |
              v                  v
        JWT 토큰 검증      역할 확인 (admin/table)
              |
              v
        req.user에 payload 주입
```

- **admin 역할**: 관리자 API 접근 가능
- **table 역할**: 고객 API 접근 가능 (메뉴 조회, 주문 생성, 내역 조회)
