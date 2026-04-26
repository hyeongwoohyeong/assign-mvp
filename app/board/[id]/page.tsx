"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { MOCK_PROPOSALS, MOCK_PUBLIC_REQUESTS } from "@/lib/mockData";
import type { Proposal } from "@/lib/types";

// COMPLIANCE NOTE — 의뢰 상세 페이지 설계 원칙:
//   1) "운영자가 매칭한다"는 표현이 없도록 한다.
//   2) "제안하기"는 전문가 본인의 자율 행위로 표현한다.
//   3) 제안 메시지에는 연락처 자체가 포함되지 않으며, 의뢰자가
//      "연락 허용" 을 누른 경우에만 연락처가 공유될 수 있다.
//      (본 mock 단계에서는 alert/state 변경으로만 시뮬레이션한다.)
//   4) "추천", "베스트 매치" 같은 정렬·강조 표현을 사용하지 않는다.

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const request = useMemo(
    () => MOCK_PUBLIC_REQUESTS.find((r) => r.id === id),
    [id],
  );

  // 제안은 mock 데이터를 초기 상태로 받아오되, "연락 허용" 토글은 로컬 상태로 시뮬레이션.
  const [proposals, setProposals] = useState<Proposal[]>(() =>
    MOCK_PROPOSALS.filter((p) => p.requestId === id),
  );
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!request) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
      <Link
        href="/board"
        className="text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        ← 의뢰 게시판으로
      </Link>

      <div className="mt-4 rounded-xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <RequestStatusBadge status={request.status} />
          <span className="rounded bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-700">
            {request.serviceType}
          </span>
          <span className="text-xs text-navy-500">{request.id}</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
          {request.title}
        </h1>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <Field label="의뢰자" value={request.companyDisplay} />
          <Field label="예산" value={request.budget} />
          <Field label="희망 일정" value={request.timeline} />
          <Field label="등록일" value={request.postedAt} />
        </dl>

        <div className="mt-6 rounded-lg border border-navy-100 bg-[#f7f9fc] p-5">
          <h2 className="text-sm font-semibold text-navy-900">의뢰 내용</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-700">
            {request.description}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-navy-500">
            ※ 본 의뢰는 게시판에 공개된 정보입니다. Assign은 제안을 강제하지
            않으며, 전문가가 자율 판단으로 제안 여부를 결정합니다.
          </p>
          <button
            type="button"
            onClick={() => setProposalModalOpen(true)}
            disabled={request.status === "마감"}
            className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-navy-300"
          >
            {request.status === "마감" ? "마감된 의뢰" : "제안하기"}
          </button>
        </div>
      </div>

      {/* 제안 목록 */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">
            도착한 제안 ({proposals.length})
          </h2>
          <p className="text-xs text-navy-500">
            정렬 순서는 추천을 의미하지 않습니다.
          </p>
        </div>

        {proposals.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-navy-200 bg-white p-10 text-center">
            <p className="text-sm text-navy-500">
              아직 도착한 제안이 없습니다. 전문가가 자율적으로 제안할 수 있도록
              의뢰가 게시판에 공개되어 있습니다.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {proposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                onAllowContact={() => {
                  // COMPLIANCE: 의뢰자가 "연락 허용" 을 누른 경우에만
                  // 상태가 '연락허용' 으로 바뀌고, 양측 연락처가 공유될 수
                  // 있다는 안내를 띄운다. 실제 연락처 노출은 백엔드 단계에서 처리.
                  setProposals((prev) =>
                    prev.map((x) =>
                      x.id === p.id ? { ...x, status: "연락허용" } : x,
                    ),
                  );
                  setToast(
                    `${p.expertName} 전문가에게 연락 허용을 보냈습니다. 양측에 연락처가 공유됩니다.`,
                  );
                }}
                onClose={() => {
                  setProposals((prev) =>
                    prev.map((x) =>
                      x.id === p.id ? { ...x, status: "종료" } : x,
                    ),
                  );
                  setToast(`${p.expertName} 전문가의 제안을 종료 처리했습니다.`);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 제안 모달 (전문가 시점 mock) */}
      {proposalModalOpen && (
        <ProposalModal
          requestTitle={request.title}
          onClose={() => setProposalModalOpen(false)}
          onSubmit={() => {
            setProposalModalOpen(false);
            setToast(
              "제안이 전송되었습니다. 의뢰자가 확인 후 연락 허용 여부를 결정합니다.",
            );
          }}
        />
      )}

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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="w-20 shrink-0 text-navy-500">{label}</dt>
      <dd className="text-navy-800">{value}</dd>
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
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        styles[status] ?? ""
      }`}
    >
      {status}
    </span>
  );
}

function ProposalCard({
  proposal,
  onAllowContact,
  onClose,
}: {
  proposal: Proposal;
  onAllowContact: () => void;
  onClose: () => void;
}) {
  const isClosed = proposal.status === "종료";
  const isAllowed = proposal.status === "연락허용";

  return (
    <div
      className={`rounded-xl border p-5 transition ${
        isClosed
          ? "border-navy-100 bg-[#fafbfd] opacity-70"
          : "border-navy-100 bg-white shadow-soft"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-navy-900">
              {proposal.expertName}
            </p>
            <span className="text-xs text-navy-500">· {proposal.expertFirm}</span>
            <ProposalStatusBadge status={proposal.status} />
            {proposal.requestedContact && !isAllowed && !isClosed && (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                연락 요청 동봉
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {proposal.expertSpecialties.map((s) => (
              <span
                key={s}
                className="rounded bg-navy-50 px-2 py-0.5 text-[11px] text-navy-600"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <span className="text-xs text-navy-400">{proposal.sentAt}</span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            제안 메시지
          </p>
          <p className="mt-1 whitespace-pre-line leading-relaxed text-navy-800">
            {proposal.message}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            본인 강점
          </p>
          <p className="mt-1 text-navy-800">{proposal.strengths}</p>
        </div>
      </div>

      {/*
        COMPLIANCE: 연락처는 status === "연락허용" 시점에만 노출 가능.
        실제 백엔드 연동 전이라, 본 mock 에서는 "공유 예정" 안내문만 노출.
      */}
      {isAllowed && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
          연락 허용이 완료되었습니다. 백엔드 연결 시 양측 이메일/전화가 이 영역에
          노출되며, 이전 단계에서는 어떠한 연락처도 공유되지 않습니다.
        </div>
      )}

      {!isClosed && !isAllowed && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
          <button
            type="button"
            onClick={onAllowContact}
            className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            연락 허용
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-700 transition hover:border-navy-400"
          >
            제안 종료
          </button>
          <p className="ml-auto self-center text-[11px] text-navy-500">
            연락 허용 전에는 어떠한 연락처도 공유되지 않습니다.
          </p>
        </div>
      )}
    </div>
  );
}

function ProposalModal({
  requestTitle,
  onClose,
  onSubmit,
}: {
  requestTitle: string;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [message, setMessage] = useState("");
  const [strengths, setStrengths] = useState("");
  const [requestedContact, setRequestedContact] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-navy-100 bg-white p-6 shadow-card"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-navy-500">제안 보내기</p>
            <h3 className="mt-1 text-lg font-bold text-navy-900">
              {requestTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-navy-600 hover:bg-navy-50"
          >
            닫기
          </button>
        </div>

        {/*
          COMPLIANCE: 제안 단계에서는 연락처를 입력받지 않는다.
          본 mock 에서도 의도적으로 이메일/전화 입력란을 두지 않는다.
        */}
        <div className="mt-4 rounded-lg border border-navy-100 bg-[#f7f9fc] p-3 text-xs leading-relaxed text-navy-600">
          제안은 단순 메시지로만 전달됩니다. 연락처는 의뢰자가 "연락 허용"을
          누른 경우에만 공유되며, 그 전에는 어떠한 연락처도 공유되지 않습니다.
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div>
            <label className="label-base" htmlFor="proposal-message">
              제안 메시지
            </label>
            <textarea
              id="proposal-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="이 의뢰에 어떻게 기여할 수 있는지, 일정/접근 방식 등을 적어주세요."
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base" htmlFor="proposal-strengths">
              본인 강점 (선택)
            </label>
            <input
              id="proposal-strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="예) 동일 영역 12건 수행 / 영문 보고서 가능"
              className="input-base"
            />
          </div>
          <label className="flex items-start gap-2 rounded-lg border border-navy-100 bg-white p-3 text-sm text-navy-700">
            <input
              type="checkbox"
              checked={requestedContact}
              onChange={(e) => setRequestedContact(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-navy-300"
            />
            <span>
              연락 요청을 함께 보냅니다.
              <span className="mt-1 block text-xs text-navy-500">
                의뢰자가 "연락 허용"을 누르면 양측 연락처가 공유됩니다. 의뢰자가
                허용하기 전에는 연락처가 공유되지 않습니다.
              </span>
            </span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-700 hover:border-navy-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
            >
              제안 보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
