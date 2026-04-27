"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import {
  closeMyRequest,
  listMyContactRequests,
  listMyProposals,
  listMyRequests,
  subscribe,
  updateMyContactRequest,
  type StoredContactRequest,
  type StoredProposal,
  type StoredRequest,
} from "@/lib/storage";
// COMPLIANCE: revealExpertContact 는 인적 동의 후 placeholder 연락처를 노출하기 위한
//   순수 함수로, 자동 매칭/추천 로직과 무관하다.
import { revealExpertContact } from "@/lib/simulation";

// COMPLIANCE NOTE — 내 활동 대시보드 설계 원칙:
//   1) 본 페이지는 사용자 본인의 브라우저에 저장된 활동만 노출한다.
//      운영자가 사용자 행동을 매칭/추천한 결과가 아니다.
//   2) 연락처는 status 가 "연락허용 / 수락" 으로 바뀐 후에만 reveal 된다.
//   3) 모든 빈 상태에서 다음 단계로 이동할 수 있는 진입점을 제공한다.

type Tab = "requests" | "proposals" | "contacts" | "inbox";

const TABS: { id: Tab; label: string; description: string }[] = [
  {
    id: "requests",
    label: "내 의뢰",
    description: "내가 등록한 의뢰와 도착한 제안 현황을 확인합니다.",
  },
  {
    id: "proposals",
    label: "내가 보낸 제안",
    description: "공개 의뢰에 직접 보낸 제안의 처리 상태를 확인합니다.",
  },
  {
    id: "contacts",
    label: "내가 보낸 연락 요청",
    description: "디렉토리에서 전문가에게 보낸 연락 요청의 응답 상태입니다.",
  },
  {
    id: "inbox",
    label: "받은 연락 요청",
    description: "전문가 시점에서 도착한 연락 요청을 확인합니다.",
  },
];

export default function MyDashboardPage() {
  const [tab, setTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<StoredRequest[]>([]);
  const [proposals, setProposals] = useState<StoredProposal[]>([]);
  const [contactRequests, setContactRequests] = useState<StoredContactRequest[]>(
    [],
  );
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setRequests(listMyRequests());
    setProposals(listMyProposals());
    setContactRequests(listMyContactRequests());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    const unsub = subscribe(refresh);
    return unsub;
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const incoming = contactRequests; // 본 dashboard 에서는 동일한 store 를 inbox 로도 노출.

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
      <SectionTitle
        eyebrow="내 활동"
        title="내가 등록한 의뢰와 보낸 제안을 한 곳에서 확인하세요"
        description="등록한 의뢰의 도착 제안, 내가 보낸 제안의 응답, 연락 요청 처리 상태를 모두 확인할 수 있습니다. 본 활동 정보는 사용자 본인 브라우저에만 저장됩니다."
      />

      <div className="mt-6 rounded-lg border border-navy-100 bg-[#f7f9fc] p-4 text-xs leading-relaxed text-navy-600">
        ※ 본 페이지의 활동 내역은 사용자 본인 브라우저에 저장됩니다. Assign은
        의뢰를 특정 전문가에게 매칭/추천하지 않으며, 연락처는 양 당사자가 명시적으로
        동의한 단계에서만 공유됩니다.
      </div>

      {/* 탭 */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-navy-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id
                ? "border border-b-white border-navy-200 bg-white text-navy-900"
                : "text-navy-500 hover:text-navy-800"
            }`}
          >
            {t.label}
            {t.id === "requests" && requests.length > 0 && (
              <span className="ml-2 rounded-full bg-navy-100 px-2 py-0.5 text-[11px] text-navy-700">
                {requests.length}
              </span>
            )}
            {t.id === "proposals" && proposals.length > 0 && (
              <span className="ml-2 rounded-full bg-navy-100 px-2 py-0.5 text-[11px] text-navy-700">
                {proposals.length}
              </span>
            )}
            {t.id === "contacts" && contactRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-navy-100 px-2 py-0.5 text-[11px] text-navy-700">
                {contactRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-navy-500">
        {TABS.find((t) => t.id === tab)?.description}
      </p>

      <div className="mt-6">
        {!hydrated ? (
          <div className="rounded-xl border border-navy-100 bg-white p-10 text-center text-sm text-navy-500 shadow-soft">
            불러오는 중...
          </div>
        ) : tab === "requests" ? (
          <RequestsTab
            requests={requests}
            proposals={proposals}
            onChanged={(message) => {
              refresh();
              if (message) setToast(message);
            }}
          />
        ) : tab === "proposals" ? (
          <ProposalsTab proposals={proposals} requests={requests} />
        ) : tab === "contacts" ? (
          <ContactsTab contacts={contactRequests} />
        ) : (
          <InboxTab
            contacts={incoming}
            onChanged={(message) => {
              refresh();
              if (message) setToast(message);
            }}
          />
        )}
      </div>

      {toast && (
        <div
          className="pointer-events-none fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg bg-navy-900 px-4 py-3 text-center text-sm font-medium text-white shadow-card"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 탭 1 — 내가 등록한 의뢰
// =====================================================================
function RequestsTab({
  requests,
  proposals,
  onChanged,
}: {
  requests: StoredRequest[];
  proposals: StoredProposal[];
  onChanged: (message?: string) => void;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="아직 등록한 의뢰가 없습니다"
        description="회사가 필요한 전문서비스를 등록하면, 게시판에 공개되어 전문가가 직접 제안할 수 있습니다."
        primaryHref="/request"
        primaryLabel="첫 의뢰 등록하기"
        secondaryHref="/board"
        secondaryLabel="공개된 의뢰 둘러보기"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {requests.map((r) => {
        const myProposals = proposals.filter((p) => p.requestId === r.id);
        return (
          <div
            key={r.id}
            className="rounded-xl border border-navy-100 bg-white p-6 shadow-soft"
          >
            <div className="flex flex-wrap items-center gap-2">
              <RequestStatusBadge status={r.status} />
              <span className="rounded bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-700">
                {r.serviceType}
              </span>
              <span className="text-xs text-navy-500">{r.id}</span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-navy-900">
              {r.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-navy-600">
              {r.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
              <span>예산: {r.budget}</span>
              <span>일정: {r.timeline}</span>
              <span>등록: {r.postedAt}</span>
              <span>도착 제안: {r.proposalCount}건</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
              <Link
                href={`/board/${r.id}`}
                className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
              >
                의뢰 상세 / 제안 확인
              </Link>
              {r.status !== "마감" && (
                <button
                  type="button"
                  onClick={() => {
                    closeMyRequest(r.id);
                    onChanged("의뢰를 마감 처리했습니다.");
                  }}
                  className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-600 hover:border-rose-300 hover:text-rose-700"
                >
                  의뢰 마감
                </button>
              )}
              <p className="ml-auto self-center text-[11px] text-navy-500">
                내가 받은 제안: {myProposals.length}건
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// 탭 2 — 내가 보낸 제안
// =====================================================================
function ProposalsTab({
  proposals,
  requests,
}: {
  proposals: StoredProposal[];
  requests: StoredRequest[];
}) {
  // 사용자가 board/[id] 에서 직접 보낸 제안은 expertId === "ME" 로 저장된다.
  // 본 탭에서는 그 제안만 노출한다.
  const mine = proposals.filter((p) => p.expertId === "ME");

  if (mine.length === 0) {
    return (
      <EmptyState
        title="아직 보낸 제안이 없습니다"
        description="공개 의뢰 게시판에서 본인 전문분야와 맞는 의뢰를 확인하고 자율적으로 제안할 수 있습니다."
        primaryHref="/board"
        primaryLabel="공개 의뢰 둘러보기"
      />
    );
  }

  const requestById = new Map(requests.map((r) => [r.id, r]));

  return (
    <div className="grid gap-4">
      {mine.map((p) => {
        const linkedRequest = requestById.get(p.requestId);
        return (
          <div
            key={p.id}
            className="rounded-xl border border-navy-100 bg-white p-6 shadow-soft"
          >
            <div className="flex flex-wrap items-center gap-2">
              <ProposalStatusBadge status={p.status} />
              <span className="rounded bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-700">
                {p.requestServiceType}
              </span>
              <span className="text-xs text-navy-500">제안 ID: {p.id}</span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-navy-900">
              {p.requestTitle}
            </h3>
            <div className="mt-2 text-xs text-navy-500">
              의뢰 ID: {p.requestId} · 보낸 시각:{" "}
              {new Date(p.sentAt).toLocaleString("ko-KR")}
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  내가 보낸 메시지
                </p>
                <p className="mt-1 whitespace-pre-line text-navy-800">
                  {p.message}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  강조 포인트
                </p>
                <p className="mt-1 text-navy-800">{p.strengths || "—"}</p>
              </div>
            </div>

            {p.status === "연락허용" && p.revealedClientContact && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900">
                <strong className="font-semibold">의뢰자가 연락을 허용했습니다.</strong>
                <div className="mt-2 grid gap-1">
                  <span>회사명: {p.revealedClientContact.company}</span>
                  <span>담당자: {p.revealedClientContact.contactName}</span>
                  <span>이메일: {p.revealedClientContact.email}</span>
                  <span>전화: {p.revealedClientContact.phone}</span>
                </div>
              </div>
            )}
            {p.status === "제안전달" && (
              <p className="mt-4 text-xs text-navy-500">
                의뢰자가 검토 후 "연락 허용"을 누르면 양측 연락처가 이 영역에
                노출됩니다. 그 전에는 어떠한 연락처도 공유되지 않습니다.
              </p>
            )}

            {linkedRequest && (
              <div className="mt-5 border-t border-navy-100 pt-3 text-xs text-navy-500">
                연결된 의뢰{" "}
                <Link
                  href={`/board/${linkedRequest.id}`}
                  className="font-medium text-navy-800 underline-offset-4 hover:underline"
                >
                  {linkedRequest.title} →
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// 탭 3 — 내가 보낸 연락 요청
// =====================================================================
function ContactsTab({ contacts }: { contacts: StoredContactRequest[] }) {
  // 의뢰자 입장에서 "내가 디렉토리에서 보낸 연락 요청".
  if (contacts.length === 0) {
    return (
      <EmptyState
        title="보낸 연락 요청이 없습니다"
        description="전문가 디렉토리에서 관심 있는 전문가에게 연락 요청을 보낼 수 있습니다. 전문가가 수락한 경우에만 양측 연락처가 공유됩니다."
        primaryHref="/experts"
        primaryLabel="전문가 디렉토리 둘러보기"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {contacts.map((c) => (
        <div
          key={c.id}
          className="rounded-xl border border-navy-100 bg-white p-6 shadow-soft"
        >
          <div className="flex flex-wrap items-center gap-2">
            <ContactStatusBadge status={c.status} />
            <span className="text-xs text-navy-500">요청 ID: {c.id}</span>
          </div>
          <h3 className="mt-3 text-base font-semibold text-navy-900">
            {c.expertName} <span className="text-sm text-navy-500">· {c.expertFirm}</span>
          </h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {c.expertSpecialties.map((s) => (
              <span
                key={s}
                className="rounded bg-navy-50 px-2 py-0.5 text-[11px] text-navy-600"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-3 text-xs text-navy-500">
            보낸 시각: {new Date(c.requestedAt).toLocaleString("ko-KR")}
          </div>
          <div className="mt-4 rounded-lg border border-navy-100 bg-[#f7f9fc] p-3 text-sm text-navy-700">
            <p className="text-xs font-semibold text-navy-500">전달한 의뢰 컨텍스트</p>
            <p className="mt-1 whitespace-pre-line">{c.clientContext}</p>
          </div>

          {c.status === "수락" && c.revealedExpertContact ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900">
              <strong className="font-semibold">전문가가 요청을 수락했습니다.</strong>
              <div className="mt-2 grid gap-1">
                <span>이메일: {c.revealedExpertContact.email}</span>
                <span>전화: {c.revealedExpertContact.phone}</span>
              </div>
            </div>
          ) : c.status === "거절" ? (
            <p className="mt-4 text-xs text-navy-500">
              전문가가 요청을 거절했습니다. 다른 전문가에게 새로 연락 요청을 보낼 수 있습니다.
            </p>
          ) : (
            <p className="mt-4 text-xs text-navy-500">
              전문가가 요청을 검토 중입니다. "수락" 시 양측 연락처가 이 영역에
              노출되며, 거절 시에는 어떠한 연락처도 공유되지 않습니다.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 탭 4 — 받은 연락 요청 (전문가 시점의 inbox)
// =====================================================================
function InboxTab({
  contacts,
  onChanged,
}: {
  contacts: StoredContactRequest[];
  onChanged: (message?: string) => void;
}) {
  // 사용자가 직접 보낸 연락 요청과 동일한 store 를 전문가 inbox 시각으로도 사용한다.
  // status === "요청대기" 만 inbox 에 노출하며, 응답이 끝난 항목은 "내가 보낸 연락 요청" 탭에서 추적한다.
  const pending = contacts.filter((c) => c.status === "요청대기");

  if (contacts.length === 0) {
    return (
      <EmptyState
        title="아직 받은 연락 요청이 없습니다"
        description="전문가 디렉토리에 등록된 전문가에게 연락 요청이 도착하면 이 곳에서 응답할 수 있습니다."
        primaryHref="/experts"
        primaryLabel="전문가 디렉토리 둘러보기"
      />
    );
  }

  if (pending.length === 0) {
    return (
      <div className="rounded-xl border border-navy-100 bg-white p-8 text-sm text-navy-600 shadow-soft">
        모든 연락 요청에 대해 응답을 마쳤습니다. 처리 결과는 "내가 보낸 연락 요청" 탭에서
        확인할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {pending.map((c) => (
        <div
          key={c.id}
          className="rounded-xl border border-navy-100 bg-white p-6 shadow-soft"
        >
          <div className="flex flex-wrap items-center gap-2">
            <ContactStatusBadge status={c.status} />
            <span className="text-xs text-navy-500">요청 ID: {c.id}</span>
          </div>
          <h3 className="mt-3 text-base font-semibold text-navy-900">
            {c.clientCompany}
          </h3>
          <div className="mt-2 text-xs text-navy-500">
            대상 전문가: {c.expertName} · {c.expertFirm}
          </div>
          <div className="mt-4 rounded-lg border border-navy-100 bg-[#f7f9fc] p-3 text-sm text-navy-700">
            <p className="text-xs font-semibold text-navy-500">의뢰 컨텍스트</p>
            <p className="mt-1 whitespace-pre-line">{c.clientContext}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
            <button
              type="button"
              onClick={() => {
                updateMyContactRequest(c.id, {
                  status: "수락",
                  revealedExpertContact: revealExpertContact(c.expertId),
                });
                onChanged("연락 요청을 수락했습니다. 양측 연락처가 공유됩니다.");
              }}
              className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
            >
              수락 — 연락처 공유
            </button>
            <button
              type="button"
              onClick={() => {
                updateMyContactRequest(c.id, { status: "거절" });
                onChanged("연락 요청을 거절했습니다. 어떠한 연락처도 공유되지 않습니다.");
              }}
              className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-700 hover:border-rose-300 hover:text-rose-700"
            >
              거절
            </button>
            <p className="ml-auto self-center text-[11px] text-navy-500">
              수락 전에는 어떠한 연락처도 공유되지 않습니다.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 공통 컴포넌트
// =====================================================================
function EmptyState({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-navy-200 bg-white p-12 text-center shadow-soft">
      <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-navy-600">{description}</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          {primaryLabel} →
        </Link>
        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:border-navy-400"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

function RequestStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    게시됨: "bg-blue-50 text-blue-700 ring-blue-200",
    제안받는중: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    마감: "bg-navy-50 text-navy-600 ring-navy-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] ?? "bg-navy-50 text-navy-700 ring-navy-200"
      }`}
    >
      {status}
    </span>
  );
}

function ProposalStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    제안전달: "bg-blue-50 text-blue-700 ring-blue-200",
    연락허용: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    종료: "bg-navy-50 text-navy-500 ring-navy-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] ?? ""
      }`}
    >
      {status}
    </span>
  );
}

function ContactStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    요청대기: "bg-amber-50 text-amber-700 ring-amber-200",
    수락: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    거절: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] ?? ""
      }`}
    >
      {status}
    </span>
  );
}

// COMPLIANCE NOTE:
//   - 의뢰자 → 전문가 연락처 reveal 은 /board/[id] 의 "연락 허용" 시점에
//     발생하고, StoredProposal.revealedClientContact 로 기록된다.
//     본 페이지의 "내가 보낸 제안" 탭은 그 결과만 보여준다.
//   - 전문가 → 의뢰자 연락처 reveal 은 본 페이지의 InboxTab "수락" 액션에서
//     발생하며, StoredContactRequest.revealedExpertContact 로 기록된다.
