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

export const INQUIRY_STATUS: Record<string, string> = {
  NEW: "신규",
  CONTACTING: "연락중",
  DONE: "완료",
  SPAM: "스팸",
};

/**
 * 메인의 고정 구역 사진.
 *
 * ★ 이 목록이 공개 사이트와 맺은 약속이다.
 *   구역 자체는 코드에 박혀 있고 사진만 바뀌는 자리라 (V7 마이그레이션 주석),
 *   키를 자유롭게 입력받으면 오타 하나로 사진이 어디에도 안 뜬다.
 *   그래서 화면은 정해진 칸만 보여 준다.
 *   구역을 늘리려면 여기와 공개 사이트를 «같이» 고친다.
 *
 * 목록에 없는 키가 DB 에 있으면 그것도 화면에 함께 띄운다 —
 * 모르는 값이라고 감추면 이미 올려 둔 사진이 관리 화면에서 사라진다.
 */
export const SECTION_MEDIA: { key: string; label: string; where: string }[] = [
  { key: "home.statement", label: "브랜드 문장", where: "메인 — 첫 화면 다음에 오는 문장 구역" },
  { key: "home.trust", label: "왜 짐레코인가", where: "메인 — 신뢰 구간 배경" },
  { key: "home.cta", label: "문의 유도", where: "메인 — 맨 아래 «공간을 알려주시면» 배경" },
  { key: "about.hero", label: "브랜드 소개 첫 화면", where: "브랜드 페이지 맨 위" },
  { key: "contact.hero", label: "문의 첫 화면", where: "문의 페이지 맨 위" },
];

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

/**
 * 전화번호에 하이픈을 넣어 준다.
 *
 * 서버는 숫자만 남겨 저장한다 (PhoneNumbers.normalize) — 검색용 블라인드
 * 인덱스를 같은 모양으로 만들어야 하기 때문이다. 화면에서까지
 * «01011112222» 로 보이면 전화기에 옮겨 적다 한 자리를 빠뜨린다.
 * 모양이 안 맞는 값은 손대지 않고 그대로 보여 준다 — 임의로 잘라
 * 붙이면 틀린 번호를 정확한 번호처럼 보이게 만든다.
 */
export function phoneKo(raw: string | null | undefined): string {
  if (!raw) return "";
  const d = raw.replace(/[^0-9]/g, "");
  if (d !== raw.replace(/-/g, "")) return raw; // +82 처럼 숫자 아닌 것이 섞여 있으면 그대로

  if (d.startsWith("02")) {
    if (d.length === 10) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
    if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return raw;
  }
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return raw;
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

/* ── 날짜 칸 ──────────────────────────────────────────────
   화면은 어디서나 한국 시각으로 말한다.

   <input type="datetime-local"> 은 브라우저가 있는 지역의 시각으로
   읽고 쓴다. 그대로 두면 whenKo 가 «22:00» 이라고 적어 둔 것을 칸에서는
   «14:00» 으로 고치게 되어, 같은 화면의 두 자리가 서로 다른 말을 한다.
   한국 표준시는 서머타임이 없어 늘 +09:00 이므로 고정 오프셋으로 맞춘다.
   ──────────────────────────────────────────────────────── */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** ISO 순간값 → 칸이 읽는 «YYYY-MM-DDTHH:mm» (한국 시각) */
export function toDatetimeInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  return new Date(t + KST_OFFSET_MS).toISOString().slice(0, 16);
}

/** 칸의 값 → ISO 순간값. 비어 있으면 «지정 안 함» 이라 null 이다 */
export function fromDatetimeInput(value: string): string | null {
  if (!value) return null;
  const t = Date.parse(`${value}:00+09:00`);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

/** 오늘로부터 며칠 전 (음수면 미래) 의 «YYYY-MM-DD», 한국 날짜 기준 */
export function dateInputDaysAgo(days: number): string {
  const t = Date.now() + KST_OFFSET_MS - days * 24 * 60 * 60 * 1000;
  return new Date(t).toISOString().slice(0, 10);
}
