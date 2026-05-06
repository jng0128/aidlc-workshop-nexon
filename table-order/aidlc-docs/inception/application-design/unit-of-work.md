# 테이블오더 서비스 - Unit of Work 정의

## 분해 전략
- **2유닛 분리**: 관리자 유닛(공통 인프라 포함) + 고객 유닛
- **개발 순서**: 관리자 유닛 먼저 (공통 인프라 포함) → 고객 유닛 병렬/후속 개발

---

## Unit 1: 관리자 유닛 (Admin Unit)

### 범위
관리자용 프론트엔드 + 전체 백엔드 + 데이터베이스 + Docker 인프라

### 책임
- 공통 인프라 구축 (DB 스키마, Docker Compose, NestJS 프로젝트 셋업)
- 인증 시스템 (관리자 + 테이블 인증 모두)
- 카테고리/메뉴 관리 (CRUD, cascade, delete protection)
- 테이블 관리 (초기 설정, 세션 관리)
- 주문 모니터링 (SSE, 상태 변경, 삭제)
- 세션 관리 (이용 완료, 과거 이력)
- 관리자 프론트엔드 (대시보드, 관리 화면)

### 포함 모듈/컴포넌트

**백엔드 (전체)**:
| 모듈 | 설명 |
|------|------|
| AuthModule | JWT 인증 (관리자 + 테이블) |
| StoreModule | 매장 정보 |
| TableModule | 테이블 CRUD |
| CategoryModule | 카테고리 CRUD + cascade |
| MenuModule | 메뉴 CRUD |
| OrderModule | 주문 생성/조회/상태변경/삭제 |
| SessionModule | 세션 라이프사이클 |
| SseModule | 실시간 이벤트 |

**프론트엔드 (admin-app)**:
| 컴포넌트 | 설명 |
|----------|------|
| LoginPage | 관리자 로그인 |
| DashboardPage | 테이블별 주문 모니터링 |
| TableCard | 테이블 카드 |
| OrderDetailModal | 주문 상세 |
| TableManagementPage | 테이블 관리 |
| MenuManagementPage | 메뉴 관리 |
| CategoryManagementPage | 카테고리 관리 |

**인프라**:
| 항목 | 설명 |
|------|------|
| Docker Compose | 전체 서비스 오케스트레이션 |
| PostgreSQL | 데이터베이스 + 스키마 |
| DB 마이그레이션 | TypeORM 마이그레이션 |
| 시드 데이터 | 초기 관리자 계정, 매장 정보 |

### 산출물
- 완전히 동작하는 백엔드 API (모든 엔드포인트)
- 관리자 프론트엔드 (모든 관리 기능)
- Docker Compose 배포 구성
- DB 스키마 및 마이그레이션
- 시드 데이터

---

## Unit 2: 고객 유닛 (Customer Unit)

### 범위
고객용 프론트엔드 + 고객 관련 API 연동 확인

### 책임
- 고객용 React 앱 구축
- 테이블 자동 로그인 구현
- 메뉴 조회 및 탐색 UI
- 장바구니 관리 (Zustand + localStorage)
- 주문 생성 및 성공/실패 처리
- 주문 내역 조회
- 다국어 지원 (한국어 + 영어)

### 포함 모듈/컴포넌트

**프론트엔드 (customer-app)**:
| 컴포넌트 | 설명 |
|----------|------|
| LoginPage | 초기 설정 (1회) |
| MenuPage | 메뉴 목록 + 카테고리 탐색 |
| CartDrawer | 장바구니 |
| OrderConfirmPage | 주문 확인 |
| OrderSuccessPage | 주문 성공 (5초 리다이렉트) |
| OrderHistoryPage | 주문 내역 |

**상태 관리**:
| 스토어 | 설명 |
|--------|------|
| authStore | 인증 상태 (토큰, 테이블 정보) |
| cartStore | 장바구니 (persist) |

**API 연동** (Unit 1에서 구축한 백엔드 사용):
| API | 설명 |
|-----|------|
| POST /api/auth/table/login | 테이블 로그인 |
| GET /api/categories | 카테고리 목록 |
| GET /api/menus | 메뉴 목록 |
| POST /api/orders | 주문 생성 |
| GET /api/orders?sessionId= | 주문 내역 |

**i18n**:
| 항목 | 설명 |
|------|------|
| react-i18next | 다국어 프레임워크 |
| ko.json | 한국어 리소스 |
| en.json | 영어 리소스 |

### 산출물
- 완전히 동작하는 고객 프론트엔드
- 장바구니 로컬 저장 기능
- 다국어 지원 (한국어/영어)
- Docker 이미지 (Nginx 기반)

---

## 코드 조직 전략

```
table-order/                    # 워크스페이스 루트
├── backend/                    # Unit 1에서 구축
│   ├── src/
│   │   ├── auth/
│   │   ├── category/
│   │   ├── menu/
│   │   ├── order/
│   │   ├── table/
│   │   ├── session/
│   │   ├── sse/
│   │   ├── store/
│   │   ├── common/
│   │   └── database/
│   ├── Dockerfile
│   └── package.json
│
├── admin-app/                  # Unit 1에서 구축
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── customer-app/               # Unit 2에서 구축
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Unit 1에서 구축
├── docker-compose.dev.yml      # Unit 1에서 구축
└── README.md
```
