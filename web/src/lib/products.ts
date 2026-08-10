/**
 * 제품 데이터
 *
 * ⚠️ 지금 들어 있는 값은 전부 자리표시자다. 실제 스펙이 아니다.
 *    Phase 0 에서 대표님께 제품 목록·스펙을 받으면 교체한다 (§18-4).
 *    특히 설치 면적(footprintM2)은 이 사이트의 핵심 소구점이라
 *    추정치를 그대로 공개하면 안 된다.
 *
 * isPlaceholder 가 true 인 제품은 화면에 "샘플" 배지가 붙는다.
 * 실제 데이터로 교체하면서 이 플래그를 지우면 배지도 사라진다.
 * 가짜 수치가 조용히 배포되는 것을 막기 위한 장치다.
 *
 * 필드 이름은 백엔드 스키마(기획서 §6 product 테이블)에 맞춰 두었다.
 * API 연결 시 이 파일은 fetch 결과로 대체된다.
 */

export type ProductCategory =
  | "STRENGTH"
  | "CABLE"
  | "RACK"
  | "BENCH"
  | "CARDIO";

export interface Product {
  slug: string;
  nameKo: string;
  nameEn: string;
  category: ProductCategory;
  /** 한 줄 특징 — 쇼케이스에서 제품명 아래 붙는다 */
  summary: string;
  /** 설치 면적 (m²) — 공간 절약이 핵심 소구점이므로 반드시 노출한다 */
  footprintM2: number;
  widthMm: number;
  depthMm: number;
  heightMm: number;
  weightKg: number;
  /** CDN 이미지 경로. 없으면 자리표시자 그래픽이 대신 렌더된다. */
  imageUrl?: string;
  isPlaceholder?: boolean;
}

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  STRENGTH: "머신",
  CABLE: "케이블",
  RACK: "랙",
  BENCH: "벤치",
  CARDIO: "유산소",
};

export const products: Product[] = [
  {
    slug: "power-rack",
    nameKo: "파워 랙",
    nameEn: "Power Rack",
    category: "RACK",
    summary: "프리웨이트의 중심. 한 대로 스쿼트부터 풀업까지.",
    footprintM2: 2.6,
    widthMm: 1400,
    depthMm: 1850,
    heightMm: 2300,
    weightKg: 210,
    isPlaceholder: true,
  },
  {
    slug: "cable-crossover",
    nameKo: "케이블 크로스오버",
    nameEn: "Cable Crossover",
    category: "CABLE",
    summary: "벽면을 따라 세워 통로를 그대로 남긴다.",
    footprintM2: 3.1,
    widthMm: 3600,
    depthMm: 1100,
    heightMm: 2350,
    weightKg: 340,
    isPlaceholder: true,
  },
  {
    slug: "smith-machine",
    nameKo: "스미스 머신",
    nameEn: "Smith Machine",
    category: "STRENGTH",
    summary: "혼자 훈련하는 회원에게 가장 먼저 권하게 되는 기구.",
    footprintM2: 2.4,
    widthMm: 1500,
    depthMm: 1600,
    heightMm: 2250,
    weightKg: 260,
    isPlaceholder: true,
  },
  {
    slug: "leg-press",
    nameKo: "레그 프레스",
    nameEn: "Leg Press",
    category: "STRENGTH",
    summary: "각도를 낮춰 천장 낮은 지하 공간에도 들어간다.",
    footprintM2: 3.4,
    widthMm: 1250,
    depthMm: 2700,
    heightMm: 1550,
    weightKg: 295,
    isPlaceholder: true,
  },
  {
    slug: "lat-pulldown",
    nameKo: "랫 풀다운",
    nameEn: "Lat Pulldown",
    category: "CABLE",
    summary: "좌석과 패드만으로 등 전체를 커버한다.",
    footprintM2: 1.9,
    widthMm: 1200,
    depthMm: 1550,
    heightMm: 2100,
    weightKg: 175,
    isPlaceholder: true,
  },
  {
    slug: "adjustable-bench",
    nameKo: "어저스터블 벤치",
    nameEn: "Adjustable Bench",
    category: "BENCH",
    summary: "세워서 보관하면 0.3m². 쓰지 않을 땐 자리를 비운다.",
    footprintM2: 0.9,
    widthMm: 560,
    depthMm: 1500,
    heightMm: 500,
    weightKg: 42,
    isPlaceholder: true,
  },
];

/** 일반 상업용 기구의 평균 설치 면적 — 비교 연출에 쓰는 기준값 */
export const TYPICAL_FOOTPRINT_M2 = 4.2;
