/**
 * 카탈로그 — 기구 · 부품 · 악세사리
 *
 * ⚠️ 지금 들어 있는 값은 전부 자리표시자다. 실제 스펙이 아니다.
 *    대표님께 제품 목록을 받으면 교체한다.
 *    isPlaceholder 가 true 면 화면에 "샘플" 배지가 붙는다 —
 *    가짜 수치가 조용히 배포되는 것을 막기 위한 장치다.
 *
 * 필드 이름은 백엔드 스키마에 맞춰 두었다.
 * API 연결 시 이 파일은 fetch 결과로 대체된다.
 */

export type ProductType = "EQUIPMENT" | "PART" | "ACCESSORY";

export type ProductCategory =
  | "STRENGTH"
  | "CABLE"
  | "RACK"
  | "BENCH"
  | "CARDIO"
  | "PART"
  | "ACCESSORY";

export interface Product {
  slug: string;
  type: ProductType;
  category: ProductCategory;
  nameKo: string;
  nameEn: string;
  summary: string;
  description?: string;
  /** 기구에만 있다. 부품·악세사리는 치수가 의미 없다. */
  footprintM2?: number;
  widthMm?: number;
  depthMm?: number;
  heightMm?: number;
  weightKg?: number;
  /** 800px 렌디션. 사진이 없으면 설치 면적 다이어그램으로 대체된다. */
  imageUrl?: string;
  /** 400/800/1600 렌디션 srcset — imageUrl 이 있을 때만 함께 채워진다 */
  imageSrcSet?: string;
  isPlaceholder?: boolean;
}

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  STRENGTH: "머신",
  CABLE: "케이블",
  RACK: "랙",
  BENCH: "벤치",
  CARDIO: "유산소",
  PART: "부품",
  ACCESSORY: "악세사리",
};

/** 일반 상업용 기구의 평균 설치 면적 — 비교 연출의 기준값 */
export const TYPICAL_FOOTPRINT_M2 = 4.2;

export const catalog: Product[] = [
  // ── 기구 ────────────────────────────────────────────────
  {
    slug: "power-rack",
    type: "EQUIPMENT",
    category: "RACK",
    nameKo: "파워 랙",
    nameEn: "Power Rack",
    summary: "프리웨이트의 중심. 한 대로 스쿼트부터 풀업까지.",
    description:
      "4주 프레임을 관통 볼트로 고정해 흔들림을 없앴습니다. 세이프티 바 높이는 5cm 단위로 조절되고, 상단 풀업 바는 두 가지 그립을 지원합니다.",
    footprintM2: 2.6,
    widthMm: 1400,
    depthMm: 1850,
    heightMm: 2300,
    weightKg: 210,
    isPlaceholder: true,
  },
  {
    slug: "cable-crossover",
    type: "EQUIPMENT",
    category: "CABLE",
    nameKo: "케이블 크로스오버",
    nameEn: "Cable Crossover",
    summary: "벽면을 따라 세워 통로를 그대로 남긴다.",
    description:
      "깊이를 1.1m로 줄여 벽에 붙여 설치할 수 있습니다. 통로 폭을 확보해야 하는 좁은 공간에 적합합니다.",
    footprintM2: 3.1,
    widthMm: 3600,
    depthMm: 1100,
    heightMm: 2350,
    weightKg: 340,
    isPlaceholder: true,
  },
  {
    slug: "smith-machine",
    type: "EQUIPMENT",
    category: "STRENGTH",
    nameKo: "스미스 머신",
    nameEn: "Smith Machine",
    summary: "혼자 훈련하는 회원에게 가장 먼저 권하게 되는 기구.",
    description:
      "바가 정해진 궤도로만 움직여 보조자 없이도 고중량 훈련이 가능합니다. 리니어 베어링을 적용해 마찰음을 줄였습니다.",
    footprintM2: 2.4,
    widthMm: 1500,
    depthMm: 1600,
    heightMm: 2250,
    weightKg: 260,
    isPlaceholder: true,
  },
  {
    slug: "leg-press",
    type: "EQUIPMENT",
    category: "STRENGTH",
    nameKo: "레그 프레스",
    nameEn: "Leg Press",
    summary: "각도를 낮춰 천장 낮은 지하 공간에도 들어간다.",
    description:
      "45도 대신 35도 각도를 적용해 전체 높이를 1.55m로 낮췄습니다. 천장이 낮은 지하 상가에도 설치할 수 있습니다.",
    footprintM2: 3.4,
    widthMm: 1250,
    depthMm: 2700,
    heightMm: 1550,
    weightKg: 295,
    isPlaceholder: true,
  },
  {
    slug: "lat-pulldown",
    type: "EQUIPMENT",
    category: "CABLE",
    nameKo: "랫 풀다운",
    nameEn: "Lat Pulldown",
    summary: "좌석과 패드만으로 등 전체를 커버한다.",
    description:
      "허벅지 패드 높이가 조절되어 체격 차이가 큰 회원이 함께 쓰기 좋습니다.",
    footprintM2: 1.9,
    widthMm: 1200,
    depthMm: 1550,
    heightMm: 2100,
    weightKg: 175,
    isPlaceholder: true,
  },
  {
    slug: "adjustable-bench",
    type: "EQUIPMENT",
    category: "BENCH",
    nameKo: "어저스터블 벤치",
    nameEn: "Adjustable Bench",
    summary: "세워서 보관하면 0.3m². 쓰지 않을 땐 자리를 비운다.",
    description:
      "등받이 7단, 좌판 3단 조절. 뒷바퀴가 있어 한 손으로 옮길 수 있고, 세워서 보관하면 차지하는 면적이 0.3m²로 줄어듭니다.",
    footprintM2: 0.9,
    widthMm: 560,
    depthMm: 1500,
    heightMm: 500,
    weightKg: 42,
    isPlaceholder: true,
  },

  // ── 부품 ────────────────────────────────────────────────
  {
    slug: "cable-wire-6mm",
    type: "PART",
    category: "PART",
    nameKo: "케이블 와이어 6mm",
    nameEn: "Cable Wire 6mm",
    summary: "케이블 머신 소모품. 사용 빈도에 따라 2~3년 주기 교체.",
    isPlaceholder: true,
  },
  {
    slug: "pulley-wheel",
    type: "PART",
    category: "PART",
    nameKo: "도르래 휠",
    nameEn: "Pulley Wheel",
    summary: "소음이 커지면 베어링보다 휠을 먼저 확인합니다.",
    isPlaceholder: true,
  },
  {
    slug: "bench-pad",
    type: "PART",
    category: "PART",
    nameKo: "벤치 패드",
    nameEn: "Bench Pad",
    summary: "찢어짐·꺼짐 시 교체. 모델별 규격이 다릅니다.",
    isPlaceholder: true,
  },
  {
    slug: "weight-pin",
    type: "PART",
    category: "PART",
    nameKo: "중량 핀",
    nameEn: "Weight Pin",
    summary: "가장 자주 분실되는 부품입니다. 여유분을 두시길 권합니다.",
    isPlaceholder: true,
  },

  // ── 악세사리 ────────────────────────────────────────────
  {
    slug: "lifting-belt",
    type: "ACCESSORY",
    category: "ACCESSORY",
    nameKo: "리프팅 벨트",
    nameEn: "Lifting Belt",
    summary: "고중량 스쿼트·데드리프트 시 허리 보호.",
    isPlaceholder: true,
  },
  {
    slug: "cable-handle-set",
    type: "ACCESSORY",
    category: "ACCESSORY",
    nameKo: "케이블 핸들 세트",
    nameEn: "Cable Handle Set",
    summary: "V바·스트레이트바·로프 3종. 케이블 머신 운용 폭이 넓어집니다.",
    isPlaceholder: true,
  },
  {
    slug: "rubber-flooring",
    type: "ACCESSORY",
    category: "ACCESSORY",
    nameKo: "고무 바닥재",
    nameEn: "Rubber Flooring",
    summary: "소음과 진동을 줄입니다. 아래층 민원의 대부분이 여기서 해결됩니다.",
    isPlaceholder: true,
  },
  {
    slug: "barbell-collar",
    type: "ACCESSORY",
    category: "ACCESSORY",
    nameKo: "바벨 조임쇠",
    nameEn: "Barbell Collar",
    summary: "원판 이탈 방지. 소모품으로 여유 수량을 권합니다.",
    isPlaceholder: true,
  },
];

export const equipment = catalog.filter((p) => p.type === "EQUIPMENT");
export const parts = catalog.filter((p) => p.type === "PART");
export const accessories = catalog.filter((p) => p.type === "ACCESSORY");

export function findProduct(slug: string): Product | undefined {
  return catalog.find((p) => p.slug === slug);
}

/** 같은 카테고리의 다른 제품 — 상세 페이지 하단에 쓴다 */
export function relatedProducts(product: Product, limit = 3): Product[] {
  return catalog
    .filter(
      (p) =>
        p.slug !== product.slug &&
        p.type === product.type &&
        p.category === product.category,
    )
    .slice(0, limit);
}
