"use client";

import { useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { SERVICE_CATEGORIES } from "@/lib/mockData";
import type { ServiceCategory } from "@/lib/types";

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
  intro: "",
};

export default function ExpertRegisterPage() {
  const [form, setForm] = useState<ExpertFormState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<ExpertFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // NOTE: Backend integration point.
    // Send `form` to the API (e.g. POST /api/experts, Supabase insert, etc.).
    console.log("[MVP mock] expert registration submitted:", form);
    await new Promise((resolve) => setTimeout(resolve, 500));
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
          <p className="mt-4 text-sm leading-relaxed text-navy-600">
            Assign 검증팀이 자격과 경력을 확인한 뒤,
            <br />
            영업일 기준 2~3일 내에 등록 결과를 안내드리겠습니다.
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
        title="Assign 전문가 풀에 합류하세요"
        description="프로필과 수행 경험을 등록하면 검증 후 활동이 시작됩니다. 전문분야에 맞는 기업 의뢰를 우선적으로 받아 제안 기회를 확보하세요."
      />

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
