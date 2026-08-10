"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * 관성 스크롤 (Lenis) + GSAP ScrollTrigger 동기화.
 *
 * Lenis 가 스크롤 위치를 직접 제어하므로, ScrollTrigger 에게
 * "스크롤이 움직였다"고 알려주지 않으면 두 시스템이 어긋난다.
 * 핀 고정 구간이 밀리거나 떨리는 증상의 원인이 대개 이것이다.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // 모션 최소화를 요청한 사용자에게는 관성 스크롤을 붙이지 않는다.
    // 부드러운 스크롤 자체가 전정기관에 부담을 줄 수 있다.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      // 터치는 네이티브 스크롤이 더 자연스럽고 모바일 성능에도 유리하다.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
