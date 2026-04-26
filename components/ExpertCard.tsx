"use client";

import { useEffect, useState } from "react";
import type { Expert } from "@/lib/types";

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
          className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white"
        >
          프로필 보기
        </button>
      </div>

      {contactOpen && (
        <ContactRequestModal
          expert={expert}
          onClose={() => setContactOpen(false)}
          onSubmit={() => {
            setContactOpen(false);
            setToast(
              `${expert.name} 전문가에게 연락 요청을 보냈습니다. 전문가가 수락하면 연락처가 공유됩니다.`,
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

function ContactRequestModal({
  expert,
  onClose,
  onSubmit,
}: {
  expert: Expert;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");

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
            <p className="text-xs font-medium text-navy-500">연락 요청 보내기</p>
            <h3 className="mt-1 text-lg font-bold text-navy-900">
              {expert.name} <span className="text-sm font-medium text-navy-500">· {expert.firm}</span>
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
          전문가가 연락 요청을 <strong className="font-semibold text-navy-900">수락</strong>한
          경우에만 양측 이메일이 서로에게 공유됩니다. 수락 전에는 어떠한 연락처도
          공유되지 않으며, Assign은 계약을 중개하지 않습니다.
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div>
            <label className="label-base" htmlFor="contact-company">
              회사명 또는 의뢰자 식별
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
              연락 요청 보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
