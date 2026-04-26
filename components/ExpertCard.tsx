import type { Expert } from "@/lib/types";

interface ExpertCardProps {
  expert: Expert;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-navy-100 bg-white p-6 shadow-soft transition hover:border-navy-300 hover:shadow-card">
      {/*
        COMPLIANCE NOTE:
        '인증 전문가' 배지는 Assign이 특정 전문가를 보증·추천하는 인상을 줄 수 있어 제거.
        자격 정보는 카드 하단의 '자격' 필드로만 노출하고, 이용자가 직접 판단하도록 한다.
      */}
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

      <button
        type="button"
        className="mt-4 w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white"
      >
        프로필 보기
      </button>
    </div>
  );
}
