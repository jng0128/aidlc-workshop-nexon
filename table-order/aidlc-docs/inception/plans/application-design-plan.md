# Application Design Plan - 테이블오더 서비스

## 계획 개요
테이블오더 서비스의 고수준 컴포넌트 식별, 서비스 레이어 설계, 컴포넌트 간 의존성을 정의합니다.

---

## Part 1: 설계 질문

### Question 1
프론트엔드 프로젝트 구조는 어떻게 분리하시겠습니까?

A) 단일 React 앱 — 고객용/관리자용을 하나의 앱에서 라우팅으로 분리
B) 별도 React 앱 2개 — 고객용 앱과 관리자용 앱을 완전히 분리 (별도 빌드)
C) 모노레포 내 별도 패키지 — 공통 컴포넌트는 공유하되 앱은 분리 (Turborepo/Nx 등)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2
백엔드 API 구조는 어떤 패턴을 선호하시나요?

A) 모듈 기반 (NestJS 모듈) — 기능별 모듈 분리 (auth, menu, order, table 등)
B) 레이어 기반 — Controller / Service / Repository 레이어로 분리
C) 도메인 기반 (DDD 라이트) — 도메인별 Aggregate, Entity, Value Object 구분
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
데이터베이스 접근 방식(ORM)은 무엇을 사용하시겠습니까?

A) TypeORM — NestJS와 통합이 잘 되어 있고 데코레이터 기반
B) Prisma — 타입 안전성이 뛰어나고 마이그레이션 관리 편리
C) MikroORM — Unit of Work 패턴, DDD 친화적
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
고객용 UI의 상태 관리 방식은 어떤 것을 선호하시나요?

A) React Context + useReducer — 가벼운 상태 관리, 추가 라이브러리 불필요
B) Zustand — 간단하고 가벼운 상태 관리 라이브러리
C) Redux Toolkit — 구조화된 상태 관리, 미들웨어 지원
X) Other (please describe after [Answer]: tag below)

[Answer]: 우리 플랜에 맞는 방식으로 추천해줘

---

### Question 5
API 통신 라이브러리는 무엇을 사용하시겠습니까?

A) Axios — 인터셉터, 요청 취소 등 풍부한 기능
B) Fetch API (네이티브) — 추가 의존성 없음, 가벼움
C) TanStack Query (React Query) + Axios — 서버 상태 관리 + HTTP 클라이언트 조합
X) Other (please describe after [Answer]: tag below)

[Answer]: 우리 플랜에 맞는 방식으로 추천해줘

---

## Part 2: 실행 계획 (답변 수집 후 실행)

### Step 1: 컴포넌트 식별
- [x] 프론트엔드 컴포넌트 식별 (고객용, 관리자용)
- [x] 백엔드 모듈/컴포넌트 식별
- [x] 데이터베이스 엔티티 식별
- [x] `aidlc-docs/inception/application-design/components.md` 생성

### Step 2: 컴포넌트 메서드 정의
- [x] 각 백엔드 모듈의 주요 메서드 시그니처 정의
- [x] API 엔드포인트 목록 정의
- [x] `aidlc-docs/inception/application-design/component-methods.md` 생성

### Step 3: 서비스 레이어 설계
- [x] 서비스 정의 및 책임 분배
- [x] 서비스 간 오케스트레이션 패턴 정의
- [x] `aidlc-docs/inception/application-design/services.md` 생성

### Step 4: 컴포넌트 의존성 정의
- [x] 의존성 매트릭스 작성
- [x] 통신 패턴 정의
- [x] 데이터 흐름 다이어그램
- [x] `aidlc-docs/inception/application-design/component-dependency.md` 생성

### Step 5: 통합 문서 생성
- [x] 전체 설계를 통합하는 `application-design.md` 생성
- [x] 설계 일관성 검증
