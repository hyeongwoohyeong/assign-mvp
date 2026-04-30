import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =====================================================================
// 운영자 인증 게이트
// =====================================================================
//
// /admin 및 그 하위 경로에 대해 HTTP Basic Auth 를 강제한다.
// - Vercel 환경변수 ADMIN_USER, ADMIN_PASS 가 설정되어 있어야 통과 가능.
// - 환경변수가 누락된 경우 503 으로 차단(Fail-Closed).
// - 인증 실패 시 401 + WWW-Authenticate 헤더로 브라우저 기본 인증창 노출.
//
// 운영자 사용 흐름:
//   1) /admin 접속 → 브라우저가 사용자/비밀번호 입력창 표시
//   2) 정확히 입력하면 페이지 노출, 브라우저가 이번 세션 동안 기억
//   3) 일반 방문자는 인증 정보가 없으므로 절대 접근 불가
//
// 본 미들웨어는 Edge 런타임에서 실행되므로 Buffer 대신 atob 을 사용한다.

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const expectedUser = process.env.ADMIN_USER ?? "";
  const expectedPass = process.env.ADMIN_PASS ?? "";

  // 환경변수가 비어 있으면 차단(잘못된 배포 시 의도치 않게 모두 통과되는 사고 방지).
  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      "운영자 인증이 설정되지 않았습니다. Vercel 환경변수 ADMIN_USER, ADMIN_PASS 를 설정해 주세요.",
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, b64] = auth.split(" ");
    if (scheme === "Basic" && b64) {
      let decoded = "";
      try {
        decoded = atob(b64);
      } catch {
        decoded = "";
      }
      const sepIdx = decoded.indexOf(":");
      if (sepIdx !== -1) {
        const user = decoded.slice(0, sepIdx);
        const pass = decoded.slice(sepIdx + 1);
        if (user === expectedUser && pass === expectedPass) {
          return NextResponse.next();
        }
      }
    }
  }

  // 401 응답 + WWW-Authenticate 헤더 → 브라우저가 인증 다이얼로그를 띄운다.
  return new NextResponse("운영자 인증이 필요합니다.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Assign Admin", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
