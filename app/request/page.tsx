"use client";

import { useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { SERVICE_CATEGORIES } from "@/lib/mockData";
import type { BudgetRange, ServiceCategory } from "@/lib/types";
import { saveMyRequest, type StoredRequest } from "@/lib/storage";

const BUDGET_RANGES: BudgetRange[] = [
  "300만원 이하",
  "300만원~1,000만원",
  "1,000만원~3,000만원",
  "3,000만원 이상",
];

// 희망 착수 시점은 자유 입력 대신 4개의 표준화된 옵션으로 받는다.
// 의뢰 정리 부담을 줄이고, 전문가가 일정 우선순위를 빠르게 판단할 수 있도록 한다.
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

    // STEP 1 — 사용자 본인 브라우저에 의뢰 영속화.
    // COMPLIANCE: 본 저장은 사용자 자신의 활동 기록을 위한 것일 뿐,
    //   운영자가 매칭/추천하기 위한 행위가 아니다.
    const today = new Date();
    const postedAt = today.toISOString().slice(0, 10);
    const titleFromForm =
      form.description.trim().split("\n")[0]?.slice(0, 60) ||
      `${form.serviceType || "전문서비스"} 의뢰`;
    const stored: StoredRequest = {
      id: requestId,
      title: titleFromForm,
      serviceType: (form.serviceType || "기타") as ServiceCategory,
      budget: (form.budget || "300만원 이하") as BudgetRange,
      timeline: form.startDate || "협의 가능",
      description: form.description,
      status: "게시됨",
      postedAt,
      proposalCount: 0,
      companyDisplay: form.confidential
        ? `${form.serviceType || "전문서비스"} 의뢰 기업`
        : form.company,
      isAnonymous: form.confidential,
      ownerCompany: form.company,
    };
    saveMyRequest(stored);

    // STEP 2 — 운영자(관리자)에게 신규 의뢰 신호 송출.
    //   브라우저 콘솔에 ADMIN 로그를 남겨, 운영자가 페이지 새로고침 없이도
    //   접수 사실을 빠르게 확인할 수 있게 한다.
    console.log("ADMIN: 새로운 요청", { requestId, ...form });

    // STEP 3 — 운영자에게 알림 메일.
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
            등록하신 의뢰가 운영자에게 전달되었습니다.
            <br />
            운영자 검토 후 의뢰 게시판에 공개되며, 그때부터 전문가가 자율적으로
            제안할 수 있습니다.
          </p>

          {/* STEP-BY-STEP — 다음 단계 안내. 사용자가 막히는 곳이 없도록 명확한 진입점을 제공한다. */}
          <div className="mt-6 rounded-xl border border-navy-100 bg-[#f7f9fc] p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              다음 단계
            </p>
            <ol className="mt-3 space-y-2 text-sm text-navy-700">
              <li className="flex gap-2">
                <span className="font-semibold text-navy-900">1.</span>
                <span>
                  운영자가 등록 내용을 확인 후 의뢰 게시판에 공개 게시합니다. 게시 전에는
                  본인 외 다른 방문자에게는 노출되지 않습니다.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-navy-900">2.</span>
                <span>
                  "내 활동" 페이지에서 본인이 등록한 의뢰와 도착한 제안을 한 곳에서
                  추적할 수 있습니다.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-navy-900">3.</span>
                <span>
                  "연락 허용"을 누르면 양측 연락처가 공유되어 직접 협의를 시작할 수
                  있습니다. 그 전에는 어떠한 연락처도 공유되지 않습니다.
                </span>
              </li>
            </ol>
          </div>

          <p className="mt-4 rounded-lg bg-[#f7f9fc] px-4 py-3 text-xs leading-relaxed text-navy-600">
            ※ Assign은 특정 전문가를 추천하거나 계약을 중개하지 않습니다. 전문가
            제안 검토와 계약 여부, 조건은 모두 의뢰자께서 직접 결정하시며, 플랫폼은
            계약의 당사자가 아닙니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/my"
              className="inline-flex items-center justify-center rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800"
            >
              내 활동 페이지로 →
            </Link>
            {submittedId && (
              <Link
                href={`/board/${submittedId}`}
                className="inline-flex items-center justify-center rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-900 hover:border-navy-400"
              >
                내 의뢰 상세 보기
              </Link>
            )}
            <Link
              href="/experts"
              className="inline-flex items-center justify-center rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-900 hover:border-navy-400"
            >
              전문가 디렉토리
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">
      <SectionTitle
        eyebrow="의뢰 등록"
        title="필요한 전문서비스를 등록해주세요"
        description="핵심 정보만 입력하면, 등록된 의뢰 정보가 전문가 풀에 공유되어 관심 있는 전문가가 직접 제안할 수 있습니다. 입력 내용은 의뢰 등록 목적 외에는 사용되지 않습니다."
      />

      {/*
        COMPLIANCE 디스클레이머 — 의뢰자에게 플랫폼의 역할 한계를 명시.
        직역 규제(회계/세무/법률)상 '추천/매칭/중개'로 오해되지 않도록
        반드시 폼 입력 전 단계에서 노출한다.
      */}
      <div className="mt-6 rounded-lg border border-navy-100 bg-[#f7f9fc] p-4 text-xs leading-relaxed text-navy-600">
        <p>
          <strong className="font-semibold text-navy-900">
            Assign은 특정 전문가를 추천하거나 계약을 중개하지 않습니다.
          </strong>{" "}
          등록된 의뢰 정보는 전문가 풀에 공유되며, 관심 있는 전문가가 직접 제안할
          수 있습니다. 제안 검토와 계약 여부, 조건은 모두 당사자 간 자율적으로
          결정됩니다.
        </p>
      </div>

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
              — 회사명, 담당자명, 회사 이메일 도메인을 가린 익명 요약본 형태로만
              전문가에게 공유됩니다.
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
