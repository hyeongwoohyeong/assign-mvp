import type {
  Expert,
  ServiceCategory,
  ClientRequest,
  ExpertRegistration,
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
