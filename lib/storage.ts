// =====================================================================
// localStorage 기반 활동 저장소
// =====================================================================
//
// 본 모듈은 사용자 본인의 의뢰·제안·연락 요청 흐름이 화면상 자연스럽게
// 이어지도록 하기 위한 클라이언트 측 영속화 레이어이다.
//
// COMPLIANCE NOTE:
//   - 본 저장소는 사용자 본인의 브라우저에서만 동작한다. 운영자(Assign)가
//     의뢰를 특정 전문가에게 매칭하거나 추천하지 않는다.
//   - 연락처는 양 당사자가 명시적으로 동의한 단계에서만 reveal 된다
//     (revealedContact 필드는 동의 후에만 채워진다).
//
// SSR 안전성:
//   Next.js App Router 의 SSR/SSG 단계에서 window 가 없을 수 있으므로
//   모든 read/write 는 typeof window 가드 뒤에서 호출한다.

import type {
  ContactRequest,
  Proposal,
  PublicRequest,
  ServiceCategory,
  BudgetRange,
} from "./types";

// ---------------------------------------------------------------------
// 저장 데이터 타입
// ---------------------------------------------------------------------

// 사용자가 등록한 의뢰. PublicRequest 와 동일한 모양에 약간의 메타데이터를 더한다.
export interface StoredRequest extends PublicRequest {
  // 등록 시 입력한 회사명(공개 옵션이 false 일 경우 본인 식별용으로만 사용).
  ownerCompany: string;
  // 의뢰자가 직접 익명 옵션을 선택했는지 여부 (이미 PublicRequest.isAnonymous 로 노출).
  // 추가적으로 비공개 토글로 전환된 경우를 추적하기 위한 필드.
  closedAt?: string; // 의뢰자가 "마감" 처리한 시각.
}

// "내가 보낸 제안" — 전문가가 공개 의뢰에 직접 제안한 기록.
// status 가 "연락허용"으로 바뀌면 revealedContact 가 채워진다 (의뢰자 측 정보).
export interface StoredProposal extends Proposal {
  // 의뢰 제목/요약을 카드에 같이 보여주기 위해 join 된 값.
  requestTitle: string;
  requestServiceType: ServiceCategory;
  requestBudget: BudgetRange;
  // 연락허용 상태가 되었을 때 의뢰자 측에서 공유받은 연락처.
  // 그 전에는 절대 채워지지 않는다.
  revealedClientContact?: {
    company: string;
    contactName: string;
    email: string;
    phone: string;
  };
}

// "내가 보낸 연락 요청" — 디렉토리에서 전문가에게 직접 보낸 요청.
// 수락 시 revealedExpertContact 가 채워진다.
export interface StoredContactRequest extends ContactRequest {
  // 전문가 카드에서 가져온 표시용 정보 (디렉토리 기준으로 join).
  expertFirm: string;
  expertSpecialties: ServiceCategory[];
  // 수락 상태가 되었을 때 전문가 측에서 공유받은 연락처.
  revealedExpertContact?: {
    email: string;
    phone: string;
  };
}

// ---------------------------------------------------------------------
// localStorage 키
// ---------------------------------------------------------------------

const KEYS = {
  myRequests: "assign:my-requests",
  myProposals: "assign:my-proposals",
  myContactRequests: "assign:my-contact-requests",
} as const;

// ---------------------------------------------------------------------
// SSR-safe wrappers
// ---------------------------------------------------------------------

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage] failed to read ${key}:`, err);
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // 동일 탭의 다른 컴포넌트에 변경 신호 전달.
    window.dispatchEvent(new Event("assign:storage-change"));
  } catch (err) {
    console.warn(`[storage] failed to write ${key}:`, err);
  }
}

// ---------------------------------------------------------------------
// ID 헬퍼
// ---------------------------------------------------------------------

function rand(prefix: string) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${code}`;
}

export const ids = {
  request: () => rand("REQ"),
  proposal: () => rand("PRO"),
  contactRequest: () => rand("CON"),
};

// ---------------------------------------------------------------------
// 내 의뢰 (Client 측)
// ---------------------------------------------------------------------

export function listMyRequests(): StoredRequest[] {
  return safeRead<StoredRequest[]>(KEYS.myRequests, []);
}

export function getMyRequest(id: string): StoredRequest | undefined {
  return listMyRequests().find((r) => r.id === id);
}

export function saveMyRequest(req: StoredRequest) {
  const list = listMyRequests();
  const next = [req, ...list.filter((r) => r.id !== req.id)];
  safeWrite(KEYS.myRequests, next);
}

export function updateMyRequest(
  id: string,
  patch: Partial<StoredRequest>,
): StoredRequest | undefined {
  const list = listMyRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  const next = { ...list[idx], ...patch };
  list[idx] = next;
  safeWrite(KEYS.myRequests, list);
  return next;
}

export function closeMyRequest(id: string) {
  return updateMyRequest(id, {
    status: "마감",
    closedAt: new Date().toISOString(),
  });
}

// 의뢰를 영구 삭제. 본인이 잘못 등록했거나 테스트로 등록한 의뢰를 정리할 때 사용.
// 연결된 제안도 함께 정리한다 (해당 requestId 의 stored proposals 모두 제거).
export function deleteMyRequest(id: string) {
  const list = listMyRequests().filter((r) => r.id !== id);
  safeWrite(KEYS.myRequests, list);
  const proposals = listMyProposals().filter((p) => p.requestId !== id);
  safeWrite(KEYS.myProposals, proposals);
}

// ---------------------------------------------------------------------
// 내 제안 (Expert 측 — 본인이 전문가로서 의뢰에 보낸 제안)
// ---------------------------------------------------------------------

export function listMyProposals(): StoredProposal[] {
  return safeRead<StoredProposal[]>(KEYS.myProposals, []);
}

export function listProposalsForRequest(requestId: string): StoredProposal[] {
  return listMyProposals().filter((p) => p.requestId === requestId);
}

export function saveMyProposal(p: StoredProposal) {
  const list = listMyProposals();
  const next = [p, ...list.filter((x) => x.id !== p.id)];
  safeWrite(KEYS.myProposals, next);
}

export function updateMyProposal(
  id: string,
  patch: Partial<StoredProposal>,
): StoredProposal | undefined {
  const list = listMyProposals();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const next = { ...list[idx], ...patch };
  list[idx] = next;
  safeWrite(KEYS.myProposals, list);
  return next;
}

// ---------------------------------------------------------------------
// 내 연락 요청 (Client → Expert)
// ---------------------------------------------------------------------

export function listMyContactRequests(): StoredContactRequest[] {
  return safeRead<StoredContactRequest[]>(KEYS.myContactRequests, []);
}

export function saveMyContactRequest(c: StoredContactRequest) {
  const list = listMyContactRequests();
  const next = [c, ...list.filter((x) => x.id !== c.id)];
  safeWrite(KEYS.myContactRequests, next);
}

export function updateMyContactRequest(
  id: string,
  patch: Partial<StoredContactRequest>,
): StoredContactRequest | undefined {
  const list = listMyContactRequests();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  const next = { ...list[idx], ...patch };
  list[idx] = next;
  safeWrite(KEYS.myContactRequests, list);
  return next;
}

// ---------------------------------------------------------------------
// 변경 이벤트 구독 (페이지에서 useEffect 로 사용)
// ---------------------------------------------------------------------

export function subscribe(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onChange = () => handler();
  window.addEventListener("assign:storage-change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("assign:storage-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}
