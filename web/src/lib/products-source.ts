import "server-only";

import {
  accessories as fallbackAccessories,
  equipment as fallbackEquipment,
  parts as fallbackParts,
  type Product,
  type ProductCategory,
  type ProductType,
  findProduct as findFallbackProduct,
} from "@/lib/catalog";
import { fetchProduct, fetchProducts, type ApiProduct } from "@/lib/api";

/**
 * 제품 데이터의 단일 진입점.
 *
 * 페이지는 여기만 부른다. API 가 붙어 있으면 실데이터, 없으면
 * 자리표시자로 폴백한다. 페이지 코드에 조건 분기가 흩어지지 않는다.
 *
 * ★ 폴백은 개발 편의가 아니라 가용성 장치다.
 *   빌드 시점에 API 가 잠깐 죽으면 페이지 생성이 전부 실패해
 *   사이트가 통째로 안 뜬다. 오래된 내용이라도 보이는 편이 낫다.
 *
 * ★ 자리표시자로 폴백했다는 사실을 화면에 드러낸다.
 *   isPlaceholder 가 살아 있어 "샘플 데이터" 배지가 붙는다.
 *   가짜 수치가 진짜처럼 보이는 것이 이 사이트에서 가장 위험하다 —
 *   설치 면적 숫자로 설득하는 사이트이기 때문이다.
 */

function toProduct(api: ApiProduct): Product {
  return {
    slug: api.slug,
    type: api.type,
    category: api.category as ProductCategory,
    nameKo: api.nameKo,
    nameEn: api.nameEn,
    summary: api.summary,
    description: api.description ?? undefined,
    footprintM2: api.footprintM2 ?? undefined,
    widthMm: api.widthMm ?? undefined,
    depthMm: api.depthMm ?? undefined,
    heightMm: api.heightMm ?? undefined,
    weightKg: api.weightKg ?? undefined,
    imageUrl: api.thumbnailKey ? imageUrl(api.thumbnailKey) : undefined,
    // API 에서 온 데이터에는 배지를 붙이지 않는다
    isPlaceholder: false,
  };
}

/** 스토리지 키 → 공개 URL. CDN 도메인이 바뀌어도 키는 그대로다. */
export function imageUrl(key: string, size: 400 | 800 | 1600 = 800): string {
  const base = process.env.NEXT_PUBLIC_CDN_ORIGIN?.replace(/\/$/, "") ?? "";
  return `${base}/${key}/${size}.jpg`;
}

const FALLBACK: Record<ProductType, Product[]> = {
  EQUIPMENT: fallbackEquipment,
  PART: fallbackParts,
  ACCESSORY: fallbackAccessories,
};

export async function getProducts(type: ProductType): Promise<Product[]> {
  const fromApi = await fetchProducts(type);
  if (fromApi === null) {
    return FALLBACK[type];
  }
  /*
   * API 는 붙었는데 결과가 비어 있는 경우 — 아직 등록된 제품이 없는
   * 정상 상태다. 자리표시자로 되돌리지 않는다. 그러면 대표님이
   * 관리 화면에서 제품을 지웠는데 사이트에는 계속 보이게 된다.
   */
  return fromApi.map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const fromApi = await fetchProduct(slug);
  if (fromApi) {
    return toProduct(fromApi);
  }
  // API 가 없거나(로컬) 404 인 경우 자리표시자에서 찾아본다
  return findFallbackProduct(slug) ?? null;
}

/** generateStaticParams 용 — 실데이터 우선, 없으면 자리표시자 */
export async function getAllProductSlugs(): Promise<string[]> {
  const types: ProductType[] = ["EQUIPMENT", "PART", "ACCESSORY"];
  const lists = await Promise.all(types.map((t) => getProducts(t)));
  return lists.flat().map((p) => p.slug);
}
