// Domain types for the Assign platform.
// NOTE: When wiring up a real backend (Supabase / Firebase / custom API),
// these types should match the schema of your database tables/collections.

export type ServiceCategory =
  | "회계감사"
  | "세무기장"
  | "세무신고"
  | "회계자문"
  | "기업가치평가"
  | "재무실사"
  | "M&A 자문"
  | "경영/재무 컨설팅"
  | "법률자문"
  | "기타";

export type BudgetRange =
  | "300만원 이하"
  | "300만원~1,000만원"
  | "1,000만원~3,000만원"
  | "3,000만원 이상";

export interface Expert {
  id: string;
  name: string;
  firm: string;
  specialties: ServiceCategory[];
  qualifications: string[];
  experienceSummary: string;
  serviceCategories: ServiceCategory[];
  location: string;
  verified: boolean;
  // 풍부한 프로필 정보 — "프로필 보기" 모달에서만 노출되며, 디렉토리 카드 자체의
  // 레이아웃은 그대로 유지된다. 모든 필드는 선택값이므로 기존 카드와 호환된다.
  // COMPLIANCE: 본 타입에는 이메일/전화 등 연락처를 절대 포함하지 않는다.
  experienceBullets?: string[];
  preferredServices?: ServiceCategory[];
  feeRange?: BudgetRange;
  intro?: string[]; // 줄바꿈 단위로 분할된 자기소개. 모달에서 한 줄씩 렌더링.
}

// COMPLIANCE NOTE:
// 의뢰 상태값은 "운영자가 매칭한다"는 인상을 주지 않도록 정의한다.
//   접수완료 → 제안진행 → 제안도착 → 선택완료
// "매칭" 단어는 사용하지 않는다.
export interface ClientRequest {
  id: string;
  company: string;
  serviceType: ServiceCategory;
  budget: BudgetRange;
  status: "접수완료" | "제안진행" | "제안도착" | "선택완료";
  createdAt: string; // ISO date
}

export interface ExpertRegistration {
  id: string;
  name: string;
  firm: string;
  specialties: ServiceCategory[];
  status: "검토중" | "승인" | "보류";
}

// =====================================================================
// 공개 의뢰 보드 / 제안 / 연락 요청 도메인
// =====================================================================
//
// COMPLIANCE NOTE (매우 중요):
//   본 데이터 모델은 한국 직역 규제(회계/세무/법률)에서 "특정 전문가 추천"
//   이나 "계약 중개"로 해석되지 않도록 다음 원칙을 따른다.
//
//   1) 의뢰자가 등록한 정보는 "공개 게시"되며, 플랫폼은 특정 전문가에게
//      연결시키지 않는다 (자동 매칭 없음).
//   2) 전문가가 의뢰에 자율적으로 "제안"을 남길 수 있다.
//      → 이때 연락처는 공개되지 않는다. 메시지만 전달된다.
//   3) 클라이언트도 디렉토리에서 전문가에게 "연락 요청"을 보낼 수 있다.
//      → 전문가가 수락한 경우에만 연락처가 공유된다.
//   4) 연락처(이메일/전화)는 양 당사자가 명시적으로 동의(연락 허용 / 연락 수락)
//      한 경우에만 공개된다. 그 전에는 절대 노출하지 않는다.

// 공개 의뢰 보드에 게시된 의뢰 한 건.
//   게시됨    : 등록 직후 보드에 노출, 아직 제안 없음.
//   제안받는중: 1건 이상 제안이 도착한 상태.
//   마감      : 의뢰자가 검토를 종료했거나 일정 경과로 노출 종료.
export interface PublicRequest {
  id: string;
  title: string;
  serviceType: ServiceCategory;
  budget: BudgetRange;
  timeline: string;
  description: string;
  status: "게시됨" | "제안받는중" | "마감";
  postedAt: string; // ISO date
  proposalCount: number;
  // 보드에서는 회사명만 노출하거나 익명 처리. 담당자명·연락처는 절대 노출 금지.
  companyDisplay: string;
  isAnonymous: boolean;
}

// 전문가가 공개 의뢰에 자율적으로 보낸 제안.
//   제안전달 → 연락허용 → 종료
//   - requestedContact 가 true 여도, status 가 "연락허용" 이 되기 전에는
//     어떠한 연락처도 공유되지 않는다.
export interface Proposal {
  id: string;
  requestId: string;
  expertId: string;
  expertName: string;
  expertFirm: string;
  expertSpecialties: ServiceCategory[];
  message: string;
  strengths: string;
  requestedContact: boolean;
  status: "제안전달" | "연락허용" | "종료";
  sentAt: string; // ISO date
}

// 클라이언트가 디렉토리에서 전문가에게 직접 보낸 연락 요청.
//   요청대기 → 수락 / 거절
//   - 수락 시에만 양측 연락처 공유. 거절 시에는 어떤 연락 정보도 공유되지 않는다.
export interface ContactRequest {
  id: string;
  expertId: string;
  expertName: string;
  clientCompany: string;
  clientContext: string;
  status: "요청대기" | "수락" | "거절";
  requestedAt: string; // ISO date
}
