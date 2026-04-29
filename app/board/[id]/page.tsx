"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MOCK_PUBLIC_REQUESTS } from "@/lib/mockData";
import type { PublicRequest } from "@/lib/types";
import {
  closeMyRequest,
  getMyRequest,
  ids as idHelpers,
  listMyRequests,
  saveMyProposal,
  subscribe,
  updateMyRequest,
  type StoredProposal,
} from "@/lib/storage";

// COMPLIANCE NOTE — 의뢰 상세 페이지 설계 원칙:
//   1) "운영자가 매칭한다"는 표현이 없도록 한다.
//   2) "제안하기"는 전문가 본인의 자율 행위로 표현한다.
//   3) 제안 메시지에는 연락처 자체가 포함되지 않으며, 의뢰자가
//      "연락 허용" 을 누른 경우에만 연락처가 공유될 수 있다.
//   4) "추천", "베스트 매치" 같은 정렬·강조 표현을 사용하지 않는다.

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  // useParams() 반환값이 string | string[] | undefined 일 수 있어 안전하게 좁힌다.
  const idRaw = params?.id;
  const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;
  const searchParams = useSearchParams();
  // /board 카드의 "제안하기" 버튼이 ?action=propose 로 진입하면 자동으로 모달을 연다.
  const wantsPropose = searchParams?.get("action") === "propose";

  // 본 페이지는 (1) 사용자 본인이 등록해 storage 에 영속화한 의뢰,
  // (2) MOCK_PUBLIC_REQUESTS 에 들어 있는 데모 의뢰 둘 다 상세 보기를 지원한다.
  // 본인 의뢰는 storage 의 변경을 따라가야 하므로 useState + subscribe 로 관리.
  const [hydrated, setHydrated] = useState(false);
  const [storedRequest, setStoredRequest] = useState<PublicRequest | undefined>();
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 본인 의뢰인지 여부 (storage 에 있으면 본인 의뢰).
  const isOwnRequest = useMemo(
    () => (id ? listMyRequests().some((r) => r.id === id) : false),
    // hydrated 가 변할 때 한 번만 다시 읽어도 충분하다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, hydrated],
  );

  useEffect(() => {
    if (!id) return;
    function refresh() {
      const own = getMyRequest(id!);
      if (own) {
        setStoredRequest(own);
      } else {
        const mock = MOCK_PUBLIC_REQUESTS.find((r) => r.id === id);
        setStoredRequest(mock);
      }
      // hydrated 는 데이터 set 직후에 true 로 바꾸어, 한 프레임이라도
      // (hydrated=true, storedRequest=undefined) 가 보이지 않도록 한다.
      setHydrated(true);
    }
    refresh();
    return subscribe(refresh);
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  // 데이터 로드 + ?action=propose 가 있으면 자동으로 모달 오픈.
  useEffect(() => {
    if (!hydrated) return;
    if (!storedRequest) return;
    if (wantsPropose && storedRequest.status !== "마감") {
      setProposalModalOpen(true);
    }
    // 한 번만 자동 오픈한다 — wantsPropose 가 true 일 때 hydrated 이후 한 번.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, wantsPropose]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8 text-center text-sm text-navy-500">
        불러오는 중...
      </div>
    );
  }

  if (!storedRequest) {
    // 친절한 인라인 안내 — Next.js notFound() 강제 404 대신, 무엇이 잘못됐는지
    // 알려주고 게시판으로 돌아갈 수 있는 진입점을 제공한다.
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 lg:px-8">
        <div className="rounded-2xl border border-navy-100 bg-white p-10 text-center shadow-soft">
          <h1 className="text-xl font-bold text-navy-900">
            의뢰 정보를 불러올 수 없습니다
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">
            요청하신 의뢰가 게시판이나 본인 활동 기록에서 확인되지 않습니다.
            <br />
            의뢰 ID:{" "}
            <span className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-xs text-navy-800">
              {id || "(없음)"}
            </span>
          </p>
          <p className="mt-3 text-xs text-navy-500">
            의뢰가 다른 브라우저에서 등록되었거나, 사용자가 의뢰를 삭제하셨을 수
            있습니다. 본 게시판은 사용자 본인 브라우저의 활동 기록을 함께 노출합니다.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              href="/board"
              className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
            >
              의뢰 게시판으로
            </Link>
            <Link
              href="/my"
              className="rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:border-navy-400"
            >
              내 활동으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const request = storedRequest;

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
          <div className="flex flex-wrap gap-2">
            {isOwnRequest && request.status !== "마감" && (
              <button
                type="button"
                onClick={() => {
                  closeMyRequest(request.id);
                  setToast("의뢰를 마감 처리했습니다.");
                }}
                className="rounded-lg border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-600 hover:border-rose-300 hover:text-rose-700"
              >
                의뢰 마감
              </button>
            )}
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
        {isOwnRequest && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            본 의뢰는 사용자 본인이 등록한 의뢰입니다. 제안 카드의 "연락 허용" 또는 "제안 종료"를 직접 선택하실 수 있습니다.
            본인 의뢰에 직접 제안을 등록할 수도 있으나(테스트 목적) 일반적으로는 다른 사용자의 의뢰에 제안하시는 것을 권장합니다.
          </p>
        )}
      </div>

      {/*
        프라이버시 정책 — 도착한 제안은 본 페이지에서 전혀 노출되지 않는다.
        - 전문가들끼리 누가 어떻게 제안했는지 서로 보지 않도록, 제안 목록은
          의뢰자 본인의 "내 활동(/my)" 페이지에서만 확인할 수 있다.
        - 의뢰자가 본인 의뢰일 때만 본 영역 아래에 안내 카드를 보여 준다.
      */}
      {isOwnRequest && (
        <section className="mt-8 rounded-xl border border-navy-100 bg-[#f7f9fc] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-navy-900">
                내 의뢰에 도착한 제안 확인
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-navy-600">
                본 의뢰에 도착한 제안 내역과 "연락 허용 / 제안 종료" 처리는
                의뢰자 본인만 확인할 수 있도록 "내 활동" 페이지에서 관리합니다.
              </p>
            </div>
            <Link
              href="/my"
              className="shrink-0 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
            >
              내 활동에서 확인 →
            </Link>
          </div>
        </section>
      )}

      {/* 제안 모달 — 사용자가 전문가 시점에서 의뢰에 제안을 보내는 입력 화면 */}
      {proposalModalOpen && (
        <ProposalModal
          requestTitle={request.title}
          onClose={() => setProposalModalOpen(false)}
          onSubmit={(payload) => {
            // STORAGE: 사용자가 직접 보낸 제안은 expertId === "ME" 로 저장된다.
            // /my 의 "내가 보낸 제안" 탭은 이 키로 필터링한다.
            const proposalId = idHelpers.proposal();
            const newProposal: StoredProposal = {
              id: proposalId,
              requestId: request.id,
              expertId: "ME",
              expertName: "나(전문가 본인 계정)",
              expertFirm: "본인 계정",
              expertSpecialties: [request.serviceType],
              message: payload.message,
              strengths: payload.strengths,
              requestedContact: payload.requestedContact,
              status: "제안전달",
              sentAt: new Date().toISOString(),
              requestTitle: request.title,
              requestServiceType: request.serviceType,
              requestBudget: request.budget,
            };
            saveMyProposal(newProposal);

            // 본인 의뢰라면 카운터를 함께 증가시켜 /my "내 의뢰" 카드에 즉시 반영한다.
            if (isOwnRequest) {
              const own = getMyRequest(request.id);
              if (own) {
                updateMyRequest(request.id, {
                  proposalCount: (own.proposalCount ?? 0) + 1,
                  status: own.status === "게시됨" ? "제안받는중" : own.status,
                });
              }
            }

            // 관리자 신호 — 운영자가 콘솔에서 신규 제안을 즉시 확인할 수 있게 한다.
            console.log("ADMIN: 새로운 제안", {
              proposalId,
              requestId: request.id,
              requestTitle: request.title,
              requestServiceType: request.serviceType,
              message: payload.message,
              strengths: payload.strengths,
              requestedContact: payload.requestedContact,
            });

            // 운영자에게 알림 메일.
            void fetch("/api/notify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kind: "proposal",
                data: {
                  proposalId,
                  requestId: request.id,
                  requestTitle: request.title,
                  requestServiceType: request.serviceType,
                  requestBudget: request.budget,
                  message: payload.message,
                  strengths: payload.strengths,
                  requestedContact: payload.requestedContact,
                },
              }),
            }).catch((err) => {
              console.error("[board/proposal] notify error:", err);
            });

            setProposalModalOpen(false);
            setToast("제안이 정상적으로 등록되었습니다.");
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

function ProposalModal({
  requestTitle,
  onClose,
  onSubmit,
}: {
  requestTitle: string;
  onClose: () => void;
  onSubmit: (payload: {
    message: string;
    strengths: string;
    requestedContact: boolean;
  }) => void;
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
          의뢰자가 "연락 허용" 을 누른 경우에만 양측 연락처가 공유된다.
        */}
        <div className="mt-4 rounded-lg border border-navy-100 bg-[#f7f9fc] p-3 text-xs leading-relaxed text-navy-600">
          제안은 단순 메시지로만 전달됩니다. 연락처는 의뢰자가 "연락 허용"을
          누른 경우에만 공유되며, 그 전에는 어떠한 연락처도 공유되지 않습니다.
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ message, strengths, requestedContact });
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
