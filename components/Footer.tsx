import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-900 text-xs font-bold text-white">
                A
              </div>
              <span className="text-base font-bold tracking-tight text-navy-900">
                Assign
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-navy-500">
              검증된 전문가와 기업을 연결하는<br />B2B 전문서비스 마켓플레이스
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-navy-900">서비스</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-600">
              <li>
                <Link href="/request" className="hover:text-navy-900">
                  용역 의뢰
                </Link>
              </li>
              <li>
                <Link href="/experts" className="hover:text-navy-900">
                  전문가 찾기
                </Link>
              </li>
              <li>
                <Link href="/expert-register" className="hover:text-navy-900">
                  전문가 등록
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-navy-900">회사</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-600">
              <li>
                <Link href="/about" className="hover:text-navy-900">
                  Assign 소개
                </Link>
              </li>
              <li>
                <Link href="/#service" className="hover:text-navy-900">
                  매칭 방식
                </Link>
              </li>
              <li>
                <Link href="/#vision" className="hover:text-navy-900">
                  비전
                </Link>
              </li>
              <li>
                <a
                  href="mailto:guddn8663@naver.com"
                  className="hover:text-navy-900"
                >
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-navy-900">정책</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-600">
              <li>
                <Link href="#" className="hover:text-navy-900">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-navy-900">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-navy-100 pt-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Assign. All rights reserved.</span>
          <span>
            운영 문의:{" "}
            <a
              href="mailto:guddn8663@naver.com"
              className="text-navy-500 hover:text-navy-800"
            >
              guddn8663@naver.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
