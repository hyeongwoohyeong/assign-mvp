"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import { MOCK_PUBLIC_REQUESTS, SERVICE_CATEGORIES } from "@/lib/mockData";
import type { PublicRequest, ServiceCategory } from "@/lib/types";
import { listMyRequests, subscribe } from "@/lib/storage";

// COMPLIANCE NOTE:
// 공개 의뢰 보드는 "정보 게시" 페이지이다.
// - 운영자가 특정 전문가에게 의뢰를 전달하지 않는다 (자동 매칭/추천 없음).
// - 전문가는 본인 판단에 따라 자율적으로 제안할 수 있다.
// - 의뢰자는 어떤 제안에 대해 연락 허용 여부를 직접 결정한다.
// 따라서 본 페이지에서는 "추천", "매칭", "연결" 같은 표현을 사용하지 않는다.

export default function BoardPage() {
  const [filter, setFilter] = useState<ServiceCategory | "전체">("전체");
  const [statusFilter, setStatusFilter] = useState<"전체" | "게시됨" | "제안받는중" | "마감">(
    "전체",
  );
  const [query, setQuery] = useState("");
  // localStorage 의 사용자 본인 의뢰를 board 에 합쳐서 노출한다.
  // SSR 단계에서 hydration mismatch 를 막기 위해 마운트 후에만 채운다.
  const [myRequests, setMyRequests] = useState<PublicRequest[]>([]);

  useEffect(() => {
    const sync = () => setMyRequests(listMyRequests());
    sync();
    return subscribe(sync);
  }, []);

  // 동일 ID 의 의뢰는 사용자 본인 데이터(최신)를 우선한다.
  const allRequests = useMemo<PublicRequest[]>(() => {
    const ids = new Set(myRequests.map((r) => r.id));
    return [...myRequests, ...MOCK_PUBLIC_REQUESTS.filter((r) => !ids.has(r.id))];
  }, [myRequests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRequests.filter((r) => {
      const matchCategory = filter === "전체" ? true : r.serviceType === filter;
      const matchStatus = statusFilter === "전체" ? true : r.status === statusFilter;
      const matchQuery =
        q === ""
          ? true
          : r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.companyDisplay.toLowerCase().includes(q);
      return matchCategory && matchStatus && matchQuery;
    });
  }, [filter, statusFilter, query, allRequests]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
      <SectionTitle
        eyebrow="의뢰 게시판"
        title="공개된 의뢰를 직접 확인하고 자율적으로 제안하세요"
        description="기업이 등록한 의뢰가 그대로 게시됩니다. 관심 있는 의뢰에 본인 판단으로 제안할 수 있습니다."
      />

      {/*
        COMPLIANCE 디스클레이머 — 본 보드는 정보 게시이며 매칭/추천이 아님을 명시.
      */}
      <div className="mt-6 rounded-lg border border-navy-100 bg-[#f7f9fc] p-4 text-xs leading-relaxed text-navy-600">
        <p>
          <strong className="font-semibold text-navy-900">
            본 게시판은 의뢰자가 등록한 정보를 그대로 공개하는 게시 공간입니다.
          </strong>{" "}
          Assign은 특정 전문가에게 의뢰를 전달하거나 계약을 중개하지 않으며,
          전문가는 자율적으로 제안 여부를 판단합니다. 의뢰자의 회사명·담당자·연락처
          등 비공개 정보는 노출되지 않습니다.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "전체"}
            onClick={() => setFilter("전체")}
            label="전체 분야"
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
              placeholder="제목, 회사, 설명 검색"
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
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "전체" | "게시됨" | "제안받는중" | "마감",
              )
            }
            className="input-base w-36 shrink-0 px-3"
            aria-label="상태 필터"
          >
            <option value="전체">전체 상태</option>
            <option value="게시됨">게시됨</option>
            <option value="제안받는중">제안받는중</option>
            <option value="마감">마감</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setFilter("전체");
              setStatusFilter("전체");
              setQuery("");
            }}
            className="shrink-0 rounded-lg border border-navy-200 px-3 text-sm font-medium text-navy-700 hover:border-navy-400"
          >
            초기화
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-navy-500">
        <span>총 {filtered.length}건의 의뢰</span>
        <Link
          href="/request"
          className="text-sm font-semibold text-navy-900 underline-offset-4 hover:underline"
        >
          새 의뢰 등록하기 →
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.map((r) => (
          <article
            key={r.id}
            className="group rounded-xl border border-navy-100 bg-white p-6 shadow-soft transition hover:border-navy-300 hover:shadow-card"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <RequestStatusBadge status={r.status} />
                  <span className="rounded bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-700">
                    {r.serviceType}
                  </span>
                  <span className="text-xs text-navy-500">{r.id}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-navy-900">
                  <Link
                    href={`/board/${r.id}`}
                    className="hover:text-navy-700 hover:underline underline-offset-4"
                  >
                    {r.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy-600">
                  {r.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
                  <span>의뢰자: {r.companyDisplay}</span>
                  <span>예산: {r.budget}</span>
                  <span>일정: {r.timeline}</span>
                  <span>등록: {r.postedAt}</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1 sm:items-end">
                <p className="text-2xl font-bold text-navy-900">
                  {r.proposalCount}
                </p>
                <p className="text-xs text-navy-500">제안 도착</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-navy-100 pt-4">
              <Link
                href={`/board/${r.id}`}
                className="inline-flex items-center justify-center rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-800 transition hover:border-navy-400"
              >
                상세 보기
              </Link>
              <Link
                href={`/board/${r.id}?action=propose`}
                className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  r.status === "마감"
                    ? "cursor-not-allowed bg-navy-200 text-white pointer-events-none"
                    : "bg-navy-900 text-white hover:bg-navy-800"
                }`}
                aria-disabled={r.status === "마감"}
              >
                {r.status === "마감" ? "마감된 의뢰" : "제안하기 →"}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 rounded-xl border border-dashed border-navy-200 bg-white p-12 text-center">
          {allRequests.length === 0 ? (
            <>
              <p className="text-base font-semibold text-navy-900">
                업데이트 예정
              </p>
              <p className="mt-2 text-sm text-navy-500">
                현재 게시판에 공개된 의뢰가 없습니다. 의뢰를 직접 등록하시면 본
                페이지에 즉시 노출되며, 도착하는 제안도 같이 추적할 수 있습니다.
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <Link
                  href="/request"
                  className="inline-flex items-center gap-1 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
                >
                  의뢰 등록하기 →
                </Link>
                <Link
                  href="/experts"
                  className="inline-flex items-center gap-1 rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-800 hover:border-navy-400"
                >
                  전문가 디렉토리 보기
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-navy-500">
              조건에 맞는 의뢰가 없습니다. 필터를 변경해보세요.
            </p>
          )}
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
