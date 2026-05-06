# 요구사항 확인 질문

아래 질문에 답변해 주세요. 각 질문의 [Answer]: 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.
선택지 중 맞는 것이 없으면 마지막 옵션(Other)을 선택하고 설명을 추가해 주세요.

---

## Question 1
프로젝트의 기술 스택(프로그래밍 언어 및 프레임워크)은 무엇을 사용하시겠습니까?

A) TypeScript + React (프론트엔드) / TypeScript + NestJS (백엔드) / PostgreSQL (DB)
B) TypeScript + React (프론트엔드) / TypeScript + Express.js (백엔드) / PostgreSQL (DB)
C) TypeScript + Next.js (풀스택) / PostgreSQL (DB)
D) JavaScript + React (프론트엔드) / Node.js + Express (백엔드) / MongoDB (DB)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
매장(Store) 관리 구조는 어떻게 되나요? (멀티테넌시 관점)

A) 단일 매장만 지원 (하나의 매장만 운영)
B) 다중 매장 지원 (여러 매장이 독립적으로 운영, 각 매장별 관리자 계정)
C) 다중 매장 + 슈퍼 관리자 (여러 매장 + 전체 관리 계정)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
테이블 수는 매장당 대략 어느 정도를 예상하시나요?

A) 소규모 (1~10개 테이블)
B) 중규모 (11~30개 테이블)
C) 대규모 (31~100개 테이블)
D) 매우 대규모 (100개 이상)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
메뉴 이미지는 어떻게 관리하시겠습니까?

A) 외부 이미지 URL 직접 입력 (별도 이미지 호스팅 사용)
B) 서버에 이미지 파일 업로드 기능 포함
C) 이미지 없이 텍스트만으로 메뉴 표시 (MVP에서는 이미지 URL만 저장)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
배포 환경은 어디를 대상으로 하시나요?

A) AWS (EC2, RDS, S3 등)
B) 로컬/온프레미스 서버
C) Docker 컨테이너 기반 (Docker Compose)
D) 클라우드 PaaS (Heroku, Railway, Render 등)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 6
동시 접속자 수(피크 시간 기준)는 어느 정도를 예상하시나요?

A) 소규모 (동시 10명 이하)
B) 중규모 (동시 11~50명)
C) 대규모 (동시 51~200명)
D) 매우 대규모 (동시 200명 이상)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
관리자 계정 생성은 어떻게 처리하시겠습니까?

A) 시스템 초기 설정 시 시드 데이터로 생성 (고정 관리자 계정)
B) 회원가입 기능을 통한 관리자 등록
C) CLI 또는 API를 통한 관리자 생성 (별도 관리자 등록 UI 없음)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
주문 상태 변경 흐름은 다음 중 어떤 것이 맞나요?

A) 대기중 → 준비중 → 완료 (3단계, 순차적)
B) 대기중 → 완료 (2단계, 간소화)
C) 대기중 → 준비중 → 완료 + 취소 가능 (3단계 + 취소)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 9
고객용 인터페이스의 언어는 무엇으로 하시겠습니까?

A) 한국어 전용
B) 한국어 기본 + 영어 지원
C) 다국어 지원 (한국어, 영어, 일본어, 중국어 등)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 10: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 보안 규칙을 blocking constraint로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 보안 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 11: Property-Based Testing Extension
이 프로젝트에 Property-Based Testing (PBT) 규칙을 적용하시겠습니까?

A) Yes — 모든 PBT 규칙을 blocking constraint로 적용 (비즈니스 로직, 데이터 변환, 직렬화, 상태 관리 컴포넌트가 있는 프로젝트에 권장)
B) Partial — 순수 함수와 직렬화 round-trip에만 PBT 규칙 적용
C) No — PBT 규칙 건너뛰기 (단순 CRUD, UI 전용, 비즈니스 로직이 적은 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---
