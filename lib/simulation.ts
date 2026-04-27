// =====================================================================
// 연락처 reveal 헬퍼
// =====================================================================
//
// 본 모듈은 "연락 허용 / 수락" 단계에서만 호출되는 placeholder 헬퍼를 제공한다.
// 백엔드 연동 후에는 실제 사용자 입력값을 기반으로 한 reveal 로직으로 교체된다.
//
// COMPLIANCE NOTE:
//   - 어떤 연락처를 reveal 할지는 동의를 누른 시점에서야 결정된다. 데이터
//     상에는 그 전까지 절대 저장되지 않는다.
//   - 본 모듈은 어떠한 자동 매칭/추천 로직도 포함하지 않는다.

import type { StoredRequest } from "./storage";

// 의뢰자 측 → 전문가에게 보여줄 placeholder.
//   - 회사명/담당자명은 의뢰 등록 시 입력된 값을 우선 노출한다.
//   - 이메일/전화는 백엔드 연동 후 실제 값으로 교체된다.
export function revealClientContact(req: StoredRequest) {
  return {
    company: req.ownerCompany || req.companyDisplay,
    contactName: "담당자",
    email: "client@example.com",
    phone: "010-0000-0000",
  };
}

// 전문가 측 → 의뢰자에게 보여줄 placeholder.
//   - 백엔드 연동 후에는 전문가 등록 시 입력된 실제 이메일/전화로 교체된다.
export function revealExpertContact(expertId: string) {
  return {
    email: `${expertId.toLowerCase()}@example.com`,
    phone: "010-0000-0000",
  };
}
