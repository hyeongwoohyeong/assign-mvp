import SectionTitle from "@/components/SectionTitle";
import {
  ADMIN_SUMMARY,
  MOCK_RECENT_REQUESTS,
  MOCK_RECENT_EXPERT_REGISTRATIONS,
} from "@/lib/mockData";

export default function AdminPage() {
  // NOTE: This is an admin dashboard mock for the MVP.
  // In production, this page should be guarded by authentication and the
  // data below should come from the database (Supabase / Firestore / API).

  const summaryCards = [
    { label: "신규 의뢰", value: ADMIN_SUMMARY.newRequests, hint: "이번 주" },
    { label: "등록 전문가", value: ADMIN_SUMMARY.registeredExperts, hint: "전체" },
    { label: "매칭 검토중", value: ADMIN_SUMMARY.matchingInReview, hint: "현재" },
    { label: "제안 완료", value: ADMIN_SUMMARY.proposalsSent, hint: "이번 달" },
  ];
  const totalRecentRequests = MOCK_RECENT_REQUESTS.length;
  const completedRequests = MOCK_RECENT_REQUESTS.filter(
    (r) => r.status === "수임완료",
  ).length;
  const progressRate =
    totalRecentRequests === 0
      ? 0
      : Math.round((completedRequests / totalRecentRequests) * 100);
  const reviewingExperts = MOCK_RECENT_EXPERT_REGISTRATIONS.filter(
    (e) => e.status === "검토중",
  ).length;
  const approvedExperts = MOCK_RECENT_EXPERT_REGISTRATIONS.filter(
    (e) => e.status === "승인",
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle
          eyebrow="Admin"
          title="운영 대시보드"
          description="MVP 단계의 운영 현황 모니터링용 화면입니다. 실제 데이터 연동 전 임시 화면입니다."
        />
        <span className="inline-flex w-max items-center gap-2 rounded-full border border-navy-200 bg-white px-3 py-1 text-xs font-medium text-navy-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          MVP Mock Data
        </span>
      </div>

      {/* Summary cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-navy-100 bg-white p-6 shadow-soft"
          >
            <p className="text-sm font-medium text-navy-500">{c.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-bold text-navy-900">{c.value}</span>
              <span className="text-xs text-navy-400">{c.hint}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-soft">
          <p className="text-sm font-medium text-navy-500">최근 의뢰 진행률</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-2xl font-bold text-navy-900">{progressRate}%</p>
            <p className="text-xs text-navy-500">
              수임완료 {completedRequests} / 최근의뢰 {totalRecentRequests}
            </p>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-navy-100">
            <div
              className="h-2 rounded-full bg-navy-900 transition-all"
              style={{ width: `${progressRate}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-soft">
          <p className="text-sm font-medium text-navy-500">전문가 등록 처리 현황</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[#f7f9fc] px-4 py-3">
              <p className="text-xs text-navy-500">검토중</p>
              <p className="mt-1 text-xl font-bold text-amber-600">{reviewingExperts}</p>
            </div>
            <div className="rounded-lg bg-[#f7f9fc] px-4 py-3">
              <p className="text-xs text-navy-500">승인</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">{approvedExperts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent client requests */}
      <div className="mt-12 rounded-xl border border-navy-100 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-navy-900">
              최근 의뢰 내역
            </h3>
            <p className="mt-0.5 text-xs text-navy-500">
              최근 등록된 기업 의뢰 (Mock)
            </p>
          </div>
          <button
            type="button"
            className="cursor-not-allowed text-xs font-medium text-navy-400"
            disabled
          >
            전체 보기 (준비중)
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f9fc] text-left text-xs font-semibold uppercase tracking-wider text-navy-500">
              <tr>
                <th className="px-6 py-3">회사명</th>
                <th className="px-6 py-3">서비스</th>
                <th className="px-6 py-3">예산</th>
                <th className="px-6 py-3">상태</th>
                <th className="px-6 py-3">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {MOCK_RECENT_REQUESTS.map((r) => (
                <tr key={r.id} className="text-navy-800">
                  <td className="whitespace-nowrap px-6 py-4 font-medium">
                    {r.company}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-navy-600">
                    {r.serviceType}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-navy-600">
                    {r.budget}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <RequestStatus status={r.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-navy-500">
                    {r.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent expert registrations */}
      <div className="mt-8 rounded-xl border border-navy-100 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-navy-900">
              최근 전문가 등록
            </h3>
            <p className="mt-0.5 text-xs text-navy-500">
              최근 신청한 전문가 (Mock)
            </p>
          </div>
          <button
            type="button"
            className="cursor-not-allowed text-xs font-medium text-navy-400"
            disabled
          >
            전체 보기 (준비중)
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f9fc] text-left text-xs font-semibold uppercase tracking-wider text-navy-500">
              <tr>
                <th className="px-6 py-3">이름</th>
                <th className="px-6 py-3">소속</th>
                <th className="px-6 py-3">전문분야</th>
                <th className="px-6 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {MOCK_RECENT_EXPERT_REGISTRATIONS.map((e) => (
                <tr key={e.id} className="text-navy-800">
                  <td className="whitespace-nowrap px-6 py-4 font-medium">
                    {e.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-navy-600">
                    {e.firm}
                  </td>
                  <td className="px-6 py-4 text-navy-600">
                    <div className="flex flex-wrap gap-1">
                      {e.specialties.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-navy-50 px-2 py-0.5 text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <ExpertStatus status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RequestStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    검토중: "bg-amber-50 text-amber-700 ring-amber-200",
    매칭중: "bg-blue-50 text-blue-700 ring-blue-200",
    제안완료: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    수임완료: "bg-emerald-50 text-emerald-700 ring-emerald-200",
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

function ExpertStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    승인: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    검토중: "bg-amber-50 text-amber-700 ring-amber-200",
    보류: "bg-rose-50 text-rose-700 ring-rose-200",
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
