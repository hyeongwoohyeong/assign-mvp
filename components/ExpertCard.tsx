import type { Expert } from "@/lib/types";

interface ExpertCardProps {
  expert: Expert;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-navy-100 bg-white p-6 shadow-soft transition hover:border-navy-300 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-navy-900">{expert.name}</h3>
            {expert.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-navy-900/5 px-2 py-0.5 text-xs font-medium text-navy-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3 w-3 text-navy-700"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25l2.6 2.115 3.342-.31.83 3.255 2.748 1.94-1.354 3.075 1.354 3.075-2.748 1.94-.83 3.255-3.342-.31L12 21.75l-2.6-2.115-3.342.31-.83-3.255-2.748-1.94 1.354-3.075-1.354-3.075 2.748-1.94.83-3.255 3.342.31L12 2.25zm-1.06 13.06l5.25-5.25-1.06-1.06-4.19 4.19-1.94-1.94-1.06 1.06 3 3z"
                    clipRule="evenodd"
                  />
                </svg>
                인증 전문가
              </span>
            )}
          </div>
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
