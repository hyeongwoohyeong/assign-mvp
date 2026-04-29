"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Expert } from "@/lib/types";
import {
  ids,
  saveMyContactRequest,
  type StoredContactRequest,
} from "@/lib/storage";

interface ExpertCardProps {
  expert: Expert;
}

// COMPLIANCE NOTE — 디렉토리 카드 설계 원칙:
//   1) '인증 전문가' 같은 플랫폼 보증/추천 인상의 배지를 사용하지 않는다.
//   2) "연락 요청" 액션은 반드시 전문가의 명시적 수락 이후에만 연락처가
//      공유된다는 점을 사용자에게 안내한다.
//   3) 본 카드 단계에서는 절대 연락처(이메일/전화)를 노출하지 않는다.
//   4) 회사명/담당자명 등 의뢰자 측 정보도 입력 단계에서만 받고
//      카드에는 어떤 형태로도 노출하지 않는다.

export default function ExpertCard({ expert }: ExpertCardProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-navy-100 bg-white p-6 shadow-soft transition hover:border-navy-300 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-navy-900">{expert.name}</h3>
          <p className="mt-1 text-sm font-medium text-navy-600">{expert.firm}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {expert.specialties.map((s) => (
          <span
            key={s}
            className="rounded-md bg-navy-50 px-2 py-1 text-xs font-medium text-navy-700"
          >
            {s}
          </span>
        ))}
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-navy-500">자격</dt>
          <dd className="text-navy-800">{expert.qualifications.join(", ")}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-navy-500">경험</dt>
          <dd className="text-navy-800">{expert.experienceSummary}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-navy-500">담당 영역</dt>
          <dd className="text-navy-800">
            {expert.serviceCategories.join(", ")}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-navy-500">지역</dt>
          <dd className="text-navy-800">{expert.location}</dd>
        </div>
      </dl>

      <div className="mt-6 flex-1" />

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          연락 요청
        </button>
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white"
        >
          프로필 보기
        </button>
      </div>

      {profileOpen && (
        <ExpertProfileModal
          expert={expert}
          onClose={() => setProfileOpen(false)}
          onRequestContact={() => {
            setProfileOpen(false);
            setContactOpen(true);
          }}
        />
      )}

      {contactOpen && (
        <ContactRequestModal
          expert={expert}
          onClose={() => setContactOpen(false)}
          onCompleted={() => {
            setContactOpen(false);
            setToast(
              `${expert.name} 전문가에게 연락 요청을 보냈습니다. "내 활동"에서 응답을 확인할 수 있습니다.`,
            );
          }}
        />
      )}

      {toast && (
        <div
          className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-lg bg-navy-900 px-4 py-3 text-sm font-medium text-white shadow-card"
          role="status"
          aria-live="polite"
        >
          <span className="flex-1 text-left">{toast}</span>
          <Link
            href="/my"
            className="shrink-0 rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/25"
          >
            내 활동 →
          </Link>
        </div>
      )}
    </div>
  );
}

// 연락 요청은 3단계로 구성된다.
//   STEP 1 (form)        — 의뢰자 측 정보 + 문의 컨텍스트 입력
//   STEP 2 (submitted)   — "연락 요청이 정상적으로 전달되었습니다" 즉시 피드백
//   STEP 3 (delivered)   — "담당자에게 요청이 전달되었습니다. 빠른 시일 내에 연락이
//                          이루어질 수 있습니다." 최종 안내
type ContactStep = "form" | "submitted" | "delivered";

function ContactRequestModal({
  expert,
  onClose,
  onCompleted,
}: {
  expert: Expert;
  onClose: () => void;
  onCompleted: () => void;
}) {
  const [step, setStep] = useState<ContactStep>("form");
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    const requestId = ids.contactRequest();
    const stored: StoredContactRequest = {
      id: requestId,
      expertId: expert.id,
      expertName: expert.name,
      expertFirm: expert.firm,
      expertSpecialties: expert.specialties,
      clientCompany: company,
      clientContext: context,
      status: "요청대기",
      requestedAt: new Date().toISOString(),
    };
    saveMyContactRequest(stored);

    // 관리자 신호 — 운영자가 콘솔에서 신규 연락 요청을 즉시 확인할 수 있게 한다.
    console.log("ADMIN: 연락 요청", {
      requestId,
      expertId: expert.id,
      expertName: expert.name,
      expertFirm: expert.firm,
      senderCompany: company,
      senderContactName: contactName,
      senderEmail: email,
      senderPhone: phone,
      context,
    });

    // 운영자에게 알림 메일.
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          data: {
            requestId,
            expertName: expert.name,
            expertFirm: expert.firm,
            specialties: expert.specialties,
            senderCompany: company,
            senderContactName: contactName,
            senderEmail: email,
            senderPhone: phone,
            description: context,
          },
        }),
      });
      if (!res.ok) {
        console.error("[contact] notify failed:", await res.text());
      }
    } catch (err) {
      console.error("[contact] notify error:", err);
    } finally {
      setSubmitting(false);
    }

    setStep("submitted");
  }

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
        {step === "form" && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-navy-500">연락 요청 보내기</p>
                <h3 className="mt-1 text-lg font-bold text-navy-900">
                  {expert.name}{" "}
                  <span className="text-sm font-medium text-navy-500">
                    · {expert.firm}
                  </span>
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
              COMPLIANCE 안내문 — 연락 요청은 전문가의 수락 이후에만 연락처가
              공유된다는 점을 명시한다.
            */}
            <div className="mt-4 rounded-lg border border-navy-100 bg-[#f7f9fc] p-3 text-xs leading-relaxed text-navy-600">
              전문가가 연락 요청을{" "}
              <strong className="font-semibold text-navy-900">수락</strong>한 경우에만
              양측 이메일이 서로에게 공유됩니다. 수락 전에는 어떠한 연락처도 공유되지
              않으며, Assign은 계약을 중개하지 않습니다.
            </div>

            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label-base" htmlFor="contact-company">
                    회사명
                  </label>
                  <input
                    id="contact-company"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="예) 주식회사 어사인"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="contact-name">
                    담당자명
                  </label>
                  <input
                    id="contact-name"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="예) 홍길동"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="contact-email">
                    이메일
                  </label>
                  <input
                    id="contact-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="company@example.com"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base" htmlFor="contact-phone">
                    연락처
                  </label>
                  <input
                    id="contact-phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="input-base"
                  />
                </div>
              </div>
              <div>
                <label className="label-base" htmlFor="contact-context">
                  어떤 일로 연락을 원하시나요?
                </label>
                <textarea
                  id="contact-context"
                  required
                  rows={4}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="문의하시는 서비스 영역, 일정, 대략적인 규모 등을 적어주세요."
                  className="input-base"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600">{errorMsg}</p>
              )}

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
                  disabled={submitting}
                  className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-navy-300"
                >
                  {submitting ? "전달 중..." : "연락 요청 보내기"}
                </button>
              </div>
            </form>
          </>
        )}

        {step === "submitted" && (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-bold text-navy-900">
              연락 요청이 정상적으로 전달되었습니다.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              {expert.name} 전문가에게 요청을 전달했습니다.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setStep("delivered")}
                className="rounded-lg bg-navy-900 px-5 py-2 text-sm font-semibold text-white hover:bg-navy-800"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {step === "delivered" && (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-bold text-navy-900">
              담당자에게 요청이 전달되었습니다.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              빠른 시일 내에 연락이 이루어질 수 있습니다.
              <br />
              "내 활동" 페이지에서 진행 상태를 확인하실 수 있습니다.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Link
                href="/my"
                className="rounded-lg border border-navy-200 px-5 py-2 text-sm font-semibold text-navy-800 hover:border-navy-400"
              >
                내 활동 페이지로
              </Link>
              <button
                type="button"
                onClick={onCompleted}
                className="rounded-lg bg-navy-900 px-5 py-2 text-sm font-semibold text-white hover:bg-navy-800"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// 전문가 프로필 모달
// =====================================================================
//
// COMPLIANCE: 본 모달에서도 전문가의 이메일/전화 등 연락처는 절대 노출하지
// 않는다. 연락처는 "연락 요청 → 수락" 흐름을 통해서만 공유된다.
function ExpertProfileModal({
  expert,
  onClose,
  onRequestContact,
}: {
  expert: Expert;
  onClose: () => void;
  onRequestContact: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-900/50 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="my-6 w-full max-w-2xl rounded-2xl border border-navy-100 bg-white shadow-card"
        role="dialog"
        aria-modal="true"
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3 border-b border-navy-100 bg-[#f7f9fc] px-6 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
              전문가 프로필
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="text-2xl font-bold text-navy-900">
                {expert.name}
              </h2>
              <span className="text-sm font-medium text-navy-600">
                {expert.firm}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-500">
              <span>등록번호 {expert.id}</span>
              <span aria-hidden="true">·</span>
              <span>{expert.location}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 py-1 text-sm text-navy-600 hover:bg-white"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          {/* 전문분야 — 강조된 태그 */}
          <section>
            <SectionLabel>전문분야</SectionLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {expert.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-navy-900 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* 자격 + 평균 보수 + 선호 용역 — 키-값 그리드 */}
          <section className="grid gap-x-6 gap-y-4 rounded-xl border border-navy-100 bg-[#fafbfd] p-5 sm:grid-cols-2">
            <KV label="보유 자격" value={expert.qualifications.join(", ")} />
            {expert.feeRange && (
              <KV label="평균 보수 범위" value={expert.feeRange} />
            )}
            {expert.preferredServices && expert.preferredServices.length > 0 && (
              <KV
                label="선호 용역 유형"
                value={expert.preferredServices.join(", ")}
              />
            )}
            <KV label="담당 가능 지역" value={expert.location} />
          </section>

          {/* 주요 수행 경험 — bullet */}
          <section>
            <SectionLabel>주요 수행 경험</SectionLabel>
            {expert.experienceBullets && expert.experienceBullets.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-navy-800">
                {expert.experienceBullets.map((b, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-900"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-navy-700">
                {expert.experienceSummary}
              </p>
            )}
          </section>

          {/* 프로필 소개 — intro 줄별 렌더 */}
          {expert.intro && expert.intro.length > 0 && (
            <section>
              <SectionLabel>프로필 소개</SectionLabel>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-navy-700">
                {expert.intro.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </section>
          )}

          {/* 컴플라이언스 안내 */}
          <div className="rounded-lg border border-navy-100 bg-[#f7f9fc] p-4 text-xs leading-relaxed text-navy-600">
            <strong className="font-semibold text-navy-900">
              연락처 안내.
            </strong>{" "}
            전문가의 이메일·전화번호는 "연락 요청"을 보낸 뒤 전문가가 수락한 경우에만
            양측에 공유됩니다. 본 페이지에서는 연락처를 노출하지 않습니다.
          </div>
        </div>

        {/* 액션 푸터 */}
        <div className="flex flex-col-reverse gap-2 border-t border-navy-100 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:border-navy-400"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onRequestContact}
            className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
          >
            연락 요청 보내기 →
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
      {children}
    </p>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-navy-900">{value}</p>
    </div>
  );
}
