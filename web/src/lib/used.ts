/**
 * 중고 매물
 *
 * 카탈로그가 아니라 개별 물건이다.
 * 같은 파워 랙이라도 2019년식과 2022년식은 다른 매물이고,
 * 하나가 팔려도 다른 하나는 남는다.
 *
 * ⚠️ 자리표시자 데이터. 실제 매물이 아니다.
 */

export type ConditionGrade = "A" | "B" | "C";
export type UsedStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export interface UsedItem {
  slug: string;
  nameKo: string;
  /** 카탈로그 제품 slug. 단종 모델이면 없다. */
  productSlug?: string;
  modelName: string;
  conditionGrade: ConditionGrade;
  yearMade?: number;
  /** 없으면 "가격 문의"로 표시한다 */
  priceKrw?: number;
  quantity: number;
  status: UsedStatus;
  description: string;
  imageUrl?: string;
  isPlaceholder?: boolean;
}

export const CONDITION_LABEL: Record<ConditionGrade, string> = {
  A: "상급",
  B: "중급",
  C: "하급",
};

export const CONDITION_DESC: Record<ConditionGrade, string> = {
  A: "사용감이 거의 없고 기능·외관 모두 양호합니다.",
  B: "생활 스크래치가 있으나 기능에는 문제가 없습니다.",
  C: "외관 손상이 있습니다. 기능 확인 후 판매합니다.",
};

export const STATUS_LABEL: Record<UsedStatus, string> = {
  AVAILABLE: "판매중",
  RESERVED: "예약중",
  SOLD: "판매완료",
};

export const usedItems: UsedItem[] = [
  {
    slug: "used-power-rack-01",
    nameKo: "파워 랙",
    productSlug: "power-rack",
    modelName: "Power Rack",
    conditionGrade: "A",
    yearMade: 2021,
    quantity: 1,
    status: "AVAILABLE",
    description:
      "센터 리뉴얼로 나온 물건입니다. 프레임 도장 상태 양호, 세이프티 바 정상. 실사용 2년.",
    isPlaceholder: true,
  },
  {
    slug: "used-lat-pulldown-01",
    nameKo: "랫 풀다운",
    productSlug: "lat-pulldown",
    modelName: "Lat Pulldown",
    conditionGrade: "B",
    yearMade: 2019,
    quantity: 2,
    status: "AVAILABLE",
    description:
      "시트 커버에 생활 스크래치가 있습니다. 케이블·도르래는 교체 완료했습니다.",
    isPlaceholder: true,
  },
  {
    slug: "used-adjustable-bench-01",
    nameKo: "어저스터블 벤치",
    productSlug: "adjustable-bench",
    modelName: "Adjustable Bench",
    conditionGrade: "A",
    yearMade: 2022,
    quantity: 4,
    status: "AVAILABLE",
    description: "동일 상태 4대. 패드 교체 완료.",
    isPlaceholder: true,
  },
  {
    slug: "used-smith-machine-01",
    nameKo: "스미스 머신",
    productSlug: "smith-machine",
    modelName: "Smith Machine",
    conditionGrade: "B",
    yearMade: 2018,
    quantity: 1,
    status: "RESERVED",
    description: "예약 확정 대기 중입니다. 취소 시 다시 판매합니다.",
    isPlaceholder: true,
  },
  {
    slug: "used-leg-press-01",
    nameKo: "레그 프레스",
    productSlug: "leg-press",
    modelName: "Leg Press",
    conditionGrade: "A",
    yearMade: 2020,
    quantity: 1,
    status: "SOLD",
    description: "판매 완료된 매물입니다.",
    isPlaceholder: true,
  },
];

/** 판매중 → 예약중 → 판매완료 순. 팔린 것도 목록에 남긴다. */
const STATUS_ORDER: Record<UsedStatus, number> = {
  AVAILABLE: 0,
  RESERVED: 1,
  SOLD: 2,
};

export const sortedUsedItems = [...usedItems].sort(
  (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
);

export const availableCount = usedItems.filter(
  (i) => i.status === "AVAILABLE",
).length;
