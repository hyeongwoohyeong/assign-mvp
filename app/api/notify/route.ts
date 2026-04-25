import { NextResponse } from "next/server";

// 새로운 의뢰/전문가 등록이 들어올 때마다 운영자에게 이메일로 알려주는 API.
//
// 동작 흐름:
//   1. /request, /expert-register 폼이 제출되면 이 엔드포인트로 POST 요청을 보낸다.
//   2. 환경변수에 RESEND_API_KEY 가 있으면 Resend 로 메일을 보낸다.
//   3. 키가 없으면 (로컬 개발 등) 콘솔에만 로그를 남기고 정상 응답한다 — 폼 UX는 그대로.
//
// 필요한 환경변수 (Vercel → Project → Settings → Environment Variables):
//   - RESEND_API_KEY    : Resend 대시보드에서 발급한 키 (re_xxx 형식)
//   - NOTIFY_TO_EMAIL   : 알림을 받을 이메일 (예: guddn8663@naver.com)
//   - NOTIFY_FROM_EMAIL : (선택) 발신 주소. 도메인을 검증하지 않았다면 onboarding@resend.dev 그대로.

export const runtime = "nodejs";

type NotifyKind = "request" | "expert";

interface NotifyPayload {
  kind: NotifyKind;
  data: Record<string, unknown>;
}

const DEFAULT_TO = "guddn8663@naver.com";
const DEFAULT_FROM = "Assign Notification <onboarding@resend.dev>";

export async function POST(req: Request) {
  let payload: NotifyPayload;
  try {
    payload = (await req.json()) as NotifyPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  if (!payload?.kind || !payload?.data) {
    return NextResponse.json(
      { ok: false, error: "MISSING_FIELDS" },
      { status: 400 },
    );
  }

  const subject = buildSubject(payload);
  const html = buildHtml(payload);
  const text = buildText(payload);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_TO_EMAIL ?? DEFAULT_TO;
  const from = process.env.NOTIFY_FROM_EMAIL ?? DEFAULT_FROM;

  // 키가 없으면 메일 발송은 건너뛰고 정상 응답.
  // 로컬에서 .env 없이도 폼 동작 확인이 가능하도록 하기 위함.
  if (!apiKey) {
    console.warn(
      "[notify] RESEND_API_KEY 가 설정되지 않아 메일을 발송하지 않았습니다.",
    );
    console.log("[notify] payload =", payload);
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[notify] resend error:", error);
      return NextResponse.json(
        { ok: false, error: "EMAIL_SEND_FAILED" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[notify] unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "UNEXPECTED" },
      { status: 500 },
    );
  }
}

function buildSubject(p: NotifyPayload): string {
  if (p.kind === "request") {
    const company = (p.data.company as string) || "(회사명 미입력)";
    const service = (p.data.serviceType as string) || "";
    return `[Assign] 신규 용역 의뢰 — ${company}${service ? ` / ${service}` : ""}`;
  }
  const name = (p.data.name as string) || "(이름 미입력)";
  const firm = (p.data.firm as string) || "";
  return `[Assign] 신규 전문가 등록 — ${name}${firm ? ` / ${firm}` : ""}`;
}

function buildHtml(p: NotifyPayload): string {
  const rows = Object.entries(p.data)
    .map(([key, value]) => {
      const label = LABELS[key] ?? key;
      const display = formatValue(value);
      return `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#1f2937;width:160px;background:#f9fafb;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#111827;white-space:pre-wrap;">${escapeHtml(display)}</td>
        </tr>`;
    })
    .join("");

  const heading =
    p.kind === "request" ? "신규 용역 의뢰" : "신규 전문가 등록";

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif; max-width:640px; margin:0 auto; padding:24px;">
    <div style="background:#0f1729;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0;">
      <p style="margin:0;font-size:12px;letter-spacing:0.08em;color:#9eadc4;">ASSIGN NOTIFICATION</p>
      <h1 style="margin:6px 0 0;font-size:20px;">${heading}</h1>
    </div>
    <table style="border-collapse:collapse;width:100%;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;overflow:hidden;font-size:14px;">
      ${rows}
    </table>
    <p style="margin-top:16px;font-size:12px;color:#6b7280;">
      이 메일은 Assign 플랫폼 폼 제출 시 자동으로 발송됩니다.
    </p>
  </div>`;
}

function buildText(p: NotifyPayload): string {
  const lines = Object.entries(p.data).map(
    ([key, value]) => `${LABELS[key] ?? key}: ${formatValue(value)}`,
  );
  const heading = p.kind === "request" ? "신규 용역 의뢰" : "신규 전문가 등록";
  return [`[Assign] ${heading}`, "", ...lines].join("\n");
}

const LABELS: Record<string, string> = {
  // request form
  company: "회사명",
  contactName: "담당자명",
  email: "이메일",
  phone: "연락처",
  serviceType: "서비스 유형",
  location: "회사 소재지",
  budget: "예상 용역금액",
  startDate: "희망 착수 시점",
  description: "프로젝트 설명",
  confidential: "보안 매칭 요청",
  // expert form
  name: "이름",
  firm: "소속",
  specialties: "전문분야",
  qualifications: "보유 자격",
  experience: "주요 수행 경험",
  preferredServices: "선호 용역 유형",
  serviceArea: "담당 가능 지역",
  intro: "프로필 소개",
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "(미입력)";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "예" : "아니오";
  return String(value);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
