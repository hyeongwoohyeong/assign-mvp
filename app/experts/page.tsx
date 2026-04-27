"use client";

import { useMemo, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import ExpertCard from "@/components/ExpertCard";
import { MOCK_EXPERTS, SERVICE_CATEGORIES } from "@/lib/mockData";
import type { ServiceCategory } from "@/lib/types";

export default function ExpertsPage() {
  const [filter, setFilter] = useState<ServiceCategory | "전체">("전체");
  const [query, setQuery] = useState("");
  // COMPLIANCE: 정렬은 "추천"이 아닌 단순 기준만 노출.
  // "경력우선" 같은 표현은 추천/순위로 오해될 수 있어 사용하지 않는다.
  const [sort, setSort] = useState<"이름순" | "전문분야 다수순">("이름순");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matched = MOCK_EXPERTS.filter((e) => {
      const matchCategory =
        filter === "전체" ? true : e.specialties.includes(filter);
      const matchQuery =
        q === ""
          ? true
          : e.name.toLowerCase().includes(q) ||
            e.firm.toLowerCase().includes(q) ||
            e.experienceSummary.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });

    const sorted = [...matched].sort((a, b) => {
      if (sort === "이름순") {
        return a.name.localeCompare(b.name, "ko");
      }
      return b.specialties.length - a.specialties.length;
    });

    return sorted;
  }, [filter, query, sort]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
      <SectionTitle
        eyebrow="전문가 디렉토리"
        title="등록된 전문가를 직접 확인하세요"
        description="전문가 본인이 등록한 자격·경력·전문분야 정보를 기반으로 게시되는 디렉토리입니다. Assign은 특정 전문가를 추천하지 않으며, 노출 순서는 추천을 의미하지 않습니다."
      />

      {/*
        COMPLIANCE 디스클레이머 — 디렉토리는 정보 게시이며, 추천이 아님을 명시.
        직역 규제(회계/세무/법률)상 '특정 전문가 추천/우선 노출'로 해석되지 않도록
        반드시 목록 상단에 노출한다.
      */}
      <div className="mt-6 rounded-lg border border-navy-100 bg-[#f7f9fc] p-4 text-xs leading-relaxed text-navy-600">
        <p>
          <strong className="font-semibold text-navy-900">
            본 디렉토리는 전문가가 직접 등록한 정보 기반으로 구성됩니다.
          </strong>{" "}
          Assign은 특정 전문가를 추천하지 않으며, 정렬·노출 순서는 추천을 의미하지
          않습니다. 이용자는 각 전문가의 정보를 확인하신 후 직접 판단하시기
          바랍니다.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "전체"}
            onClick={() => setFilter("전체")}
            label="전체"
          />
          {SERVICE_CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              active={filter === c}
              onClick={() => setFilter(c)}
              label={c}
            />
          ))}
        </div>

        <div className="flex w-full gap-2 lg:w-auto">
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              placeholder="이름, 소속, 경험, 지역 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-base pl-9"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "이름순" | "전문분야 다수순")
            }
            className="input-base w-40 shrink-0 px-3"
            aria-label="정렬 기준"
          >
            <option value="이름순">이름순</option>
            <option value="전문분야 다수순">전문분야 다수순</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setFilter("전체");
              setQuery("");
              setSort("이름순");
            }}
            className="shrink-0 rounded-lg border border-navy-200 px-3 text-sm font-medium text-navy-700 hover:border-navy-400"
          >
            초기화
          </button>
        </div>
      </div>

      <div className="mt-3 text-sm text-navy-500">
        총 {filtered.length}명의 전문가
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((expert) => (
          <ExpertCard key={expert.id} expert={expert} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 rounded-xl border border-dashed border-navy-200 bg-white p-12 text-center">
          <p className="text-base font-semibold text-navy-900">
            조건에 맞는 전문가가 없습니다
          </p>
          <p className="mt-2 text-sm text-navy-500">
            필터를 변경하거나, 디렉토리에 등록을 신청해 새로운 전문가가 합류하도록 도와주세요.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setFilter("전체");
                setQuery("");
                setSort("이름순");
              }}
              className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-800 hover:border-navy-400"
            >
              필터 초기화
            </button>
            <a
              href="/expert-register"
              className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
            >
              전문가 등록 신청 →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-navy-900 text-white"
          : "border border-navy-200 bg-white text-navy-700 hover:border-navy-400"
      }`}
    >
      {label}
    </button>
  );
}
