import type {
  Expert,
  ServiceCategory,
  ClientRequest,
  ExpertRegistration,
  PublicRequest,
  Proposal,
  ContactRequest,
} from "./types";

// NOTE: All data here is mock data for the MVP.
// Replace with real database queries (e.g. Supabase / Firestore / REST API)
// when the backend is in place.

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

export const MOCK_EXPERTS: Expert[] = [
  {
    id: "exp-001",
    name: "김민준",
    firm: "로컬회계법인 파트너",
    specialties: ["세무기장", "세무신고", "회계자문"],
    qualifications: ["KICPA"],
    experienceSummary: "중소기업 세무 및 회계자문 12년",
    serviceCategories: ["세무기장", "세무신고", "회계자문"],
    location: "서울",
    verified: true,
  },
  {
    id: "exp-002",
    name: "박서연",
    firm: "독립 회계사",
    specialties: ["기업가치평가", "재무실사"],
    qualifications: ["KICPA"],
    experienceSummary: "중소형 M&A 및 투자 검토 30건 이상",
    serviceCategories: ["기업가치평가", "재무실사"],
    location: "서울",
    verified: true,
  },
  {
    id: "exp-003",
    name: "이도윤",
    firm: "세무법인 파트너",
    specialties: ["세무신고", "회계자문"],
    qualifications: ["CTA"],
    experienceSummary: "법인세 및 거래세 자문 15년",
    serviceCategories: ["세무신고", "회계자문"],
    location: "서울",
    verified: true,
  },
  {
    id: "exp-004",
    name: "정하은",
    firm: "컨설팅펌 이사",
    specialties: ["경영/재무 컨설팅", "M&A 자문"],
    qualifications: ["Former Big4"],
    experienceSummary: "성장전략 및 PMI 프로젝트 경험 다수",
    serviceCategories: ["경영/재무 컨설팅", "M&A 자문"],
    location: "서울",
    verified: true,
  },
];

export const MOCK_RECENT_REQUESTS: ClientRequest[] = [
  {
    id: "req-1042",
    company: "엔라이트 주식회사",
    serviceType: "재무실사",
    budget: "1,000만원~3,000만원",
    status: "제안진행",
    createdAt: "2026-04-22",
  },
  {
    id: "req-1041",
    company: "코어테크",
    serviceType: "기업가치평가",
    budget: "1,000만원~3,000만원",
    status: "접수완료",
    createdAt: "2026-04-21",
  },
  {
    id: "req-1040",
    company: "비전홀딩스",
    serviceType: "세무신고",
    budget: "300만원 이하",
    status: "제안도착",
    createdAt: "2026-04-19",
  },
  {
    id: "req-1039",
    company: "이지푸드",
    serviceType: "세무기장",
    budget: "300만원 이하",
    status: "선택완료",
    createdAt: "2026-04-18",
  },
  {
    id: "req-1038",
    company: "넥서스랩",
    serviceType: "M&A 자문",
    budget: "3,000만원 이상",
    status: "접수완료",
    createdAt: "2026-04-17",
  },
];

export const MOCK_RECENT_EXPERT_REGISTRATIONS: ExpertRegistration[] = [
  {
    id: "reg-512",
    name: "최지훈",
    firm: "회계법인 파트너",
    specialties: ["회계자문", "재무실사"],
    status: "승인",
  },
  {
    id: "reg-511",
    name: "한유진",
    firm: "세무법인 시니어",
    specialties: ["세무기장", "세무신고"],
    status: "검토중",
  },
  {
    id: "reg-510",
    name: "오성민",
    firm: "전략컨설팅펌 이사",
    specialties: ["경영/재무 컨설팅"],
    status: "검토중",
  },
  {
    id: "reg-509",
    name: "윤가람",
    firm: "법무법인 파트너",
    specialties: ["법률자문"],
    status: "보류",
  },
];

export const ADMIN_SUMMARY = {
  newRequests: 24,
  registeredExperts: 87,
  matchingInReview: 11,
  proposalsSent: 38,
};

// =====================================================================
// 공개 의뢰 보드 / 제안 / 연락 요청 — Mock
// =====================================================================
// COMPLIANCE: 본 데이터는 "전문가가 직접 의뢰를 확인하고 자율적으로 제안"하는
// 구조를 시각화하기 위한 예시이며, Assign이 특정 전문가에게 의뢰를 전달하거나
// 매칭한다는 인상을 주지 않도록 구성한다.

export const MOCK_PUBLIC_REQUESTS: PublicRequest[] = [
  {
    id: "REQ-2042",
    title: "시리즈 B 투자 유치를 위한 재무실사 의뢰",
    serviceType: "재무실사",
    budget: "1,000만원~3,000만원",
    timeline: "2주 이내 착수 희망",
    description:
      "시리즈 B 투자 라운드를 앞두고, 매출/원가/이연수익 인식 등 재무 항목에 대한 외부 실사가 필요합니다. 데이터룸은 준비되어 있으며, 영문 보고서 산출 가능 여부도 검토 중입니다.",
    status: "제안받는중",
    postedAt: "2026-04-22",
    proposalCount: 3,
    companyDisplay: "엔라이트 주식회사",
    isAnonymous: false,
  },
  {
    id: "REQ-2041",
    title: "비상장 스타트업 기업가치평가 (스톡옵션 부여 목적)",
    serviceType: "기업가치평가",
    budget: "1,000만원~3,000만원",
    timeline: "1개월 이내",
    description:
      "스톡옵션 행사가격 산정을 위한 비상장 기업가치평가가 필요합니다. 최근 라운드 텀시트와 사업계획서를 기반으로 평가 의견서를 받고자 합니다.",
    status: "게시됨",
    postedAt: "2026-04-21",
    proposalCount: 0,
    companyDisplay: "익명 (B2B SaaS · 시리즈 A)",
    isAnonymous: true,
  },
  {
    id: "REQ-2040",
    title: "법인세 신고 및 가산세 리스크 점검",
    serviceType: "세무신고",
    budget: "300만원 이하",
    timeline: "다음 결산기 전",
    description:
      "최근 2개 사업연도의 법인세 신고서를 검토하고, 가산세 리스크 및 세무조정 적정성에 대한 의견을 받고자 합니다.",
    status: "제안받는중",
    postedAt: "2026-04-19",
    proposalCount: 2,
    companyDisplay: "비전홀딩스",
    isAnonymous: false,
  },
  {
    id: "REQ-2039",
    title: "월별 세무기장 및 부가세 신고 위탁",
    serviceType: "세무기장",
    budget: "300만원 이하",
    timeline: "이번 분기부터",
    description:
      "직원 12명 규모, 월 매출 5천만원 내외. 기존 외주처 변경을 검토 중이며 월별 장부와 부가세 신고를 위탁할 수 있는 전문가를 찾고 있습니다.",
    status: "마감",
    postedAt: "2026-04-18",
    proposalCount: 4,
    companyDisplay: "이지푸드",
    isAnonymous: false,
  },
  {
    id: "REQ-2038",
    title: "동종업계 인수 검토 (M&A 자문)",
    serviceType: "M&A 자문",
    budget: "3,000만원 이상",
    timeline: "협의 후 결정",
    description:
      "동종업계 소규모 사업체 인수를 검토 중입니다. 거래 구조 설계와 가치평가 자문, 그리고 클로징까지의 전반적인 자문이 필요합니다.",
    status: "게시됨",
    postedAt: "2026-04-17",
    proposalCount: 1,
    companyDisplay: "넥서스랩",
    isAnonymous: false,
  },
];

// 제안은 의뢰별로 0건 이상 존재. 의뢰 상세 페이지에서 requestId 기준으로 필터링.
//
// COMPLIANCE: requestedContact: true 여도 status 가 '연락허용' 으로 바뀌기
// 전까지는 절대 어떠한 연락처도 노출하지 않는다. 본 mock 에서는 연락처 자체를
// 데이터에 포함하지 않음으로써 실수로라도 노출되는 일이 없도록 한다.
export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "PRP-3015",
    requestId: "REQ-2042",
    expertId: "exp-002",
    expertName: "박서연",
    expertFirm: "독립 회계사",
    expertSpecialties: ["기업가치평가", "재무실사"],
    message:
      "최근 3년간 시리즈 B/C 라운드 재무실사 12건 수행 경험이 있습니다. 데이터룸 구조가 준비되어 있다면 2주 내 1차 보고서 초안을 드릴 수 있습니다.",
    strengths: "SaaS 매출 인식 검토, 영문 보고서 산출 경험 다수",
    requestedContact: true,
    status: "제안전달",
    sentAt: "2026-04-23",
  },
  {
    id: "PRP-3014",
    requestId: "REQ-2042",
    expertId: "exp-004",
    expertName: "정하은",
    expertFirm: "컨설팅펌 이사",
    expertSpecialties: ["경영/재무 컨설팅", "M&A 자문"],
    message:
      "Big4 출신으로 PMI/실사 양쪽 모두 다뤄봤습니다. 재무실사 외에도 투자유치 단계의 운영지표(CAC, NRR, 코호트) 검증이 함께 필요하시면 함께 설계해드릴 수 있습니다.",
    strengths: "성장 단계 SaaS 실사 + 운영지표 검증 동시 수행",
    requestedContact: false,
    status: "제안전달",
    sentAt: "2026-04-23",
  },
  {
    id: "PRP-3013",
    requestId: "REQ-2042",
    expertId: "exp-001",
    expertName: "김민준",
    expertFirm: "로컬회계법인 파트너",
    expertSpecialties: ["세무기장", "세무신고", "회계자문"],
    message:
      "재무실사보다는 회계 측 검토에 강점이 있어, 본 의뢰의 일부 영역(매출/원가 회계처리 검토)에 대해 보조적으로 협업 가능합니다. 별도 견적 안내 가능합니다.",
    strengths: "중소기업 회계자문 12년",
    requestedContact: false,
    status: "종료",
    sentAt: "2026-04-22",
  },
  {
    id: "PRP-3012",
    requestId: "REQ-2040",
    expertId: "exp-003",
    expertName: "이도윤",
    expertFirm: "세무법인 파트너",
    expertSpecialties: ["세무신고", "회계자문"],
    message:
      "법인세 신고 검토 + 가산세 리스크 점검을 함께 진행해드릴 수 있습니다. 1주차에 자료 검토, 2주차에 의견서 초안을 드리는 일정이 가능합니다.",
    strengths: "법인세/거래세 자문 15년, 동일 규모 검토 사례 다수",
    requestedContact: true,
    status: "연락허용",
    sentAt: "2026-04-20",
  },
  {
    id: "PRP-3011",
    requestId: "REQ-2040",
    expertId: "exp-001",
    expertName: "김민준",
    expertFirm: "로컬회계법인 파트너",
    expertSpecialties: ["세무기장", "세무신고", "회계자문"],
    message:
      "기장 + 세무신고를 한 번에 보시는 것이 효율적입니다. 신고서 검토만 단독으로도 가능합니다.",
    strengths: "중소기업 세무 12년 · 법인세 신고서 검토 경험",
    requestedContact: false,
    status: "제안전달",
    sentAt: "2026-04-20",
  },
  {
    id: "PRP-3010",
    requestId: "REQ-2038",
    expertId: "exp-004",
    expertName: "정하은",
    expertFirm: "컨설팅펌 이사",
    expertSpecialties: ["경영/재무 컨설팅", "M&A 자문"],
    message:
      "동종업계 인수 거래는 시너지/위험 식별 단계에서 자문 가치가 가장 큽니다. 거래 구조와 가치평가, 클로징까지 단계별 워크 플랜을 제안드리겠습니다.",
    strengths: "PMI 프로젝트 경험 다수",
    requestedContact: true,
    status: "제안전달",
    sentAt: "2026-04-18",
  },
];

// 디렉토리에서 클라이언트가 전문가에게 직접 보낸 연락 요청.
// COMPLIANCE: 전문가가 "수락" 한 경우에만 연락처가 공유된다.
export const MOCK_CONTACT_REQUESTS: ContactRequest[] = [
  {
    id: "CRQ-4007",
    expertId: "exp-002",
    expertName: "박서연",
    clientCompany: "엔라이트 주식회사",
    clientContext:
      "투자유치 단계의 재무실사 사전 상담을 원합니다. 가능한 범위와 일정 안내 부탁드립니다.",
    status: "요청대기",
    requestedAt: "2026-04-24",
  },
  {
    id: "CRQ-4006",
    expertId: "exp-001",
    expertName: "김민준",
    clientCompany: "코어테크",
    clientContext:
      "법인 설립 1년차 세무기장 위탁을 검토 중입니다. 기본 견적과 가능 시점을 알고 싶습니다.",
    status: "수락",
    requestedAt: "2026-04-22",
  },
  {
    id: "CRQ-4005",
    expertId: "exp-003",
    expertName: "이도윤",
    clientCompany: "비전홀딩스",
    clientContext: "법인세 신고 직전 가산세 리스크 점검 가능 여부 문의드립니다.",
    status: "수락",
    requestedAt: "2026-04-20",
  },
  {
    id: "CRQ-4004",
    expertId: "exp-004",
    expertName: "정하은",
    clientCompany: "익명 (전략기획)",
    clientContext: "PMI 자문 가능 범위 확인용 사전 미팅을 요청드립니다.",
    status: "거절",
    requestedAt: "2026-04-18",
  },
];
