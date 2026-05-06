# Unit Test Execution - 테이블오더 서비스

## 백엔드 단위 테스트

### 실행 명령
```bash
cd backend

# 전체 테스트 실행
npm run test

# 특정 모듈 테스트
npm run test -- --testPathPattern=auth
npm run test -- --testPathPattern=category
npm run test -- --testPathPattern=menu
npm run test -- --testPathPattern=order
npm run test -- --testPathPattern=session

# 커버리지 포함
npm run test:cov

# Watch 모드 (개발 중)
npm run test:watch
```

### 테스트 파일 목록
| 파일 | 테스트 대상 | 테스트 수 |
|------|------------|-----------|
| `auth/auth.service.spec.ts` | AuthService | 10 |
| `category/category.service.spec.ts` | CategoryService | 4 |
| `menu/menu.service.spec.ts` | MenuService | 4 |
| `order/order.service.spec.ts` | OrderService | 5 |
| `session/session.service.spec.ts` | SessionService | 3 |

**총 예상 테스트**: 26개

### 기대 결과
```
Test Suites: 5 passed, 5 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        ~5s
```

### 커버리지 목표
- **Service 레이어**: 80% 이상
- **전체**: 60% 이상 (Controller, Module 제외)

### 테스트 실패 시
1. 실패한 테스트 확인: `npm run test -- --verbose`
2. 특정 테스트만 실행: `npm run test -- --testNamePattern="should login"`
3. 디버그 모드: `npm run test:debug`

---

## 프론트엔드 단위 테스트 (향후)

### admin-app
```bash
cd admin-app
npm run test
```

### customer-app
```bash
cd customer-app
npm run test
```

**참고**: MVP 단계에서는 백엔드 단위 테스트에 집중. 프론트엔드 테스트는 향후 추가.

---

## Property-Based Testing (PBT)

### 대상 (Partial 적용)
- 주문 금액 계산 (순수 함수)
- 주문 번호 생성 형식 검증
- OrderHistory JSON 직렬화/역직렬화

### 실행
```bash
cd backend
npm run test -- --testPathPattern=pbt
```

### PBT 테스트 작성 예시 (향후 추가)
```typescript
import * as fc from 'fast-check';

describe('Order Amount Calculation (PBT)', () => {
  it('total should equal sum of (quantity * unitPrice) for all items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            quantity: fc.integer({ min: 1, max: 100 }),
            unitPrice: fc.integer({ min: 0, max: 10000000 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (items) => {
          const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
          expect(total).toBeGreaterThanOrEqual(0);
          expect(total).toBe(items.reduce((s, i) => s + i.quantity * i.unitPrice, 0));
        }
      )
    );
  });
});
```
