import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  const siteUrl =
    (
      globalThis as {
        process?: { env?: Record<string, string | undefined> };
      }
    ).process?.env?.NEXT_PUBLIC_SITE_URL ?? "https://assign.example.com";
  const siteHost = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          padding: "56px",
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#0f1729",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#0f1729" }}>Assign</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 58, lineHeight: 1.15, color: "#0f1729", fontWeight: 800 }}>
            검증된 전문가 제안으로
            <br />
            더 빠르게 의사결정하세요
          </div>
          <div style={{ fontSize: 30, color: "#334155" }}>
            B2B 전문서비스 마켓플레이스 - 회계 · 세무 · 재무자문 · 컨설팅
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#475569" }}>
          {siteHost}
        </div>
      </div>
    ),
    size,
  );
}
