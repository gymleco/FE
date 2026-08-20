import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * CMS 발행 → 정적 페이지 갱신.
 *
 * Spring Boot 가 트랜잭션 커밋 이후에 호출한다
 * (SiteRevalidationListener, @TransactionalEventListener AFTER_COMMIT).
 *
 * ── 왜 필요한가 ──
 *
 * 이게 없으면 대표님이 제품을 등록해도 사이트에 최대 5분(fetch 캐시
 * revalidate 주기) 동안 나타나지 않는다. 실제로 제품 14건을 등록하고
 * 다시 빌드했는데 이전 응답이 재사용돼 2건만 나온 적이 있다.
 * "올렸는데 왜 안 보이죠" 가 운영 중 가장 흔한 문의가 된다.
 *
 * ── revalidateTag 와 revalidatePath 를 둘 다 부르는 이유 ──
 *
 * revalidatePath 는 라우트 캐시를 무효화한다. 그런데 오래된 데이터를
 * 실제로 붙들고 있는 건 fetch 캐시다. lib/api.ts 가 태그를 달아두었고,
 * revalidateTag 가 그것을 끊는다. 둘 중 하나만 부르면 화면이 그대로다.
 */

const TOKEN = process.env.REVALIDATE_TOKEN;

/**
 * 타이밍 공격 방어.
 *
 * === 로 비교하면 앞에서 몇 글자가 맞았는지가 응답 시간에 드러난다.
 * 토큰을 한 글자씩 알아낼 수 있게 되므로 상수 시간 비교를 쓴다.
 */
function tokenMatches(provided: string): boolean {
  if (!TOKEN) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(TOKEN);
  // 길이가 다르면 timingSafeEqual 이 던진다. 길이 자체는 비밀이 아니다.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!TOKEN) {
    /*
     * 토큰이 설정되지 않았는데 열어두면 누구나 캐시를 무효화할 수 있다.
     * 반복 호출로 원본 서버를 두들기는 증폭 공격이 된다.
     * 설정이 없으면 기능 자체를 끈다.
     */
    console.error("REVALIDATE_TOKEN 이 설정되지 않아 재검증을 거부합니다.");
    return NextResponse.json({ code: "NOT_CONFIGURED" }, { status: 503 });
  }

  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!tokenMatches(provided)) {
    // 왜 실패했는지 알려주지 않는다
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  let paths: string[] = [];
  try {
    const body = await request.json();
    if (Array.isArray(body?.paths)) {
      paths = body.paths.filter(
        (p: unknown): p is string => typeof p === "string" && p.startsWith("/"),
      );
    }
  } catch {
    return NextResponse.json({ code: "VALIDATION_FAILED" }, { status: 400 });
  }

  /*
   * 태그를 먼저 끊는다. 이게 fetch 캐시를 실제로 비우는 부분이다.
   * 경로별 태그도 함께 끊어 상세 페이지가 즉시 갱신되게 한다.
   *
   * ── { expire: 0 } 을 쓰는 이유 ──
   *
   * Next 16 부터 revalidateTag 는 두 번째 인자가 필수다.
   * 권장값은 "max"(stale-while-revalidate)지만, 그건 "곧 갱신된다" 이지
   * "지금 갱신된다" 가 아니다.
   *
   * 여기는 외부 시스템(Spring Boot)이 커밋 직후 호출하는 웹훅이고,
   * 대표님이 저장 버튼을 누른 뒤 사이트를 새로고침해 확인하는 흐름이다.
   * 한 번 더 옛 내용이 보이면 "안 올라갔네" 라고 판단하게 된다.
   * 문서도 이 경우에 expire: 0 을 쓰라고 명시한다.
   */
  revalidateTag("products", { expire: 0 });
  for (const path of paths) {
    const slug = path.match(/^\/products\/([^/]+)$/)?.[1];
    if (slug) revalidateTag(`product:${slug}`, { expire: 0 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  console.log(`[revalidate] ${paths.length}개 경로 갱신: ${paths.join(", ")}`);
  return NextResponse.json({ revalidated: paths.length });
}
