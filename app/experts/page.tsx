"use client";

import { useMemo, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import ExpertCard from "@/components/ExpertCard";
import { MOCK_EXPERTS, SERVICE_CATEGORIES } from "@/lib/mockData";
import type { ServiceCategory } from "@/lib/types";

export default function ExpertsPage() {
  const [filter, setFilter] = useState<ServiceCategory | "전체">("전체");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"이름순" | "경력우선">("이름순");

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
        eyebrow="전문가 풀"
        title="검증된 전문가를 직접 만나보세요"
        description="자격, 경력, 거래 이력을 사전 검증한 전문가들로 구성되어 있습니다. 본 페이지의 정보는 MVP 단계의 예시 데이터입니다."
      />

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
            onChange={(e) => setSort(e.target.value as "이름순" | "경력우선")}
            className="input-base w-32 shrink-0 px-3"
            aria-label="정렬 기준"
          >
            <option value="이름순">이름순</option>
            <option value="경력우선">경력우선</option>
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
          <p className="text-sm text-navy-500">
            조건에 맞는 전문가가 없습니다. 필터를 변경해보세요.
          </p>
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
