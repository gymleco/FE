/**
 * 메뉴 구조 — 헤더와 서랍이 같은 것을 본다.
 *
 * 두 곳에 따로 적어 두면 반드시 갈라진다. 실제로 예전 헤더에는 «소식» 이
 * 없고 푸터에는 있었다. 한 군데서만 고치게 둔다.
 *
 * ── 왜 세 덩어리인가 ──
 *
 * 페이지가 열넷이 되면서 한 줄에 늘어놓을 수 없게 됐다. 그런데 방문자가
 * 찾는 것은 «페이지» 가 아니라 세 가지 중 하나다.
 *
 *   상품     — 무엇을 파는가 (새것 · 중고 · 부품 · 악세사리)
 *   브랜드   — 믿을 만한가 (어떤 회사인가 · 어디에 깔려 있나 · 요즘 뭐 하나)
 *   고객센터 — 물어보고 싶다 (견적 · 시연 · 이미 나온 답 · 공지)
 *
 * 「견적 문의」와 「무료 시연 신청」은 같은 /contact 로 가지만 유형이
 * 미리 잡힌다. 방문자가 폼에서 유형을 고르는 단계를 하나 줄인다.
 */

export type NavItem = { href: string; label: string };
export type NavGroup = {
  label: string;
  /** 묶음 자체를 눌렀을 때 가는 곳. 하위에 없는 주소를 두지 않는다. */
  href: string;
  items: readonly NavItem[];
};

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "상품",
    href: "/products",
    items: [
      { href: "/products", label: "제품 라인업" },
      { href: "/used", label: "중고 기구" },
      { href: "/parts", label: "부품" },
      { href: "/accessories", label: "악세사리" },
    ],
  },
  {
    label: "브랜드",
    href: "/about",
    items: [
      { href: "/about", label: "About Gymleco" },
      { href: "/centers", label: "공식 헬스장" },
      { href: "/news", label: "소식" },
    ],
  },
  {
    label: "고객센터",
    href: "/contact",
    items: [
      { href: "/contact?type=QUOTE", label: "견적 문의" },
      { href: "/contact?type=DEMO", label: "무료 시연 신청" },
      /*
       * 정품 확인은 고객센터에 둔다.
       * 「상품」 아래가 아닌 이유는, 이 화면을 찾는 사람은 무엇을 살지
       * 고르는 중이 아니라 «이미 눈앞에 있는 기구» 를 의심하는 중이기
       * 때문이다. 중고 거래 현장에서 폰으로 여는 화면이다.
       */
      { href: "/verify", label: "정품 확인" },
      { href: "/support/faq", label: "자주 묻는 질문" },
      { href: "/support/notice", label: "공지사항" },
      { href: "/privacy", label: "개인정보처리방침" },
    ],
  },
] as const;

/** "/contact?type=QUOTE" → "/contact". 지금 어느 묶음에 있는지 볼 때 쓴다. */
export function pathOf(href: string): string {
  return href.split("?")[0];
}
