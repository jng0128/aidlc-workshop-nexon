# Unit of Work Plan - 테이블오더 서비스

## 계획 개요
테이블오더 서비스를 관리 가능한 개발 유닛으로 분해합니다.

---

## Part 1: 분해 질문

### Question 1
유닛 분해 전략은 어떤 것을 선호하시나요?

A) 3유닛 분리 — 공통 백엔드(DB+인증) / 고객 기능(프론트+API) / 관리자 기능(프론트+API)
B) 2유닛 분리 — 고객 유닛(고객앱+관련API) / 관리자 유닛(관리자앱+관련API+공통 인프라)
C) 단일 유닛 — 전체를 하나의 유닛으로 순차 개발 (백엔드 → 고객 → 관리자)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2
유닛 간 개발 순서는 어떻게 하시겠습니까?

A) 순차 개발 — 공통 → 고객 → 관리자 순서로 하나씩 완성
B) 병렬 개발 — 공통 완성 후 고객/관리자 동시 개발
C) 관리자 우선 — 공통 → 관리자(메뉴/카테고리/테이블 설정) → 고객(주문)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part 2: 실행 계획 (답변 수집 후 실행)

### Step 1: 유닛 정의
- [x] 유닛별 범위 및 책임 정의
- [x] 유닛별 포함 모듈/컴포넌트 매핑
- [x] `aidlc-docs/inception/application-design/unit-of-work.md` 생성

### Step 2: 유닛 의존성 정의
- [x] 유닛 간 의존성 매트릭스 작성
- [x] 개발 순서 및 통합 포인트 정의
- [x] `aidlc-docs/inception/application-design/unit-of-work-dependency.md` 생성

### Step 3: 스토리-유닛 매핑
- [x] 각 사용자 스토리를 유닛에 할당
- [x] 매핑 완전성 검증 (모든 스토리 할당 확인)
- [x] `aidlc-docs/inception/application-design/unit-of-work-story-map.md` 생성

### Step 4: 검증
- [x] 유닛 경계 검증
- [x] 순환 의존성 없음 확인
- [x] 모든 스토리 할당 확인
