/**
 * 짐레코 공식 헬스장 (오피셜 센터)
 *
 * ⚠️ 게재 동의를 받은 센터만 노출한다.
 *    소규모 센터의 상호·주소·연락처는 개인정보에 해당할 수 있다.
 *    DB 에서도 동의 없이 visible=true 가 될 수 없도록 CHECK 제약을 걸었다.
 *
 * ⚠️ 자리표시자 데이터. 실제 센터가 아니다.
 */

export interface OfficialCenter {
  slug: string;
  name: string;
  region: string;
  address: string;
  summary: string;
  areaPyeong?: number;
  openedAt?: string;
  phone?: string;
  instagramUrl?: string;
  /** 도입한 대표 기구 slug */
  equipmentSlugs: string[];
  imageUrl?: string;
  isPlaceholder?: boolean;
}

export const REGIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "강원",
  "충청",
  "전라",
  "경상",
  "제주",
] as const;

export const officialCenters: OfficialCenter[] = [
  {
    slug: "sample-center-seoul-1",
    name: "○○ 피트니스 강남점",
    region: "서울",
    address: "서울 강남구 —",
    summary: "40평 규모. 프리웨이트 중심 구성.",
    areaPyeong: 40,
    openedAt: "2024-03",
    equipmentSlugs: ["power-rack", "adjustable-bench", "cable-crossover"],
    isPlaceholder: true,
  },
  {
    slug: "sample-center-gyeonggi-1",
    name: "△△ 짐 수원점",
    region: "경기",
    address: "경기 수원시 —",
    summary: "25평 피티샵. 공간 절약형 라인업으로 구성.",
    areaPyeong: 25,
    openedAt: "2024-09",
    equipmentSlugs: ["smith-machine", "lat-pulldown", "adjustable-bench"],
    isPlaceholder: true,
  },
  {
    slug: "sample-center-busan-1",
    name: "□□ 스튜디오 해운대점",
    region: "부산",
    address: "부산 해운대구 —",
    summary: "지하 1층. 천장 높이 2.4m 제약을 레그 프레스 각도로 해결.",
    areaPyeong: 32,
    openedAt: "2025-01",
    equipmentSlugs: ["leg-press", "power-rack"],
    isPlaceholder: true,
  },
];

export const centersByRegion = officialCenters.reduce<
  Record<string, OfficialCenter[]>
>((acc, center) => {
  (acc[center.region] ??= []).push(center);
  return acc;
}, {});
