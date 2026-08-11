import "server-only";

/**
 * 공개 API 클라이언트.
 *
 * ── 왜 server-only 인가 ──
 *
 * 이 모듈은 서버에서만 실행된다. 브라우저는 API 호스트를 알지 못하고,
 * 알 필요도 없다. 클라이언트 컴포넌트가 실수로 import 하면
 * "server-only" 가 빌드 단계에서 막는다 — 런타임에 발견하는 것보다
 * 훨씬 싸다.
 *
 * ── 왜 실패해도 예외를 던지지 않는가 ──
 *
 * 빌드·재검증 시점에 API 가 잠깐 죽어 있을 수 있다. 그때 예외를 던지면
 * 페이지 생성 전체가 실패하고 사이트가 통째로 안 뜬다.
 * 대신 자리표시자 데이터로 폴백한다 — 오래된 내용이라도 보이는 편이
 * 빈 화면보다 낫다. 대신 로그를 반드시 남긴다.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/** 빌드가 API 응답을 기다리다 멈추지 않게 한다 */
const TIMEOUT_MS = 5000;

export type ApiProduct = {
  slug: string;
  type: "EQUIPMENT" | "PART" | "ACCESSORY";
  category: string;
  nameKo: string;
  nameEn: string;
  summary: string;
  description: string | null;
  footprintM2: number | null;
  widthMm: number | null;
  depthMm: number | null;
  heightMm: number | null;
  weightKg: number | null;
  thumbnailKey: string | null;
  imageKeys: string[];
};

type FetchOptions = {
  /** ISR 재검증 주기(초). CMS 발행 시 on-demand 로도 갱신된다. */
  revalidate?: number;
  tags?: string[];
};

async function get<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  if (!API_BASE) {
    // 로컬에서 API 없이 프론트만 볼 때. 조용히 넘어가고 폴백을 쓴다.
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: {
        revalidate: options.revalidate ?? 300,
        tags: options.tags,
      },
    });

    if (!response.ok) {
      if (response.status !== 404) {
        console.error(`[api] ${path} → ${response.status}`);
      }
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(
      `[api] ${path} 실패:`,
      error instanceof Error ? error.message : "unknown",
    );
    return null;
  }
}

export async function fetchProducts(
  type: "EQUIPMENT" | "PART" | "ACCESSORY",
): Promise<ApiProduct[] | null> {
  const data = await get<{ items: ApiProduct[] }>(
    `/api/public/products?type=${type}`,
    { tags: ["products"] },
  );
  return data?.items ?? null;
}

export async function fetchProduct(slug: string): Promise<ApiProduct | null> {
  return get<ApiProduct>(`/api/public/products/${encodeURIComponent(slug)}`, {
    tags: ["products", `product:${slug}`],
  });
}
