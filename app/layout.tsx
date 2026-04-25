import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SITE_NAME = "Assign";
const SITE_TITLE = "Assign | 검증된 전문가와 기업을 잇는 B2B 전문서비스 마켓플레이스";
const SITE_DESCRIPTION =
  "Assign은 회계, 세무, 재무자문, 컨설팅 등 전문서비스를 필요로 하는 기업과 검증된 전문가를 연결하는 B2B 마켓플레이스입니다.";
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
        alt: "Assign - B2B 전문서비스 마켓플레이스",
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
