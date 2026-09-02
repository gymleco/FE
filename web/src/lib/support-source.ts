import "server-only";

/**
 * 고객센터 데이터 — FAQ · 공지사항
 *
 * 제품과 같은 규칙을 따른다. API 가 붙어 있으면 실데이터, 없으면 폴백.
 * 다만 여기서는 폴백이 "샘플"이 아니라 **실제로 쓸 초안**이다 —
 * FAQ 는 대표님이 고르실 문장을 미리 적어 두는 편이 빠르고,
 * 비어 있는 FAQ 페이지는 없는 것만 못하다.
 */

export type Faq = {
  id: number;
  category: string;
  question: string;
  answer: string;
};

export type Notice = {
  id: number;
  title: string;
  body?: string;
  pinned: boolean;
  publishedAt: string | null;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

async function get<T>(path: string, tag: string): Promise<T | null> {
  if (!API) return null;
  try {
    const res = await fetch(`${API}${path}`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300, tags: [tag] },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // API 가 잠깐 죽어도 페이지 생성이 통째로 실패하지 않게 한다
    return null;
  }
}

/* ── 초안 ─────────────────────────────────────────────────────
   대표님이 문장을 손보시면 그대로 관리 화면에 넣으면 된다.
   실제 등록이 하나라도 있으면 이 목록은 쓰이지 않는다. */
const DRAFT_FAQ: Faq[] = [
  {
    id: -1,
    category: "구매",
    question: "가격이 화면에 안 나오는 이유가 있나요?",
    answer:
      "기구는 배송과 설치 비용이 건물 조건에 따라 달라집니다. 층수, 엘리베이터 유무, 진입로 폭에 따라 같은 기구도 비용이 달라져 화면에 하나의 값을 적을 수 없습니다. 공간을 알려주시면 배치안과 함께 견적을 보내 드립니다.",
  },
  {
    id: -2,
    category: "구매",
    question: "무료 시연은 어떻게 진행되나요?",
    answer:
      "문의 주시면 일정을 잡아 직접 방문해 기구를 보여 드립니다. 실제로 들어 보시고 결정하시는 편이 확실합니다.",
  },
  {
    id: -3,
    category: "배송·설치",
    question: "설치까지 해 주시나요?",
    answer:
      "네. 배송과 설치를 함께 진행합니다. 설치 후 작동 확인까지 마치고 인계해 드립니다.",
  },
  {
    id: -4,
    category: "배송·설치",
    question: "지하나 2층에도 들어갈 수 있나요?",
    answer:
      "대부분 가능합니다. 다만 진입로와 천장 높이에 따라 분해 반입이 필요할 수 있어, 문의 시 건물 조건을 함께 알려주시면 미리 확인해 드립니다.",
  },
  {
    id: -5,
    category: "중고",
    question: "중고 기구의 상태 등급은 어떤 기준인가요?",
    answer:
      "A는 사용감이 거의 없는 상태, B는 사용감은 있으나 작동에 문제가 없는 상태, C는 외관 손상이 있으며 정비 후 출고되는 상태입니다. 모든 매물은 인수 후 점검을 거치고, 교체한 소모품 내역을 함께 안내드립니다.",
  },
  {
    id: -6,
    category: "사후관리",
    question: "고장 나면 부품을 구할 수 있나요?",
    answer:
      "본사 직영이라 부품 조달 경로가 짧습니다. 소모품은 규격품을 쓰기 때문에 교체가 어렵지 않고, 부품만 따로 주문하실 수도 있습니다.",
  },
];

export async function getFaqs(): Promise<{ items: Faq[]; isDraft: boolean }> {
  const data = await get<{ items: Faq[] }>("/api/public/support/faq", "faq");
  if (data && data.items.length > 0) {
    return { items: data.items, isDraft: false };
  }
  return { items: DRAFT_FAQ, isDraft: true };
}

export async function getNotices(): Promise<Notice[]> {
  const data = await get<{ items: Notice[] }>(
    "/api/public/support/notice",
    "notice",
  );
  /*
   * 공지는 초안을 두지 않는다.
   * FAQ 와 달리 공지는 "지금 알릴 것이 있는가" 의 문제라,
   * 없는데 지어내면 거짓말이 된다. 비어 있으면 비어 있다고 말한다.
   */
  return data?.items ?? [];
}

export async function getNotice(id: number): Promise<Notice | null> {
  return get<Notice>(`/api/public/support/notice/${id}`, `notice:${id}`);
}
