/**
 * 화면에 나가는 말.
 *
 * ★ 전문용어를 화면에 두지 않는다 (README «만들 때 지킬 것»).
 *   이 화면은 개발자가 아니라 대표님이 쓴다. "슬러그", "키", "엔티티" 같은
 *   말이 보이면 그 자리에서 멈추게 된다. 서버가 slug 라고 부르는 값도
 *   화면에서는 «사이트 주소»다.
 *
 * ★ 서버 열거값을 화면에 하드코딩하지 않고 여기 한 곳에서만 번역한다.
 *   값이 늘면 여기만 고치면 된다.
 */

export const PRODUCT_TYPE: Record<string, string> = {
  EQUIPMENT: "기구",
  PART: "부품",
  ACCESSORY: "악세사리",
};

export const PRODUCT_CATEGORY: Record<string, string> = {
  STRENGTH: "머신",
  CABLE: "케이블",
  RACK: "랙",
  BENCH: "벤치",
  CARDIO: "유산소",
  PART: "부품",
  ACCESSORY: "악세사리",
};

export const USED_CONDITION: Record<string, string> = {
  A: "상급 — 사용감이 거의 없음",
  B: "중급 — 사용감은 있으나 작동 이상 없음",
  C: "하급 — 외관 손상 있음, 정비 후 출고",
};

export const USED_CONDITION_SHORT: Record<string, string> = {
  A: "상급",
  B: "중급",
  C: "하급",
};

export const USED_STATUS: Record<string, string> = {
  AVAILABLE: "판매중",
  RESERVED: "예약중",
  SOLD: "판매완료",
};

/** 알 수 없는 값이 와도 화면이 비지 않게 원본을 그대로 보여 준다 */
export function label(map: Record<string, string>, value: string | null | undefined) {
  if (!value) return "—";
  return map[value] ?? value;
}

export function options(map: Record<string, string>) {
  return Object.entries(map).map(([value, text]) => ({ value, text }));
}

/**
 * 서버가 주는 필드 경로를 화면의 칸 이름으로 맞춘다.
 *
 * 중첩 요청이라 오류가 "product.nameKo" · "item.priceKrw" 로 내려온다.
 * 폼은 "nameKo" 로 알고 있으므로 앞의 묶음 이름을 떼어 낸다.
 * 다만 "slug" 처럼 바깥에 있는 칸은 그대로 둔다.
 */
export function normalizeFieldErrors(
  fields: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, message] of Object.entries(fields)) {
    const dot = path.lastIndexOf(".");
    out[dot < 0 ? path : path.slice(dot + 1)] = message;
  }
  return out;
}

/** 1평 = 400/121 m². 대표님은 평으로 생각하시니 같이 적는다. */
const M2_PER_PYEONG = 400 / 121;

export function toPyeong(m2: number | string | null | undefined): string {
  const v = typeof m2 === "string" ? Number(m2) : m2;
  if (v == null || Number.isNaN(v) || v <= 0) return "";
  const p = v / M2_PER_PYEONG;
  return p >= 10 ? `${Math.round(p)}평` : `${p.toFixed(1)}평`;
}

export function won(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toLocaleString("ko-KR")}원`;
}

export function whenKo(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
