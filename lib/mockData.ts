import type {
  Expert,
  ServiceCategory,
  ClientRequest,
  ExpertRegistration,
  PublicRequest,
  Proposal,
  ContactRequest,
} from "./types";

// NOTE: 본 모듈은 서비스 카테고리·디스크립션 등 정적 카탈로그와,
// 백엔드 연동 전까지 비어 있는 컬렉션 정의를 담는다.
// 실제 의뢰/제안/연락 요청은 사용자 본인의 storage 와 운영자 메일 알림으로
// 흐름이 이어지며, DB 연동 시 본 빈 배열들이 실제 쿼리로 교체된다.

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "회계감사",
  "세무기장",
  "세무신고",
  "회계자문",
  "기업가치평가",
  "재무실사",
  "M&A 자문",
  "경영/재무 컨설팅",
  "법률자문",
  "기타",
];

export const SERVICE_CATEGORY_DESCRIPTIONS: Record<ServiceCategory, string> = {
  "회계감사": "외부감사 대상 법인의 재무제표 감사, 내부회계관리제도 검토 등 감사 업무를 수행합니다.",
  "세무기장": "월별 장부 작성과 회계처리, 부가세 신고 기초 자료를 정확하게 관리합니다.",
  "세무신고": "법인세, 부가세, 원천세 등 정기 신고 및 가산세 리스크를 점검합니다.",
  "회계자문": "결산, 내부통제, 회계기준 적용 등 실무 회계 이슈에 대한 자문을 제공합니다.",
  "기업가치평가": "투자 유치, M&A, 주식 교환 등 거래 목적에 맞춘 평가 보고서를 작성합니다.",
  "재무실사": "거래 전 회사의 재무·세무 리스크를 검토하고 협상 포인트를 도출합니다.",
  "M&A 자문": "거래 구조 설계부터 협상, 클로징까지 거래 전반을 지원합니다.",
  "경영/재무 컨설팅": "성장 전략, 자본 구조, KPI 설계 등 경영 의사결정을 지원합니다.",
  "법률자문": "계약, 기업 거버넌스, 분쟁 등 기업 법무 전반을 자문합니다.",
  "기타": "위 분류에 해당하지 않는 전문서비스도 의뢰하실 수 있습니다. 상세 내용을 함께 적어주세요.",
};

// COMPLIANCE NOTE:
// Expert 객체는 디렉토리에 공개되는 정보만 포함한다.
// 이메일·전화번호 등 연락처는 본 mock 에 절대 저장하지 않으며,
// 등록 폼에서 받은 후 운영자 알림 메일로만 전달된다.
// 연락처 공유는 "연락 요청 → 전문가 수락" 흐름을 통해서만 이뤄진다.
export const MOCK_EXPERTS: Expert[] = [
  {
    id: "EXP-GV6HMH",
    name: "이민주",
    firm: "세연회계법인",
    specialties: [
      "세무기장",
      "회계감사",
      "회계자문",
      "기업가치평가",
      "재무실사",
    ],
    qualifications: ["KICPA", "AICPA"],
    experienceSummary: "삼성생명 회계감사 / 하나증권 내부회계구축",
    serviceCategories: [
      "세무기장",
      "회계감사",
      "회계자문",
      "기업가치평가",
      "재무실사",
    ],
    location: "전국 가능",
    verified: false,
  },
];

// 운영 대시보드 — "최근 의뢰 내역" 표.
// 실제 의뢰는 폼 → 메일 → DB 연동 후에 채워진다.
export const MOCK_RECENT_REQUESTS: ClientRequest[] = [];

// 운영 대시보드 — "최근 전문가 등록" 표. 실제 가입자만 노출.
export const MOCK_RECENT_EXPERT_REGISTRATIONS: ExpertRegistration[] = [
  {
    id: "EXP-GV6HMH",
    name: "이민주",
    firm: "세연회계법인",
    specialties: [
      "세무기장",
      "회계감사",
      "회계자문",
      "기업가치평가",
      "재무실사",
    ],
    status: "승인",
  },
];

export const ADMIN_SUMMARY = {
  newRequests: 0,
  registeredExperts: 1,
  matchingInReview: 0,
  proposalsSent: 0,
};

// =====================================================================
// 공개 의뢰 보드 / 제안 / 연락 요청 — Mock
// =====================================================================
// COMPLIANCE: 본 데이터는 "전문가가 직접 의뢰를 확인하고 자율적으로 제안"하는
// 구조를 시각화하기 위한 예시이며, Assign이 특정 전문가에게 의뢰를 전달하거나
// 매칭한다는 인상을 주지 않도록 구성한다.

// 공개 의뢰 보드 — 실제 의뢰가 등록되면 이 배열이 채워진다. 초기 상태에서는
// 사용자 본인이 등록한 의뢰만 storage 에서 합쳐져 노출된다.
export const MOCK_PUBLIC_REQUESTS: PublicRequest[] = [];

// 의뢰별 제안 — 초기 상태는 빈 배열.
//
// COMPLIANCE: requestedContact: true 여도 status 가 '연락허용' 으로 바뀌기
// 전까지는 절대 어떠한 연락처도 노출하지 않는다. 연락처 자체를 데이터에
// 포함하지 않음으로써 실수로라도 노출되는 일이 없도록 한다.
export const MOCK_PROPOSALS: Proposal[] = [];

// 디렉토리에서 클라이언트가 전문가에게 직접 보낸 연락 요청 — 초기 빈 상태.
// COMPLIANCE: 전문가가 "수락" 한 경우에만 연락처가 공유된다.
export const MOCK_CONTACT_REQUESTS: ContactRequest[] = [];
