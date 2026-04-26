"use client";

import { useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { SERVICE_CATEGORIES } from "@/lib/mockData";
import type { ServiceCategory } from "@/lib/types";

// 전문가 본인이 부르는 보수 범위. 의뢰의 예산 범위(BUDGET_RANGES)와 같은 단위로 둬서
// 의뢰자가 가격대를 한눈에 비교하고 직접 판단할 수 있게 한다.
const FEE_RANGES = [
  "300만원 이하",
  "300만원~1,000만원",
  "1,000만원~3,000만원",
  "3,000만원 이상",
  "협의",
] as const;
type FeeRange = (typeof FEE_RANGES)[number] | "";

// 전문가 등록 번호 — 클라이언트 측 발급. 사용자/운영자 모두 동일 등록 건을 참조 가능.
function generateExpertId() {
  return `EXP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

interface ExpertFormState {
  name: string;
  firm: string;
  email: string;
  phone: string;
  specialties: ServiceCategory[];
  qualifications: string;
  experience: string;
  preferredServices: string;
  serviceArea: string;
  feeRange: FeeRange;
  intro: string;
}

type ExpertField =
  | "name"
  | "firm"
  | "email"
  | "phone"
  | "specialties"
  | "qualifications"
  | "experience"
  | "preferredServices"
  | "serviceArea"
  | "feeRange"
  | "intro";

type ExpertFormErrors = Partial<Record<ExpertField, string>>;

const INITIAL_STATE: ExpertFormState = {
  name: "",
  firm: "",
  email: "",
  phone: "",
  specialties: [],
  qualifications: "",
  experience: "",
  preferredServices: "",
  serviceArea: "",
  feeRange: "",
  intro: "",
};

export default function ExpertRegisterPage() {
  const [form, setForm] = useState<ExpertFormState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ExpertFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // honeypot — 사람 눈에는 안 보이는 필드. 봇이 채우면 서버에서 무시 처리.
  const [hp, setHp] = useState("");

  function update<K extends keyof ExpertFormState>(
    key: K,
    value: ExpertFormState[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function toggleSpecialty(cat: ServiceCategory) {
    setForm((f) => {
      const exists = f.specialties.includes(cat);
      const next = exists
        ? f.specialties.filter((c) => c !== cat)
        : [...f.specialties, cat];
      return { ...f, specialties: next };
    });
    if (errors.specialties) {
      setErrors((prev) => ({ ...prev, specialties: undefined }));
    }
  }

  function validate(next: ExpertFormState): ExpertFormErrors {
    const phonePattern = /^(01[0-9]-?\d{3,4}-?\d{4}|0\d{1,2}-?\d{3,4}-?\d{4})$/;
    const nextErrors: ExpertFormErrors = {};

    if (!next.name.trim()) nextErrors.name = "이름을 입력해주세요.";
    if (!next.firm.trim()) nextErrors.firm = "소속을 입력해주세요.";
    if (!next.email.trim()) nextErrors.email = "이메일을 입력해주세요.";
    if (!next.phone.trim()) nextErrors.phone = "연락처를 입력해주세요.";
    if (next.phone.trim() && !phonePattern.test(next.phone.trim())) {
      nextErrors.phone = "연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)";
    }
    if (next.specialties.length === 0) {
      nextErrors.specialties = "전문분야를 한 개 이상 선택해주세요.";
    }
    if (!next.qualifications.trim()) {
      nextErrors.qualifications = "보유 자격을 입력해주세요.";
    }
    if (!next.preferredServices.trim()) {
      nextErrors.preferredServices = "선호 용역 유형을 입력해주세요.";
    }
    if (!next.serviceArea.trim()) {
      nextErrors.serviceArea = "담당 가능 지역을 입력해주세요.";
    }
    if (!next.feeRange) {
      nextErrors.feeRange = "평균 보수 범위를 선택해주세요.";
    }
    if (!next.experience.trim()) {
      nextErrors.experience = "주요 수행 경험을 입력해주세요.";
    } else if (next.experience.trim().length < 20) {
      nextErrors.experience = "주요 수행 경험은 20자 이상 입력해주세요.";
    }
    if (!next.intro.trim()) {
      nextErrors.intro = "프로필 소개를 입력해주세요.";
    } else if (next.intro.trim().length < 20) {
      nextErrors.intro = "프로필 소개는 20자 이상 입력해주세요.";
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
    const expertId = generateExpertId();
    setSubmittedId(expertId);

    // 운영자 알림 메일 발송 — /api/notify 로 전문가 등록 데이터 전송.
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "expert",
          data: { ...form, expertId, _hp: hp },
        }),
      });
      if (!res.ok) {
        console.error("[expert] notify failed:", await res.text());
      }
    } catch (err) {
      console.error("[expert] notify error:", err);
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
            전문가 등록 신청이 접수되었습니다
          </h1>
          {submittedId && (
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-[#f7f9fc] px-4 py-1.5">
              <span className="text-xs font-medium text-navy-500">등록번호</span>
              <span className="text-sm font-bold tracking-wider text-navy-900">
                {submittedId}
              </span>
            </div>
          )}
          <p className="mt-5 text-sm leading-relaxed text-navy-600">
            등록하신 정보가 디렉토리 게시 기준에 부합하는지 확인 후,
            <br />
            영업일 기준 2~3일 내에 등록 결과를 안내드리겠습니다.
          </p>
          <p className="mt-3 text-xs text-navy-500">
            게시 완료 시 등록 메일로 안내드리며, 등록된 의뢰 중 전문분야에
            부합하는 건이 있을 때 같은 메일로 안내됩니다. 의뢰 검토와 제안 여부는
            전문가께서 직접 결정하시면 됩니다.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">
      <SectionTitle
        eyebrow="전문가 등록"
        title="Assign 디렉토리에 등록해보세요"
        description="프로필과 수행 경험을 등록하시면 디렉토리에 게시됩니다. 전문분야에 부합하는 의뢰가 등록될 때 안내를 받고, 본인이 제안 여부를 직접 판단할 수 있습니다."
      />

      {/*
        COMPLIANCE 디스클레이머 — 전문가에게 플랫폼의 역할 한계를 명시.
        직역 규제(회계/세무/법률)상 '특정 전문가 추천/계약 중개'로 오해되지 않도록
        반드시 폼 입력 전 단계에서 노출한다.
      */}
      <div className="mt-6 rounded-lg border border-navy-100 bg-[#f7f9fc] p-4 text-xs leading-relaxed text-navy-600">
        <p>
          <strong className="font-semibold text-navy-900">
            Assign은 정보 게시 및 확인 기능만 제공합니다.
          </strong>{" "}
          제안 여부와 보수 조건은 전문가께서 직접 결정하시며, 플랫폼은
          계약 당사자가 아닙니다. 등록된 정보는 디렉토리에 게시되어 의뢰자가 직접
          확인할 수 있습니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-6 rounded-2xl border border-navy-100 bg-white p-8 shadow-soft"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-base" htmlFor="name">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              required
              className="input-base"
              placeholder="예) 김민준"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label-base" htmlFor="firm">
              소속 법인/회사 <span className="text-red-500">*</span>
            </label>
            <input
              id="firm"
              required
              className="input-base"
              placeholder="예) 로컬회계법인"
              value={form.firm}
              onChange={(e) => update("firm", e.target.value)}
            />
            {errors.firm && <p className="mt-1 text-xs text-red-600">{errors.firm}</p>}
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
              placeholder="expert@example.com"
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
        </div>

        <div>
          <label className="label-base">
            전문분야 <span className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-navy-500">
              (복수 선택 가능)
            </span>
          </label>
          <p className="mb-2 text-xs text-navy-500">
            실제 수임 가능한 분야만 선택해주세요. 디렉토리 검색·필터에서 본인이
            정확히 노출되도록 하기 위함입니다.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_CATEGORIES.map((cat) => {
              const checked = form.specialties.includes(cat);
              return (
                <label
                  key={cat}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                    checked
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-navy-200 bg-white text-navy-800 hover:border-navy-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleSpecialty(cat)}
                  />
                  <span className="font-medium">{cat}</span>
                </label>
              );
            })}
          </div>
          {errors.specialties && (
            <p className="mt-1 text-xs text-red-600">{errors.specialties}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-base" htmlFor="qualifications">
              보유 자격 <span className="text-red-500">*</span>
            </label>
            <input
              id="qualifications"
              required
              className="input-base"
              placeholder="예) KICPA, CTA, 변호사"
              value={form.qualifications}
              onChange={(e) => update("qualifications", e.target.value)}
            />
            {errors.qualifications && (
              <p className="mt-1 text-xs text-red-600">{errors.qualifications}</p>
            )}
          </div>
          <div>
            <label className="label-base" htmlFor="preferredServices">
              선호 용역 유형 <span className="text-red-500">*</span>
            </label>
            <input
              id="preferredServices"
              required
              className="input-base"
              placeholder="예) 중소기업 결산, 가치평가, 재무실사"
              value={form.preferredServices}
              onChange={(e) => update("preferredServices", e.target.value)}
            />
            {errors.preferredServices && (
              <p className="mt-1 text-xs text-red-600">{errors.preferredServices}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="label-base" htmlFor="serviceArea">
              담당 가능 지역 <span className="text-red-500">*</span>
            </label>
            <input
              id="serviceArea"
              required
              className="input-base"
              placeholder="예) 서울, 수도권 / 전국 가능 / 대구·경북"
              value={form.serviceArea}
              onChange={(e) => update("serviceArea", e.target.value)}
            />
            {errors.serviceArea && (
              <p className="mt-1 text-xs text-red-600">{errors.serviceArea}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="label-base">
              평균 보수 범위 <span className="text-red-500">*</span>
            </label>
            <p className="mb-2 text-xs text-navy-500">
              건당 평균 보수입니다. 의뢰자가 예산과 맞춰 직접 비교·확인하기 위한
              정보로, 실제 보수는 건별 협의로 결정됩니다.
            </p>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {FEE_RANGES.map((opt) => {
                const checked = form.feeRange === opt;
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
                      name="feeRange"
                      className="sr-only"
                      checked={checked}
                      onChange={() => update("feeRange", opt)}
                    />
                    <span className="font-medium">{opt}</span>
                  </label>
                );
              })}
            </div>
            {errors.feeRange && (
              <p className="mt-1 text-xs text-red-600">{errors.feeRange}</p>
            )}
          </div>
        </div>

        <div>
          <label className="label-base" htmlFor="experience">
            주요 수행 경험 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="experience"
            required
            rows={5}
            className="input-base resize-y"
            placeholder="대표 프로젝트, 산업 경험, 거래 규모 등을 작성해주세요."
            value={form.experience}
            onChange={(e) => update("experience", e.target.value)}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.experience ? (
              <p className="text-xs text-red-600">{errors.experience}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-navy-400">{form.experience.length}자</p>
          </div>
        </div>

        <div>
          <label className="label-base" htmlFor="intro">
            프로필 소개 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="intro"
            required
            rows={5}
            className="input-base resize-y"
            placeholder="기업 클라이언트가 신뢰할 수 있도록 본인의 전문성과 일하는 방식을 간결하게 소개해주세요."
            value={form.intro}
            onChange={(e) => update("intro", e.target.value)}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.intro ? (
              <p className="text-xs text-red-600">{errors.intro}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-navy-400">{form.intro.length}자</p>
          </div>
        </div>

        {/* honeypot — 사람 눈에는 안 보이는 필드. 봇 자동 채움 방어용. */}
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
            {isSubmitting ? "신청 중..." : "등록 신청하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
