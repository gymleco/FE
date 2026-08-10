import Link from "next/link";

/**
 * 상시 노출 문의 버튼 (기획서 §3.4-4).
 *
 * 이 사이트의 목표 행동은 장바구니가 아니라 문의다.
 * 어떤 화면을 보고 있든 문의로 가는 길이 열려 있어야 한다.
 *
 * /contact 에서는 렌더하지 않는다 — 이미 그 화면에 있다.
 */
export function FloatingCta({ label = "견적 · 무료 시연 문의" }: { label?: string }) {
  return (
    <Link
      href="/contact"
      className="fixed right-5 bottom-5 z-40 rounded-full bg-signal px-5 py-3 text-sm font-bold text-signal-ink shadow-lg transition-colors hover:bg-signal-hover md:right-8 md:bottom-8"
    >
      {label}
    </Link>
  );
}
