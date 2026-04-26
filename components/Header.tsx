"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/#quick-start", label: "빠른 시작" },
  { href: "/#service", label: "이용 방법" },
  { href: "/#snapshot", label: "운영 스냅샷" },
  { href: "/#social-proof", label: "고객 후기" },
  { href: "/#faq", label: "FAQ" },
];

const SUB_LINKS = [
  { href: "/experts", label: "전문가 디렉터리" },
  { href: "/admin", label: "운영 대시보드" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Assign 홈">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-sm font-bold text-white">
            A
          </div>
          <span className="text-lg font-bold tracking-tight text-navy-900">
            Assign
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-navy-700 transition-colors hover:text-navy-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {SUB_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-navy-500 hover:text-navy-800"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/request"
            className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            의뢰 등록하기
          </Link>
        </div>

        <button
          type="button"
          aria-label="메뉴 열기"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-navy-800"
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-100 bg-white md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2 text-sm font-medium text-navy-800 hover:bg-navy-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-navy-100" />
            {SUB_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/request"
              className="mt-2 rounded-lg bg-navy-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              의뢰 등록하기
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
