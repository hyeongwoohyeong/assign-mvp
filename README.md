# Assign — B2B 전문서비스 마켓플레이스 (MVP)

지인 추천 중심으로 이루어지던 전문서비스 소싱을, 검증 기반의 제안 비교 방식으로
전환하기 위한 B2B 마켓플레이스 MVP입니다.

기업은 핵심 정보만 입력해 빠르게 의뢰를 등록하고, 검증된 전문가들의 제안을 비교해
의사결정할 수 있습니다. 전문가는 프로필 등록 후 본인 전문분야에 맞는 의뢰를 받아
제안 기회를 확보할 수 있습니다.

초기 시장 검증을 위해 랜딩 페이지, 양방향 폼, 전문가 디렉터리, 운영 대시보드 목업을
포함합니다.

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- 클라이언트 상태 기반 폼 (백엔드/DB 미연결)
- Pretendard 한글 폰트 (CDN 로드)

## 페이지 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 홈 (히어로, 왜 필요한가, 기업 사용 흐름, 전문가 사용 흐름, 카테고리, 비전) |
| `/request` | 기업 용역 의뢰 폼 (인라인 검증 + 제출 상태 처리) |
| `/expert-register` | 전문가 등록 폼 (전문분야/입력값 검증 + 제출 상태 처리) |
| `/experts` | 전문가 디렉터리 (카테고리 필터 + 검색 + 정렬 + 초기화) |
| `/admin` | 운영 대시보드 목업 (요약 지표 + 진행률/처리 현황) |

## 프로젝트 구조

```
app/
  layout.tsx              # 공통 레이아웃 (Header / Footer 포함)
  page.tsx                # 홈
  globals.css             # Tailwind + 글로벌 스타일
  request/page.tsx        # 용역 의뢰 폼
  expert-register/page.tsx# 전문가 등록 폼
  experts/page.tsx        # 전문가 디렉터리
  admin/page.tsx          # 운영 대시보드 목업
components/
  Header.tsx
  Footer.tsx
  Button.tsx
  SectionTitle.tsx
  ServiceCard.tsx
  ExpertCard.tsx
lib/
  types.ts                # 도메인 타입
  mockData.ts             # 전문가 / 의뢰 / 운영 지표 등 목업 데이터
```

## 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

빌드 & 실행:

```bash
npm run build
npm run start
```

## 백엔드 연동 가이드

이 MVP는 의도적으로 백엔드 없이 동작하도록 만들어졌습니다. Supabase / Firebase /
자체 API를 붙일 때는 다음 지점만 변경하면 됩니다.

- `app/request/page.tsx` 의 `handleSubmit` — 의뢰 폼을 POST 하는 위치
- `app/expert-register/page.tsx` 의 `handleSubmit` — 전문가 신청을 POST 하는 위치
- `lib/mockData.ts` — 디렉터리/대시보드의 데이터 소스를 DB 쿼리로 교체
- 인증/권한: 현재는 인증이 없으므로 `/admin` 보호용 미들웨어를 추가하세요.

각 진입점에는 `// NOTE: Backend integration point.` 주석으로 위치를 표기해두었습니다.

## 제품 메시지 (외부 공유용)

- **기업용 가치**: "필요한 서비스만 입력하면, 검증된 전문가 제안을 비교해 빠르게 의사결정"
- **전문가용 가치**: "전문분야에 맞는 의뢰를 받아 영업보다 제안과 수행에 집중"
- **플랫폼 포지셔닝**: "회계·세무·재무자문에서 시작해 전문서비스 소싱 인프라로 확장"

## 디자인 원칙

- 다크 네이비 + 화이트/라이트 그레이의 차분한 톤
- 카드 + 부드러운 라운드 + 경량 그림자
- 이모지/일러스트 미사용, 회계·법무 시장에 맞는 보수적 톤
- 모바일 반응형 (Tailwind breakpoint 기반)

## 알려진 제약 (MVP)

- 실제 인증 없음
- 결제 없음
- 영구 저장소 없음 (폼 제출 시 콘솔 로그 후 성공 화면 표시)
- `/admin`은 누구나 접근 가능 (운영 단계 진입 시 보호 필요)
