import type Lenis from "lenis";

/**
 * 코드로 스크롤을 옮길 때 쓰는 통로.
 *
 * 관성 스크롤(Lenis)이 켜져 있는 동안 window.scrollTo 로 위치를 직접 옮기면
 * Lenis 가 기억하는 위치와 실제 위치가 어긋날 수 있다. 그래서 Lenis 가
 * 떠 있으면 Lenis 에게 시키고, 없으면(모션 최소화 설정 · 아직 뜨기 전)
 * 브라우저에 맡긴다.
 *
 * SmoothScroll 이 뜰 때 등록하고, 내려갈 때 지운다.
 */
let current: Lenis | null = null;

export function registerLenis(lenis: Lenis | null) {
  current = lenis;
}

export function scrollToTop() {
  if (current) {
    current.scrollTo(0);
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}
