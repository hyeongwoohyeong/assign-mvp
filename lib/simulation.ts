// =====================================================================
// 시뮬레이션 — 백엔드가 없는 MVP 단계에서 "받은 제안 / 받은 연락 요청"
// 처럼 시스템 동작이 살아있는 듯한 인상을 만들기 위한 mock 생성기.
// =====================================================================
//
// COMPLIANCE NOTE:
//   - 본 시뮬레이션은 사용자 본인의 브라우저 안에서만 실행되며,
//     운영자가 특정 전문가를 추천한 결과를 표현하는 것이 아니다.
//   - 시뮬레이션으로 등장하는 전문가/의뢰자 정보에는 어떤 연락처도
//     포함하지 않는다. 사용자가 "연락 허용/수락"을 누르면 그때 비로소
//     placeholder 연락처가 reveal 된다.
//   - "운영자가 매칭한다"는 인상을 주지 않도록 카피는 "전문가가 직접
//     의뢰를 확인하고 자율적으로 보낸 제안" 으로 표현한다.

import type { ServiceCategory } from "./types";
import {
  type StoredContactRequest,
  type StoredProposal,
  type StoredRequest,
  ids,
  listProposalsForRequest,
  listMyContactRequests,
  saveMyContactRequest,
  saveMyProposal,
} from "./storage";

// ---------------------------------------------------------------------
// 시뮬레이션 풀 — 의뢰자에게 "도착하는" 제안을 만들 때 사용.
//   * 본 데이터는 디렉토리의 실제 전문가가 아닌, 가상의 분야별 풀이다.
// ---------------------------------------------------------------------

interface SimExpert {
  expertId: string;
  expertName: string;
  expertFirm: string;
  specialties: ServiceCategory[];
}

const SIM_EXPERTS: SimExpert[] = [
  {
    expertId: "SIM-A1",
    expertName: "박지훈",
    expertFirm: "정도회계법인",
    specialties: ["회계감사", "회계자문", "기업가치평가"],
  },
  {
    expertId: "SIM-A2",
    expertName: "최서연",
    expertFirm: "온세무회계",
    specialties: ["세무기장", "세무신고", "회계자문"],
  },
  {
    expertId: "SIM-A3",
    expertName: "정현우",
    expertFirm: "에스피컨설팅",
    specialties: ["경영/재무 컨설팅", "M&A 자문", "재무실사"],
  },
  {
    expertId: "SIM-A4",
    expertName: "한유나",
    expertFirm: "유앤로펌",
    specialties: ["법률자문"],
  },
  {
    expertId: "SIM-A5",
    expertName: "오세진",
    expertFirm: "퀀텀평가",
    specialties: ["기업가치평가", "재무실사", "M&A 자문"],
  },
];

// ---------------------------------------------------------------------
// 의뢰 → 제안 시뮬레이션
// ---------------------------------------------------------------------

const SAMPLE_MESSAGES: Record<string, string[]> = {
  default: [
    "관련 프로젝트를 다년간 수행한 경험이 있어 의뢰 내용을 검토하고 제안 드립니다.",
    "유사 규모/업종의 의뢰를 다수 처리한 경험이 있습니다. 일정/예산 모두 협의 가능합니다.",
    "현재 가용 일정이 있어 빠른 착수가 가능합니다. 자세한 범위는 협의 후 확정 가능합니다.",
  ],
};

const SAMPLE_STRENGTHS = [
  "동종 업종 다수 자문 경험, 표준 산출물 양식 제공",
  "초기 진단부터 후속 신고/보고서 제출까지 일괄 수행",
  "유사 규모 기업 다수 수행 이력, 빠른 일정 대응 가능",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 같은 분야 또는 인접 분야의 시뮬레이션 전문가를 1~2명 추출.
function pickExpertsFor(serviceType: ServiceCategory, count: number): SimExpert[] {
  const exact = SIM_EXPERTS.filter((e) => e.specialties.includes(serviceType));
  const others = SIM_EXPERTS.filter((e) => !e.specialties.includes(serviceType));
  const pool = exact.length > 0 ? [...exact, ...others] : SIM_EXPERTS;
  const selected: SimExpert[] = [];
  const used = new Set<string>();
  while (selected.length < Math.min(count, pool.length)) {
    const c = pickRandom(pool);
    if (used.has(c.expertId)) continue;
    used.add(c.expertId);
    selected.push(c);
  }
  return selected;
}

// 의뢰에 새 제안 1~2건을 생성해 storage 에 저장한다.
// 이미 제안이 N건 있으면 더 만들지 않는다 (1건 이상 → 유지).
export function simulateIncomingProposals(req: StoredRequest, options?: {
  force?: boolean;
}): StoredProposal[] {
  const existing = listProposalsForRequest(req.id);
  if (!options?.force && existing.length >= 2) return existing;

  const targetCount = Math.max(2 - existing.length, 1);
  const experts = pickExpertsFor(req.serviceType, targetCount);

  const created: StoredProposal[] = experts.map((e) => {
    const proposal: StoredProposal = {
      id: ids.proposal(),
      requestId: req.id,
      expertId: e.expertId,
      expertName: e.expertName,
      expertFirm: e.expertFirm,
      expertSpecialties: e.specialties,
      message: pickRandom(SAMPLE_MESSAGES.default),
      strengths: pickRandom(SAMPLE_STRENGTHS),
      requestedContact: true,
      status: "제안전달",
      sentAt: new Date().toISOString(),
      requestTitle: req.title,
      requestServiceType: req.serviceType,
      requestBudget: req.budget,
    };
    saveMyProposal(proposal);
    return proposal;
  });

  return [...existing, ...created];
}

// ---------------------------------------------------------------------
// 디렉토리 → 연락 요청 시뮬레이션 (전문가 측 Inbox)
// ---------------------------------------------------------------------

const SAMPLE_CLIENT_COMPANIES = [
  "주식회사 어사인",
  "에이치플러스 컴퍼니",
  "북서울 인더스트리",
  "라이트하우스랩스",
  "스튜디오 모먼트",
];

const SAMPLE_CLIENT_CONTEXTS = [
  "외부감사 대상 전환 예정으로, 내부회계관리제도 구축 자문이 필요합니다.",
  "시리즈 A 투자 유치를 앞두고 기업가치평가 보고서가 필요한 상황입니다.",
  "월결산 정합성 점검과 세무 리스크 검토가 동시에 필요합니다.",
  "M&A 거래 직전 단계로, 재무실사 일정이 시급합니다.",
];

// 임의로 1건의 시뮬레이션 연락 요청을 생성해 저장한다.
// 이미 동일 expertId 에 대한 요청이 N건 이상이면 추가 생성하지 않는다.
export function simulateIncomingContactRequest(opts: {
  expertId: string;
  expertName: string;
  expertFirm: string;
  expertSpecialties: ServiceCategory[];
}): StoredContactRequest | null {
  const existing = listMyContactRequests().filter(
    (c) => c.expertId === opts.expertId,
  );
  if (existing.length >= 1) return existing[0];

  const c: StoredContactRequest = {
    id: ids.contactRequest(),
    expertId: opts.expertId,
    expertName: opts.expertName,
    expertFirm: opts.expertFirm,
    expertSpecialties: opts.expertSpecialties,
    clientCompany: pickRandom(SAMPLE_CLIENT_COMPANIES),
    clientContext: pickRandom(SAMPLE_CLIENT_CONTEXTS),
    status: "요청대기",
    requestedAt: new Date().toISOString(),
  };
  saveMyContactRequest(c);
  return c;
}

// ---------------------------------------------------------------------
// 연락처 reveal — "연락 허용 / 수락" 단계에서만 호출되는 placeholder
// ---------------------------------------------------------------------
//
// COMPLIANCE: 어떤 연락처를 reveal 할지는 동의를 누른 시점에서야
// 결정된다. 데이터 상에는 그 전까지 절대 저장되지 않는다.

// 의뢰자 측 → 전문가에게 보여줄 placeholder.
export function revealClientContact(req: StoredRequest) {
  return {
    company: req.ownerCompany || req.companyDisplay,
    contactName: "담당자(시뮬레이션)",
    email: "client@example.com",
    phone: "010-0000-0000",
  };
}

// 전문가 측 → 의뢰자에게 보여줄 placeholder.
export function revealExpertContact(expertId: string) {
  return {
    email: `${expertId.toLowerCase()}@example.com`,
    phone: "010-0000-0000",
  };
}
