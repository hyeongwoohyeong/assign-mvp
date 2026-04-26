"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import {
  ADMIN_SUMMARY,
  MOCK_EXPERTS,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_DESCRIPTIONS,
} from "@/lib/mockData";

// COMPLIANCE NOTE:
// 한국 회계/세무/법률 직역 규제상, 플랫폼이 특정 전문가를 추천하거나
// 계약을 중개한다는 인상을 주면 안 됩니다. 본 사이트는 "정보 게시 + 자율 제안"
// 구조이며, 모든 카피는 다음 원칙을 따릅니다.
//   - 사용 표현: 등록 / 제안 / 선택 / 확인 / 게시
//   - 회피 표현: 매칭 / 추천 / 연결해드립니다 / 찾아드립니다 / 중개
const COMPANY_STEPS = [
  {
    step: "01",
    title: "의뢰 등록",
    description:
      "회사 상황과 필요한 서비스, 예산, 일정을 입력해 의뢰를 등록합니다.",
  },
  {
    step: "02",
    title: "전문가의 제안 수신",
    description:
      "등록된 의뢰는 전문가 풀에 공유되며, 관심 있는 전문가가 직접 제안할 수 있습니다.",
  },
  {
    step: "03",
    title: "직접 비교 후 선택",
    description:
      "도착한 제안 내용과 보수 조건을 비교하고, 적합하다고 판단되는 전문가와 직접 계약을 진행합니다.",
  },
];

const EXPERT_STEPS = [
  {
    step: "01",
    title: "프로필 등록",
    description:
      "전문분야, 자격, 수행 경험을 등록하시면 디렉토리에 게시됩니다.",
  },
  {
    step: "02",
    title: "등록 의뢰 확인",
    description:
      "전문분야에 부합하는 의뢰가 등록되면 안내를 받고, 본인이 제안 여부를 직접 판단합니다.",
  },
  {
    step: "03",
    title: "자율 제안 및 수임",
    description:
      "관심 있는 의뢰에 직접 제안하고, 기업과 직접 협의해 계약을 체결합니다.",
  },
];

const QUICK_START = [
  {
    title: "기업으로 시작하기",
    description:
      "의뢰 내용, 예산, 일정을 등록하면 전문가들이 직접 제안할 수 있습니다.",
    href: "/request",
    cta: "의뢰 등록하기",
  },
  {
    title: "전문가로 참여하기",
    description:
      "프로필과 수행 경험을 등록해 디렉토리에 노출하고, 관심 있는 의뢰에 직접 제안하세요.",
    href: "/expert-register",
    cta: "등록 신청하기",
  },
  {
    title: "전문가 디렉토리 둘러보기",
    description:
      "어떤 분야의 전문가들이 등록되어 있는지 직접 확인하고 비교해보세요.",
    href: "/experts",
    cta: "디렉토리 보기",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "기존에는 소개받은 한 곳에 바로 맡겼는데, Assign에 의뢰를 등록한 뒤 받은 3개 제안을 비교해 예산을 20% 절감했습니다.",
    author: "재무팀장 · SaaS 스타트업",
  },
  {
    quote:
      "재무실사가 급했는데, 의뢰 등록 후 전문가들의 제안을 빠르게 받아 투자 일정에 맞출 수 있었습니다.",
    author: "대표 · 커머스 기업",
  },
  {
    quote:
      "디렉토리에 등록해 두니, 전문분야에 맞는 의뢰를 직접 확인하고 제안할 수 있어 영업 부담이 줄었습니다.",
    author: "회계사 · 독립 전문가",
  },
];

const FAQ_ITEMS = [
  {
    q: "의뢰 등록과 제안 수신에 비용이 드나요?",
    a: "의뢰 등록과 전문가의 제안 수신은 모두 무료입니다. Assign은 정보 게시·확인 기능만 제공하며, 계약 성사에 따른 별도의 중개·성공 수수료를 받지 않습니다.",
  },
  {
    q: "민감한 정보도 등록 가능한가요?",
    a: "비공개 옵션을 선택하시면 회사명·담당자명·회사 이메일 도메인을 가린 익명 요약본 형태로만 의뢰가 게시됩니다.",
  },
  {
    q: "전문가 등록 정보는 어떻게 게시되나요?",
    a: "전문가가 직접 입력한 자격·경력 정보를 기준으로 디렉토리에 게시됩니다. Assign은 특정 전문가를 추천하지 않으며, 이용자가 직접 확인하고 판단하셔야 합니다.",
  },
  {
    q: "Assign이 계약을 중개하나요?",
    a: "Assign은 의뢰 등록·전문가 디렉토리·제안 수신 등 정보 게시 기능만 제공합니다. 계약 여부와 조건은 의뢰자와 전문가가 직접 결정하시며, 플랫폼은 계약 당사자가 아닙니다.",
  },
];

export default function HomePage() {
  const [openModal, setOpenModal] = useState<"request" | "expert" | null>(null);
  const [toast, setToast] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-100 bg-gradient-to-b from-white to-[#f7f9fc]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-navy-200 bg-white px-3 py-1 text-xs font-medium text-navy-700">
              회계 · 세무 · 재무자문 · 컨설팅
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
              기업이 필요한 전문서비스를 등록하고,
              <br />
              전문가의 제안을 받아보세요.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-600">
              Assign은 회계, 세무, 재무, 컨설팅 등 전문서비스를 필요로 하는 기업과
              전문가가 직접 만나는 의뢰·디렉토리 플랫폼입니다. Assign은 특정
              전문가를 추천하거나 계약을 중개하지 않으며, 정보 게시 및 확인 기능만
              제공합니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/request" size="lg">
                3분 만에 의뢰 등록
              </Button>
              <Button href="/expert-register" variant="secondary" size="lg">
                전문가로 참여하기
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setOpenModal("request")}
              >
                홈에서 바로 의뢰 작성
              </Button>
            </div>
            <p className="mt-5 max-w-2xl text-xs leading-relaxed text-navy-500">
              ※ Assign은 전문가를 추천하거나 계약을 중개하지 않습니다. 등록된
              의뢰 정보는 전문가 풀에 공유되며, 관심 있는 전문가가 직접
              제안할 수 있습니다. 계약 여부와 조건은 당사자 간 자율적으로
              결정됩니다.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-6 border-t border-navy-100 pt-8 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-bold text-navy-900">8개+</p>
                <p className="mt-1 text-sm text-navy-500">핵심 전문서비스 영역</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">자율</p>
                <p className="mt-1 text-sm text-navy-500">전문가의 자율 제안</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">비공개</p>
                <p className="mt-1 text-sm text-navy-500">기업명 비공개 옵션 지원</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section id="quick-start" className="border-b border-navy-100 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionTitle
            eyebrow="Quick Start"
            title="홈에서 바로 시작할 수 있습니다"
            description="목적에 맞는 경로를 선택하면 바로 다음 단계로 이동합니다."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {QUICK_START.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-navy-100 bg-[#f7f9fc] p-6"
              >
                <h3 className="text-lg font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {item.description}
                </p>
                <div className="mt-5">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-navy-900 underline-offset-4 hover:underline"
                  >
                    {item.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpenModal("request")}
              className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
            >
              기업 빠른 의뢰 열기
            </button>
            <button
              type="button"
              onClick={() => setOpenModal("expert")}
              className="rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 hover:border-navy-400"
            >
              전문가 빠른 등록 열기
            </button>
          </div>
        </div>
      </section>

      {/* Scroll nav */}
      <section className="border-b border-navy-100 bg-[#f7f9fc] py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 lg:px-8">
          <AnchorChip href="#why" label="문제 인식" />
          <AnchorChip href="#service" label="이용 방법" />
          <AnchorChip href="#snapshot" label="운영 스냅샷" />
          <AnchorChip href="#social-proof" label="고객 후기" />
          <AnchorChip href="#faq" label="자주 묻는 질문" />
          <AnchorChip href="#vision" label="비전" />
        </div>
      </section>

      {/* Why this exists */}
      <section id="why" className="border-b border-navy-100 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionTitle
            eyebrow="Why Assign"
            title="전문서비스 시장은 여전히 인맥 기반입니다"
            description="실력 있는 회계사, 세무사, 컨설턴트를 만나기 위해 여전히 지인 추천에 의존하고 있습니다. 비교가 어렵고, 제안 방식도 표준화되어 있지 않으며, 적절한 비용을 가늠하기도 쉽지 않습니다."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-navy-100 bg-[#f7f9fc] p-8">
              <h3 className="text-lg font-semibold text-navy-900">
                기업이 겪는 비효율
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-navy-700">
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-navy-400" />
                  지인을 통해 소개받는 한 사람의 의견에 의존하게 됩니다.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-navy-400" />
                  복수의 전문가를 비교하기 위한 표준화된 절차가 없습니다.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-navy-400" />
                  적정 비용 수준과 일정에 대한 정보가 비대칭적입니다.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-navy-400" />
                  거래 이력과 평판을 객관적으로 확인하기 어렵습니다.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-navy-900 bg-navy-900 p-8 text-white">
              <h3 className="text-lg font-semibold">Assign의 접근</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-navy-100">
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/60" />
                  의뢰를 등록하면 전문가들이 직접 확인하고 자율적으로 제안합니다.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/60" />
                  자격·경력 정보를 입력한 전문가들이 디렉토리에 게시되어 비교 가능합니다.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/60" />
                  표준화된 제안 양식으로 비교 의사결정이 쉬워집니다.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/60" />
                  비공개 옵션으로 회사명·담당자명을 가린 익명 형태로 의뢰를 등록할 수 있습니다.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works for companies */}
      <section id="service" className="border-b border-navy-100 bg-[#f7f9fc] py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionTitle
            eyebrow="For Companies"
            title="의뢰 등록부터 비교까지, 3단계"
            description="서비스 범위와 일정을 등록하면, 관심 있는 전문가들의 제안을 받아 직접 비교·선택할 수 있습니다."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {COMPANY_STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-navy-100 bg-white p-7 shadow-soft"
              >
                <p className="text-sm font-bold tracking-wider text-navy-500">
                  STEP {s.step}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-navy-900">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button href="/request" size="lg">
              의뢰 등록하기
            </Button>
          </div>
        </div>
      </section>

      {/* How it works for experts */}
      <section className="border-b border-navy-100 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionTitle
            eyebrow="For Experts"
            title="등록된 의뢰를 직접 확인하고 자율 제안"
            description="디렉토리에 프로필을 게시하고, 본인 전문분야에 맞는 의뢰가 등록될 때 제안 여부를 직접 판단할 수 있습니다."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {EXPERT_STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-navy-100 bg-[#f7f9fc] p-7"
              >
                <p className="text-sm font-bold tracking-wider text-navy-500">
                  STEP {s.step}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-navy-900">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button href="/expert-register" variant="secondary" size="lg">
              전문가 등록하기
            </Button>
          </div>
        </div>
      </section>

      {/* Live snapshot */}
      <section id="snapshot" className="border-b border-navy-100 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionTitle
            eyebrow="Marketplace Snapshot"
            title="현재 플랫폼 운영 스냅샷"
            description="MVP 기준 목업 데이터로 운영 흐름을 한눈에 확인할 수 있습니다."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SnapshotCard label="주간 신규 의뢰" value={`${ADMIN_SUMMARY.newRequests}건`} />
            <SnapshotCard
              label="누적 등록 전문가"
              value={`${ADMIN_SUMMARY.registeredExperts}명`}
            />
            <SnapshotCard
              label="제안 진행 중"
              value={`${ADMIN_SUMMARY.matchingInReview}건`}
            />
            <SnapshotCard label="월간 제안 완료" value={`${ADMIN_SUMMARY.proposalsSent}건`} />
          </div>

          <div className="mt-8 rounded-xl border border-navy-100 bg-[#f7f9fc] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-navy-900">
                최근 등록된 전문가 미리보기
              </h3>
              <Link
                href="/experts"
                className="text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
              >
                전체 전문가 보기
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {MOCK_EXPERTS.slice(0, 3).map((expert) => (
                <div key={expert.id} className="rounded-lg border border-navy-100 bg-white p-4">
                  <p className="text-sm font-semibold text-navy-900">
                    {expert.name} · {expert.firm}
                  </p>
                  <p className="mt-1 text-xs text-navy-600">{expert.experienceSummary}</p>
                  <p className="mt-2 text-xs text-navy-500">
                    {expert.specialties.slice(0, 2).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service categories */}
      <section className="border-b border-navy-100 bg-[#f7f9fc] py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionTitle
            eyebrow="Service Categories"
            title="다루는 전문서비스 영역"
            description="정기적인 세무·기장 업무부터 기업가치평가, M&A, 컨설팅 등 고난이도 자문까지 폭넓게 다룹니다."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_CATEGORIES.map((cat) => (
              <ServiceCard
                key={cat}
                title={cat}
                description={SERVICE_CATEGORY_DESCRIPTIONS[cat]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section id="social-proof" className="border-b border-navy-100 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionTitle
            eyebrow="Customer Stories"
            title="실제 사용자 관점의 변화"
            description="기업과 전문가 모두에게 의미 있는 성과를 만드는 플랫폼 경험을 목표로 합니다."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <figure
                key={item.quote}
                className="rounded-xl border border-navy-100 bg-[#f7f9fc] p-6"
              >
                <blockquote className="text-sm leading-relaxed text-navy-700">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold text-navy-500">
                  {item.author}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-navy-100 bg-[#f7f9fc] py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionTitle
            eyebrow="FAQ"
            title="자주 묻는 질문"
            description="홈페이지에서 자주 확인하는 질문을 먼저 정리했습니다."
          />
          <div className="mt-10 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-navy-100 bg-white p-5 open:shadow-soft"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-navy-900">
                  <span>{item.q}</span>
                  <span className="text-navy-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Long-term vision */}
      <section id="vision" className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTitle
                eyebrow="Our Vision"
                title="전문서비스 소싱의 인프라가 되겠습니다"
                description="Assign은 회계, 세무, 재무자문 영역에서 출발하지만, 장기적으로 컨설팅과 법률자문까지 포함한 모든 전문서비스를 기업이 표준화된 절차로 조달할 수 있는 민간 조달 플랫폼을 지향합니다."
              />
              <div className="mt-8">
                <Link
                  href="/experts"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-navy-900 underline-offset-4 hover:underline"
                >
                  전문가 디렉토리 살펴보기 →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-[#f7f9fc] p-8">
              <ol className="space-y-5">
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      회계·세무·재무자문 마켓플레이스
                    </p>
                    <p className="mt-1 text-sm text-navy-600">
                      가장 수요가 명확한 영역부터 시작합니다.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      경영·재무 컨설팅 확장
                    </p>
                    <p className="mt-1 text-sm text-navy-600">
                      성장 전략, M&A, PMI 등 고난이도 자문 영역으로 확장합니다.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-500 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      법률자문 등 통합 전문서비스 인프라
                    </p>
                    <p className="mt-1 text-sm text-navy-600">
                      기업이 필요한 모든 전문서비스를 한 곳에서 조달할 수 있도록 합니다.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                의뢰 등록과 전문가 제안, 지금 시작하세요
              </h2>
              <p className="mt-2 text-base text-navy-200">
                기업은 의뢰를 등록하고, 전문가는 프로필을 등록해 자율적으로 제안을 주고받을 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/request"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-navy-900 transition hover:bg-navy-50"
              >
                의뢰 등록하기
              </Link>
              <Link
                href="/expert-register"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
              >
                전문가 참여하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {openModal === "request" && (
        <QuickModal title="기업 빠른 의뢰" onClose={() => setOpenModal(null)}>
          <QuickRequestForm
            onDone={() => {
              setOpenModal(null);
              setToast({
                kind: "success",
                message: "기업 빠른 의뢰가 접수되었습니다.",
              });
            }}
            onInvalid={(message) => setToast({ kind: "error", message })}
          />
        </QuickModal>
      )}
      {openModal === "expert" && (
        <QuickModal title="전문가 빠른 등록" onClose={() => setOpenModal(null)}>
          <QuickExpertForm
            onDone={() => {
              setOpenModal(null);
              setToast({
                kind: "success",
                message: "전문가 빠른 등록 신청이 접수되었습니다.",
              });
            }}
            onInvalid={(message) => setToast({ kind: "error", message })}
          />
        </QuickModal>
      )}
      {toast && (
        <div
          className={`pointer-events-none fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg px-4 py-3 text-center text-sm font-medium text-white shadow-card ${
            toast.kind === "success" ? "bg-navy-900" : "bg-rose-600"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

function AnchorChip({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 hover:border-navy-400"
    >
      {label}
    </a>
  );
}

function SnapshotCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-soft">
      <p className="text-sm font-medium text-navy-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-navy-900">{value}</p>
    </div>
  );
}

function QuickModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-navy-100 bg-white p-6 shadow-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-navy-600 hover:bg-navy-50"
          >
            닫기
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function QuickRequestForm({
  onDone,
  onInvalid,
}: {
  onDone: () => void;
  onInvalid: (message: string) => void;
}) {
  const [company, setCompany] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const phonePattern = /^(01[0-9]-?\d{3,4}-?\d{4}|0\d{1,2}-?\d{3,4}-?\d{4})$/;
        if (!phonePattern.test(phone.trim())) {
          onInvalid("연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)");
          return;
        }
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kind: "request",
              data: {
                company,
                serviceType,
                phone,
                source: "홈 빠른 의뢰 모달",
              },
            }),
          });
          if (!res.ok) {
            console.error("[quick request] notify failed:", await res.text());
          }
        } catch (err) {
          console.error("[quick request] notify error:", err);
        } finally {
          setIsSubmitting(false);
          onDone();
        }
      }}
    >
      <div>
        <label className="label-base" htmlFor="quick-company">
          회사명
        </label>
        <input
          id="quick-company"
          required
          className="input-base"
          placeholder="예) 주식회사 어사인"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div>
        <label className="label-base" htmlFor="quick-service">
          필요한 서비스
        </label>
        <select
          id="quick-service"
          required
          className="input-base"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
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
      </div>
      <div>
        <label className="label-base" htmlFor="quick-phone">
          연락처
        </label>
        <input
          id="quick-phone"
          required
          className="input-base"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Link
          href="/request"
          onClick={onDone}
          className="inline-flex items-center rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-900 hover:border-navy-400"
        >
          상세 폼으로 이동
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "접수 중..." : "빠른 접수"}
        </button>
      </div>
    </form>
  );
}

function QuickExpertForm({
  onDone,
  onInvalid,
}: {
  onDone: () => void;
  onInvalid: (message: string) => void;
}) {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
          onInvalid("이메일 형식이 올바르지 않습니다.");
          return;
        }
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kind: "expert",
              data: {
                name,
                specialties: [specialty],
                email,
                source: "홈 빠른 등록 모달",
              },
            }),
          });
          if (!res.ok) {
            console.error("[quick expert] notify failed:", await res.text());
          }
        } catch (err) {
          console.error("[quick expert] notify error:", err);
        } finally {
          setIsSubmitting(false);
          onDone();
        }
      }}
    >
      <div>
        <label className="label-base" htmlFor="quick-name">
          이름
        </label>
        <input
          id="quick-name"
          required
          className="input-base"
          placeholder="예) 김민준"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="label-base" htmlFor="quick-specialty">
          주 전문분야
        </label>
        <select
          id="quick-specialty"
          required
          className="input-base"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          <option value="" disabled>
            전문분야를 선택하세요
          </option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label-base" htmlFor="quick-email">
          이메일
        </label>
        <input
          id="quick-email"
          required
          type="email"
          className="input-base"
          placeholder="expert@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Link
          href="/expert-register"
          onClick={onDone}
          className="inline-flex items-center rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-900 hover:border-navy-400"
        >
          상세 폼으로 이동
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "신청 중..." : "빠른 신청"}
        </button>
      </div>
    </form>
  );
}
