import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";

// NOTE:
// 이 페이지는 Assign의 포지셔닝을 알리는 신뢰 페이지입니다.
// 운영자(형우)가 채울 부분에는 [편집] 표시를 남겨두었으니, 본인 정보로 채워주세요.
//
// COMPLIANCE NOTE:
// Assign은 한국의 회계/세무/법률 직역 규제 준수를 위해
// "정보 게시 + 자율 제안" 모델로 운영됩니다.
// 본 페이지는 다음을 명확히 해야 합니다.
//   1) 특정 전문가를 추천하지 않는다.
//   2) 계약을 중개하지 않는다.
//   3) 운영자는 정보 게시·UI 제공 역할만 수행한다.

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">
      <SectionTitle
        eyebrow="About Assign"
        title="Assign은 어떤 플랫폼인가요"
        description="회계, 세무, 재무자문, 컨설팅 영역의 전문서비스 소싱을 더 투명하고 비교 가능한 형태로 바꾸기 위한 의뢰·디렉토리 플랫폼입니다."
      />

      <div className="mt-12 space-y-8">
        <section className="rounded-2xl border border-navy-100 bg-white p-8 shadow-soft">
          <h2 className="text-lg font-bold text-navy-900">왜 시작했나요</h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-700">
            전문서비스 시장은 여전히 지인 소개 중심으로 거래가 이뤄집니다. 한두
            명의 의견에 의존하다 보니 비교가 어렵고, 적정 비용을 가늠하기도 쉽지
            않으며, 거래 후 평판 정보도 폐쇄적입니다. Assign은 의뢰 내용을
            표준화해 등록할 수 있게 하고, 전문가들이 디렉토리에서 직접 확인하고
            자율적으로 제안하도록 만들어, 기업이 더 빠르고 합리적으로
            의사결정할 수 있도록 돕습니다.
          </p>
        </section>

        <section className="rounded-2xl border border-navy-100 bg-white p-8 shadow-soft">
          <h2 className="text-lg font-bold text-navy-900">어떻게 진행되나요</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-navy-700">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                1
              </span>
              <span>
                기업이 의뢰를 등록하면, 등록된 의뢰 정보가 전문가 풀에 공유됩니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                2
              </span>
              <span>
                관심 있는 전문가가 의뢰 내용을 확인하고, 본인의 판단에 따라
                직접 제안합니다. Assign은 특정 전문가를 추천하거나 선별하지
                않습니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                3
              </span>
              <span>
                기업은 도착한 제안과 보수 조건을 직접 비교하고, 적합하다고
                판단되는 전문가와 직접 계약합니다. Assign은 정보 게시 단계까지만
                관여하며, 계약 자체는 양 당사자 간 자율적으로 이뤄집니다.
              </span>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-navy-100 bg-white p-8 shadow-soft">
          <h2 className="text-lg font-bold text-navy-900">플랫폼의 역할 한계</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-navy-700">
            <li>· Assign은 특정 전문가를 추천하거나 우선 노출하지 않습니다.</li>
            <li>
              · Assign은 의뢰자와 전문가 사이의 계약을 중개하지 않으며, 계약
              여부와 조건은 당사자가 직접 결정합니다.
            </li>
            <li>
              · Assign은 정보 게시·확인·UI 제공 기능만을 제공하며, 계약 성사에
              따른 별도의 중개·성공 수수료를 받지 않습니다.
            </li>
            <li>
              · 디렉토리에 게시된 정보는 전문가가 직접 입력한 내용을 기반으로
              하므로, 이용자는 각 전문가의 정보를 직접 확인하고 판단하셔야
              합니다.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-navy-100 bg-white p-8 shadow-soft">
          <h2 className="text-lg font-bold text-navy-900">정보 보호</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-navy-700">
            <li>· 의뢰 정보는 등록 목적 외에 사용되지 않습니다.</li>
            <li>
              · "보안이 필요합니다"를 선택한 의뢰는 회사명, 담당자명, 회사 이메일
              도메인을 가린 익명 요약본 형태로만 전문가에게 공유됩니다.
            </li>
            <li>
              · 의뢰자가 직접 응답하기 전까지, 기업의 직접 연락처는 전문가에게
              공개되지 않습니다.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-navy-100 bg-[#f7f9fc] p-8">
          <h2 className="text-lg font-bold text-navy-900">운영 정보</h2>
          <dl className="mt-4 grid gap-3 text-sm text-navy-700 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                서비스 운영
              </dt>
              {/* [편집] 형우님 본인/팀 이름과 한 줄 배경을 채워주세요. */}
              <dd className="mt-1">Assign 플랫폼 운영자</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                문의
              </dt>
              <dd className="mt-1">
                <a
                  href="mailto:contact@getassign.kr"
                  className="text-navy-900 underline-offset-4 hover:underline"
                >
                  contact@getassign.kr
                </a>
              </dd>
            </div>
            {/* [편집] 사업자번호가 있으시면 아래 블록의 주석을 해제하고 값을 채워주세요. */}
            {/* <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                사업자번호
              </dt>
              <dd className="mt-1">000-00-00000</dd>
            </div> */}
          </dl>
          <p className="mt-6 text-xs text-navy-500">
            의뢰 또는 전문가 등록과 관련된 문의는 위 이메일로 보내주시면
            영업일 기준 1~2일 내 회신드립니다.
          </p>
        </section>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
          <Link
            href="/request"
            className="inline-flex items-center justify-center rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800"
          >
            의뢰 등록하기
          </Link>
          <Link
            href="/expert-register"
            className="inline-flex items-center justify-center rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-900 hover:border-navy-400"
          >
            전문가 등록하기
          </Link>
        </div>
      </div>
    </div>
  );
}
