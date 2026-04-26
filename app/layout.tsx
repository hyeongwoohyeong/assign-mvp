import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SITE_NAME = "Assign";
// COMPLIANCE NOTE: 직역 규제(회계/세무/법률)상 '연결/매칭/추천' 표현 회피.
// 사이트 포지셔닝은 "의뢰 게시 + 전문가 디렉토리 + 자율 제안" 플랫폼.
const SITE_TITLE =
  "Assign | 전문서비스 의뢰 등록 · 전문가 디렉토리 플랫폼";
const SITE_DESCRIPTION =
  "Assign은 회계, 세무, 재무자문, 컨설팅 등 전문서비스를 필요로 하는 기업과 전문가가 직접 만나는 의뢰·디렉토리 플랫폼입니다. 특정 전문가를 추천하거나 계약을 중개하지 않으며, 정보 게시 및 확인 기능만 제공합니다.";
const SITE_URL =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env?.NEXT_PUBLIC_SITE_URL ?? "https://assign.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Assign - 전문서비스 의뢰·디렉토리 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#f7f9fc] text-navy-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
