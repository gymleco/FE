import { NextResponse, type NextRequest } from "next/server";

/**
 * 문의 접수 프록시.
 *
 * 브라우저는 API 서버를 직접 호출하지 않는다. 여기가 대신 받아서
 * 서버 간 호출로 전달한다. 그래서:
 *
 *  - API 를 인터넷에 넓게 열 필요가 없다 (CORS 설정도 불필요)
 *  - 봇 차단과 1차 rate limit 을 엣지에서 끝낼 수 있다
 *  - API 주소가 브라우저에 노출되지 않는다
 *
 * 최종 검증과 저장은 API 서버가 한다. 여기 검증은 편의이지 방어선이 아니다 —
 * 이 경로를 우회해 API 를 직접 부를 수 있다고 전제한다.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const ALLOWED_TYPES = new Set([
  "QUOTE",
  "DEMO",
  "OFFICIAL",
  "USED",
  "PART",
  "ETC",
]);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "VALIDATION_FAILED", message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  /*
   * honeypot — 사람에게는 보이지 않는 칸이다.
   *
   * ★ 200 을 돌려주고 조용히 버린다.
   *   400 을 주면 봇이 "이 필드를 비우면 되는구나" 를 학습한다.
   *   차단당했다는 사실 자체를 알리지 않는 것이 핵심이다.
   */
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const name = String(body.name ?? "").trim();
  const phoneDigits = String(body.phone ?? "").replace(/\D/g, "");
  const type = String(body.type ?? "ETC");

  if (!name || phoneDigits.length < 9 || !body.privacyConsent) {
    return NextResponse.json(
      { code: "VALIDATION_FAILED", message: "필수 항목을 확인해 주세요." },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json(
      { code: "VALIDATION_FAILED", message: "문의 유형이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (!API_BASE) {
    // 로컬에서 API 없이 프론트만 띄운 경우.
    // 조용히 성공시키면 문의가 사라진 줄도 모르므로 명확히 실패시킨다.
    console.error("NEXT_PUBLIC_API_BASE_URL 이 없어 문의를 전달할 수 없습니다.");
    return NextResponse.json(
      { code: "UPSTREAM_UNAVAILABLE", message: "일시적인 오류입니다." },
      { status: 502 },
    );
  }

  // Cloudflare / nginx 뒤에서 실제 방문자 IP 를 API 로 넘긴다.
  // API 의 rate limit 이 프록시 IP 하나만 보지 않게 하기 위해서다.
  const clientIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";

  try {
    const upstream = await fetch(`${API_BASE}/api/public/inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      body: JSON.stringify({
        type,
        name,
        phone: String(body.phone ?? ""),
        email: body.email ?? null,
        company: body.company ?? null,
        region: body.region ?? null,
        spaceInfo: body.spaceInfo ?? null,
        productSlugs: Array.isArray(body.productSlugs) ? body.productSlugs : [],
        message: String(body.message ?? ""),
        privacyConsent: true,
        marketingConsent: Boolean(body.marketingConsent),
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (upstream.status === 429) {
      return NextResponse.json(
        { code: "RATE_LIMITED", message: "잠시 후 다시 시도해 주세요." },
        { status: 429 },
      );
    }

    if (!upstream.ok) {
      /*
       * 업스트림의 응답 본문을 그대로 흘리지 않는다.
       * 내부 오류 메시지·스택이 방문자에게 노출될 수 있다.
       * 상태 코드만 로그로 남긴다 — 개인정보는 로그에 남기지 않는다.
       */
      console.error(`문의 접수 업스트림 실패: ${upstream.status}`);
      return NextResponse.json(
        { code: "UPSTREAM_ERROR", message: "일시적인 오류입니다." },
        { status: 502 },
      );
    }

    // 저장된 개인정보를 되돌려주지 않는다
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(
      "문의 접수 전달 실패:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { code: "UPSTREAM_UNAVAILABLE", message: "일시적인 오류입니다." },
      { status: 502 },
    );
  }
}
