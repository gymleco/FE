import { NextResponse, type NextRequest } from "next/server";

/**
 * 정품 확인 프록시.
 *
 * 문의 접수(app/api/inquiries)와 같은 이유로 브라우저가 API 서버를 직접
 * 부르지 않는다 — API 를 인터넷에 넓게 열 필요가 없고, API 주소가
 * 브라우저에 노출되지 않는다.
 *
 * ★ 여기서 «찾았다 / 못 찾았다» 를 판단하지 않는다.
 *   판정도, 조회 이력도, 번호 긁어가기 차단도 전부 API 서버가 한다.
 *   여기 검증은 편의이지 방어선이 아니다 — 이 경로를 우회해 API 를 직접
 *   부를 수 있다고 전제한다.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  const serial = String(body.serial ?? "").trim();
  const modelCode = String(body.modelCode ?? "").trim();

  if (!serial || !modelCode) {
    return NextResponse.json(
      { code: "VALIDATION_FAILED", message: "일련번호와 모델번호를 모두 입력해 주세요." },
      { status: 400 },
    );
  }

  /*
   * 길이를 여기서도 막는다.
   * API 가 60자로 자르지만, 그 전에 거대한 본문이 서버 간 호출로 흘러가는
   * 것 자체가 낭비다. 사람이 명판을 보고 옮겨 적는 값에 60자는 넉넉하다.
   */
  if (serial.length > 60 || modelCode.length > 40) {
    return NextResponse.json(
      { code: "VALIDATION_FAILED", message: "입력이 너무 깁니다." },
      { status: 400 },
    );
  }

  if (!API_BASE) {
    console.error("NEXT_PUBLIC_API_BASE_URL 이 없어 정품 확인을 전달할 수 없습니다.");
    return NextResponse.json(
      { code: "UPSTREAM_UNAVAILABLE", message: "일시적인 오류입니다." },
      { status: 502 },
    );
  }

  /*
   * 실제 방문자 IP 를 넘긴다.
   * 이게 없으면 API 의 «번호 긁어가기» 차단이 프록시 IP 하나만 보게 되어,
   * 한 사람이 훑는 것과 온 나라가 조회하는 것을 구분하지 못한다.
   */
  const clientIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";

  try {
    const upstream = await fetch(`${API_BASE}/api/public/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      body: JSON.stringify({ serial, modelCode }),
      signal: AbortSignal.timeout(8000),
    });

    if (upstream.status === 429) {
      return NextResponse.json(
        { code: "RATE_LIMITED", message: "조회가 너무 잦습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 },
      );
    }

    if (!upstream.ok) {
      console.error(`정품 확인 업스트림 실패: ${upstream.status}`);
      return NextResponse.json(
        { code: "UPSTREAM_ERROR", message: "일시적인 오류입니다." },
        { status: 502 },
      );
    }

    /*
     * 응답을 그대로 흘려보낸다.
     * API 가 이미 «공개해도 되는 것» 만 담아서 준다(VerificationView).
     * 여기서 필드를 더하거나 재구성하면 그 경계가 두 곳으로 갈라진다.
     */
    const data = await upstream.json();
    return NextResponse.json(data, {
      status: 200,
      // 조회 결과는 사람마다 다르고, 캐시에 남으면 안 되는 값이다
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "정품 확인 전달 실패:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { code: "UPSTREAM_UNAVAILABLE", message: "일시적인 오류입니다." },
      { status: 502 },
    );
  }
}
