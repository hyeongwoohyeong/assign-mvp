"use client";

import { useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { SERVICE_CATEGORIES } from "@/lib/mockData";
import type { BudgetRange, ServiceCategory } from "@/lib/types";

const BUDGET_RANGES: BudgetRange[] = [
  "300만원 이하",
  "300만원~1,000만원",
  "1,000만원~3,000만원",
  "3,000만원 이상",
];

// 희망 착수 시점은 자유 입력 대신 4개의 표준화된 옵션으로 받는다.
// 운영자가 의뢰 정리할 때 정규화 부담을 줄이고, 매칭 시 일정 우선순위를 빠르게 판단할 수 있다.
const START_DATE_OPTIONS = ["1주 내", "1개월 내", "1~3개월", "협의 가능"] as const;
type StartDateOption = (typeof START_DATE_OPTIONS)[number] | "";

// 의뢰번호 — 클라이언트 측에서 제출 시 발급. DB 없이도 사용자/운영자가 같은 의뢰를 참조할 수 있게 한다.
function generateRequestId() {
  return `REQ-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

interface RequestFormState {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: ServiceCategory | "";
  location: string;
  budget: BudgetRange | "";
  startDate: StartDateOption;
  description: string;
  confidential: boolean;
}

type RequestField =
  | "company"
  | "contactName"
  | "email"
  | "phone"
  | "serviceType"
  | "location"
  | "budget"
  | "startDate"
  | "description";

type RequestFormErrors = Partial<Record<RequestField, string>>;

const INITIAL_STATE: RequestFormState = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  serviceType: "",
  location: "",
  budget: "",
  startDate: "",
  description: "",
  confidential: false,
};

export default function RequestPage() {
  const [form, setForm] = useState<RequestFormState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<RequestFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // honeypot — 사람 눈에는 안 보이는 필드. 봇은 이 칸을 채우는 경향이 있어 값이 있으면 무시 처리.
  const [hp, setHp] = useState("");

  function update<K extends keyof RequestFormState>(
    key: K,
    value: RequestFormState[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(next: RequestFormState): RequestFormErrors {
    const phonePattern = /^(01[0-9]-?\d{3,4}-?\d{4}|0\d{1,2}-?\d{3,4}-?\d{4})$/;
    const nextErrors: RequestFormErrors = {};

    if (!next.company.trim()) nextErrors.company = "회사명을 입력해주세요.";
    if (!next.contactName.trim()) nextErrors.contactName = "담당자명을 입력해주세요.";
    if (!next.email.trim()) nextErrors.email = "이메일을 입력해주세요.";
    if (!next.phone.trim()) nextErrors.phone = "연락처를 입력해주세요.";
    if (next.phone.trim() && !phonePattern.test(next.phone.trim())) {
      nextErrors.phone = "연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)";
    }
    if (!next.serviceType) nextErrors.serviceType = "서비스 유형을 선택해주세요.";
    if (!next.location.trim()) nextErrors.location = "회사 소재지를 입력해주세요.";
    if (!next.budget) nextErrors.budget = "예산 범위를 선택해주세요.";
    if (!next.startDate) nextErrors.startDate = "희망 착수 시점을 선택해주세요.";
    if (!next.description.trim()) {
      nextErrors.description = "프로젝트 설명을 입력해주세요.";
    } else if (next.description.trim().length < 20) {
      nextErrors.description = "프로젝트 설명은 20자 이상 입력해주세요.";
    }

    return nextErrors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const requestId = generateRequestId();
    setSubmittedId(requestId);

    // 운영자에게 알림 메일을 보내기 위해 /api/notify 로 폼 데이터를 전송한다.
    // 메일 전송이 실패해도 사용자에겐 정상 접수로 안내하고,
    // 콘솔 / 서버 로그로 추적할 수 있도록 한다.
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "request",
          // hp 가 채워져 있으면 서버에서 메일 발송을 건너뛴다.
          data: { ...form, requestId, _hp: hp },
        }),
      });
      if (!res.ok) {
        console.error("[request] notify failed:", await res.text());
      }
    } catch (err) {
      console.error("[request] notify error:", err);
    }
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <div className="rounded-2xl border border-navy-100 bg-white p-10 text-center shadow-soft">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-navy-900">
            의뢰가 정상적으로 접수되었습니다
          </h1>
          {submittedId && (
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-[#f7f9fc] px-4 py-1.5">
              <span className="text-xs font-medium text-navy-500">의뢰번호</span>
              <span className="text-sm font-bold tracking-wider text-navy-900">
                {submittedId}
              </span>
            </div>
          )}
          <p className="mt-5 text-sm leading-relaxed text-navy-600">
            Assign 운영팀이 의뢰 내용을 직접 검토한 뒤,
            <br />
            영업일 기준 1~2일 내에 적합한 전문가들을 매칭하여 연락드리겠습니다.
          </p>
          <p className="mt-3 text-xs text-navy-500">
            의뢰 관련 문의는 <strong>contact@getassign.kr</strong> 또는 접수 안내
            메일에 회신해주시면 같은 의뢰로 연결됩니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800"
            >
              홈으로 돌아가기
            </Link>
            <Link
              href="/experts"
              className="inline-flex items-center justify-center rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-900 hover:border-navy-400"
            >
              전문가 풀 살펴보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">
      <SectionTitle
        eyebrow="용역 의뢰"
        title="필요한 전문서비스를 등록해주세요"
        description="핵심 정보만 입력하면 검증된 전문가 제안을 빠르게 받아볼 수 있습니다. 입력 내용은 매칭 검토 목적 외에는 사용되지 않습니다."
      />

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-6 rounded-2xl border border-navy-100 bg-white p-8 shadow-soft"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-base" htmlFor="company">
              회사명 <span className="text-red-500">*</span>
            </label>
            <input
              id="company"
              required
              className="input-base"
              placeholder="예) 주식회사 어사인"
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
            />
            {errors.company && (
              <p className="mt-1 text-xs text-red-600">{errors.company}</p>
            )}
          </div>
          <div>
            <label className="label-base" htmlFor="contactName">
              담당자명 <span className="text-red-500">*</span>
            </label>
            <input
              id="contactName"
              required
              className="input-base"
              placeholder="예) 홍길동"
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
            />
            {errors.contactName && (
              <p className="mt-1 text-xs text-red-600">{errors.contactName}</p>
            )}
          </div>

          <div>
            <label className="label-base" htmlFor="email">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              required
              type="email"
              className="input-base"
              placeholder="company@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="label-base" htmlFor="phone">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              required
              className="input-base"
              placeholder="010-0000-0000"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="label-base" htmlFor="serviceType">
              필요한 서비스 유형 <span className="text-red-500">*</span>
            </label>
            <select
              id="serviceType"
              required
              className="input-base"
              value={form.serviceType}
              onChange={(e) =>
                update("serviceType", e.target.value as ServiceCategory)
              }
            >
              <option value="" disabled>
                서비스를 선택하세요
              </option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.serviceType && (
              <p className="mt-1 text-xs text-red-600">{errors.serviceType}</p>
            )}
          </div>
          <div>
            <label className="label-base" htmlFor="location">
              회사 소재지 <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              required
              className="input-base"
              placeholder="예) 서울특별시 강남구"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-600">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="label-base" htmlFor="budget">
              예상 용역금액 <span className="text-red-500">*</span>
            </label>
            <select
              id="budget"
              required
              className="input-base"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value as BudgetRange)}
            >
              <option value="" disabled>
                예산 범위를 선택하세요
              </option>
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-navy-500">
              정확하지 않아도 됩니다. 협의 가능합니다.
            </p>
            {errors.budget && (
              <p className="mt-1 text-xs text-red-600">{errors.budget}</p>
            )}
          </div>
          <div>
            <label className="label-base">
              희망 착수 시점 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {START_DATE_OPTIONS.map((opt) => {
                const checked = form.startDate === opt;
                return (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-sm transition ${
                      checked
                        ? "border-navy-900 bg-navy-900 text-white"
                        : "border-navy-200 bg-white text-navy-800 hover:border-navy-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="startDate"
                      className="sr-only"
                      checked={checked}
                      onChange={() => update("startDate", opt)}
                    />
                    <span className="font-medium">{opt}</span>
                  </label>
                );
              })}
            </div>
            {errors.startDate && (
              <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="label-base" htmlFor="description">
            프로젝트 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={6}
            className="input-base resize-y"
            placeholder="회사 상황, 필요한 업무 범위, 일정, 산출물 등을 가능한 한 상세히 작성해주세요."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs text-red-600">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-navy-400">{form.description.length}자</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-navy-100 bg-[#f7f9fc] p-4">
          <input
            id="confidential"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-navy-300 text-navy-900 focus:ring-navy-500"
            checked={form.confidential}
            onChange={(e) => update("confidential", e.target.checked)}
          />
          <label htmlFor="confidential" className="text-sm text-navy-700">
            <span className="font-semibold text-navy-900">보안이 필요합니다</span>
            <span className="ml-1">
              — 회사명, 담당자명, 회사 이메일 도메인을 가린 익명 요약본 형태로
              전문가에게 전달합니다.
            </span>
          </label>
        </div>

        {/* honeypot — 사람 눈에는 안 보이는 필드. 봇이 자동 채움하면 서버에서 무시 처리. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0"
        >
          <label htmlFor="_hp">이 항목은 비워두세요</label>
          <input
            id="_hp"
            type="text"
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-800 hover:border-navy-400"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-navy-900 px-8 py-3 text-sm font-semibold text-white hover:bg-navy-800"
          >
            {isSubmitting ? "제출 중..." : "의뢰 제출하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
