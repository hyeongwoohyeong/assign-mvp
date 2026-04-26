# Assign — 전문서비스 의뢰 등록 · 전문가 디렉토리 플랫폼 (MVP)

회계·세무·재무·컨설팅 등 전문서비스를 필요로 하는 기업이 의뢰 정보를 등록하고,
관심 있는 전문가가 직접 제안을 보내는 의뢰·디렉토리 게시 플랫폼 MVP입니다.

기업은 핵심 정보만 입력해 빠르게 의뢰를 등록하고, 등록된 전문가의 제안을 직접
비교·확인할 수 있습니다. 전문가는 프로필 등록 후 본인이 관심 있는 의뢰를
직접 확인하고 제안할 수 있습니다.

> **컴플라이언스 안내**
> Assign은 특정 전문가를 추천하거나 계약을 중개하지 않으며,
> 정보 게시 및 확인 기능만 제공합니다.
> 의뢰자와 전문가의 계약·협상은 양 당사자 간 직접 진행되며,
> Assign은 계약 성사에 따른 별도의 중개·성공 수수료를 받지 않습니다.

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

## 폼 제출 알림 메일 설정 (Resend)

용역 의뢰 / 전문가 등록 폼이 제출되면 운영자 이메일로 알림이 발송됩니다.
구현체는 `app/api/notify/route.ts` 의 serverless API 라우트입니다.

### 1) Resend 가입 및 API 키 발급

1. https://resend.com 가입 (알림 받을 메일 주소로 가입 권장)
2. 좌측 메뉴 → **API Keys** → **Create API Key** → 키 복사 (`re_xxx...`)
3. 자체 도메인이 없으면 발신 주소는 기본값 `onboarding@resend.dev` 그대로 사용
   - 단, 이 발신 주소는 Resend에 가입한 본인 이메일로만 발송 가능 (테스트용)
   - 프로덕션에서 외부에 보낼 때는 도메인 검증이 필요

### 2) 환경변수 등록

**Vercel** (배포 환경):
Project → Settings → Environment Variables 에 다음 항목 추가:

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | 발급받은 키 (`re_...`) |
| `NOTIFY_TO_EMAIL` | 알림 받을 이메일 (예: `guddn8663@naver.com`) |
| `NOTIFY_FROM_EMAIL` | (선택) `Assign Notification <onboarding@resend.dev>` |

등록 후 **Deployments** 탭에서 최신 배포를 **Redeploy** 해야 변경된 env 가 적용됩니다.

**로컬** (`npm run dev`):
프로젝트 루트에 `.env.local` 파일을 만들고 위 변수들을 채웁니다 (`.env.example` 참고).

### 3) 동작 확인

1. 폼 제출 → 등록한 메일함에 `[Assign] 신규 용역 의뢰 ...` 메일 도착
2. 메일에 회사명, 담당자, 연락처, 프로젝트 설명 등이 표 형태로 정리되어 옴
3. 키가 없으면 메일은 발송되지 않고 서버 로그에만 기록됨 (폼은 정상 동작)

## 추후 백엔드 연동 가이드

알림 메일을 넘어 데이터를 영구 저장하려면:

- `app/api/notify/route.ts` 에 DB insert 로직 추가 (Supabase / Firestore 등)
- `lib/mockData.ts` — 디렉터리/대시보드의 데이터 소스를 DB 쿼리로 교체
- 인증/권한: `/admin` 보호용 미들웨어 추가

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
- 영구 저장소 없음 (폼 제출 시 운영자에게 알림 메일만 발송)
- `/admin`은 mock 데이터 표시 + 누구나 접근 가능 (운영 단계 진입 시 보호 필요)
