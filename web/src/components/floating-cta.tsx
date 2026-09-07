"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * 상시 노출 문의 버튼 (기획서 §3.4-4).
 *
 * 이 사이트의 목표 행동은 장바구니가 아니라 문의다.
 * 어떤 화면을 보고 있든 문의로 가는 길이 열려 있어야 한다.
 *
 * /contact 에서는 렌더하지 않는다 — 이미 그 화면에 있다.
 *
 * ── 진짜 버튼이 보이면 비킨다 ──
 *
 * 이 버튼이 한 번도 숨지 않으면 두 곳에서 부딪힌다. 첫 화면에서는 원판 아래
 * 제품 설명 위에 겹치고, 마지막 CTA 구역에서는 바로 위에 «견적 문의하기» 가
 * 있는데 그 아래 또 하나가 떠 있다. 헤더의 «문의» 까지 세면 닫는 화면에
 * 문의 버튼이 넷이다. 어느 것을 눌러야 할지 알려주지 않으면 아무것도 안 누른다.
 *
 * 그래서 data-cta-anchor 가 붙은 구역이 화면에 들어오면 조용히 물러난다.
 * 사라지는 것이 아니라 «양보» 다 — 그 자리에 더 큰 버튼이 이미 있다.
 *
 * ★ 히어로에는 표시를 달지 않는다
 *   메인의 히어로는 sticky 라 스크롤해도 뒤에 남아 있다. 거기 표시를 달면
 *   화면을 영영 벗어나지 않아 이 버튼이 페이지 내내 숨는다. 실제로 그렇게
 *   만들어 보고 확인했다.
 *
 * ── 왜 스크롤 이벤트가 아니라 IntersectionObserver 인가 ──
 *
 * 스크롤 이벤트는 초당 수십 번 발화하고 그때마다 위치를 재는 코드가 돈다.
 * 이 화면은 GSAP 스크럽 연출이 이미 매 프레임 도는 중이라 거기에 얹으면
 * 스크롤이 눈에 띄게 무거워진다. 관찰자는 브라우저가 대신 봐 준다.
 */
export function FloatingCta({ label = "견적 · 무료 시연 문의" }: { label?: string }) {
  const [yielded, setYielded] = useState(false);
  const seen = useRef(new Set<Element>());

  useEffect(() => {
    const anchors = document.querySelectorAll("[data-cta-anchor]");
    if (anchors.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.current.add(e.target);
          else seen.current.delete(e.target);
        }
        setYielded(seen.current.size > 0);
      },
      // 살짝 들어오기만 해도 양보한다. 겹쳐 보이기 시작하는 순간이 그때다.
      { threshold: 0.25 },
    );

    anchors.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <Link
      href="/contact"
      aria-hidden={yielded}
      tabIndex={yielded ? -1 : undefined}
      className={`fixed right-5 bottom-5 z-40 rounded-full bg-signal px-5 py-3 text-sm font-bold text-signal-ink shadow-lg transition-[opacity,transform] duration-300 hover:bg-signal-hover md:right-8 md:bottom-8 ${
        yielded
          ? "pointer-events-none translate-y-3 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {label}
    </Link>
  );
}
