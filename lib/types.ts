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
