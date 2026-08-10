"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { CATEGORY_LABEL, equipment } from "@/lib/catalog";
import { FootprintDiagram } from "@/components/footprint-diagram";

/**
 * 제품 라인업 시퀀스 — 메인의 20~70% 구간 (기획서 §3.1)
 *
 * ── 지켜야 할 제약 (§3.4) ────────────────────────────────────
 *
 * 1. JS 없이도 읽혀야 한다
 *    패널은 기본적으로 일반 흐름(세로 스택)에 놓인다. 겹치는 것은
 *    데스크톱에서 GSAP 이 켜질 때 data-showcase="pinned" 가 붙으면서다.
 *    JS 가 실패해도, 크롤러가 와도, 모션을 껐어도 내용이 그대로 남는다.
 *
 * 2. 모바일은 가벼운 대체 연출
 *    핀 고정도 스크럽도 하지 않는다. 인스타 유입이 많아 모바일이 주
 *    트래픽일 가능성이 높은데, 스크럽은 중급 안드로이드에서 버벅인다.
 *
 * 3. prefers-reduced-motion 이면 아무것도 하지 않는다
 *    정적 레이아웃이 이미 완성돼 있으므로 GSAP 을 건너뛰면 그만이다.
 */
export function ProductShowcase() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const panels = gsap.utils.toArray<HTMLElement>(
        ".showcase-panel",
        root.current,
      );
      if (panels.length === 0) return;

      const counter =
        root.current?.querySelector<HTMLElement>("[data-showcase-index]") ??
        null;

      const mm = gsap.matchMedia();

      /* ── 데스크톱: 핀 고정 + 스크럽 ───────────────────────── */
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const stageEl = stage.current;
          // 패널을 겹치도록 전환. CSS 는 globals.css 에 있다.
          // 측정 전에 레이아웃을 바꿔야 ScrollTrigger 가 올바른 높이를 잡는다.
          stageEl?.setAttribute("data-showcase", "pinned");

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stage.current,
              start: "top top",
              // 제품 한 대당 화면 한 칸씩 스크롤을 배정한다.
              end: () => `+=${panels.length * window.innerHeight}`,
              pin: true,
              // 되감으면 역재생된다 (§3.1)
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (!counter) return;
                const index = Math.min(
                  panels.length - 1,
                  Math.round(self.progress * (panels.length - 1)),
                );
                counter.textContent = String(index + 1).padStart(2, "0");
              },
            },
          });

          panels.forEach((panel, i) => {
            if (i === 0) return;
            tl.to(
              panels[i - 1],
              {
                autoAlpha: 0,
                scale: 1.04,
                yPercent: -5,
                ease: "power2.in",
                duration: 0.5,
              },
              i - 1,
            ).fromTo(
              panel,
              { autoAlpha: 0, scale: 0.94, yPercent: 5 },
              {
                autoAlpha: 1,
                scale: 1,
                yPercent: 0,
                ease: "power2.out",
                duration: 0.5,
                // 초기 상태는 아래에서 명시적으로 건다.
                immediateRender: false,
              },
              i - 1 + 0.25,
            );
          });

          /*
           * 숨기는 것은 타임라인이 만들어진 뒤에 한다.
           * 위에서 예외가 나면 아무것도 숨겨지지 않은 채로 남는데,
           * 그게 이 사이트에서 옳은 실패 방향이다 —
           * 안 보이는 제품 목록보다 애니메이션 없는 제품 목록이 낫다.
           */
          gsap.set(panels.slice(1), { autoAlpha: 0 });

          return () => {
            stageEl?.removeAttribute("data-showcase");
            gsap.set(panels, { clearProps: "all" });
          };
        },
      );

      /* ── 모바일: 카드가 순서대로 떠오르기만 한다 ──────────── */
      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          /*
           * 이미 화면 안에 들어와 있는 패널은 건드리지 않는다.
           *
           * gsap.from 은 요소를 먼저 숨기고 트리거가 살려주기를 기다린다.
           * 트리거가 어떤 이유로든 발화하지 않으면 콘텐츠가 영영 보이지
           * 않는다. 실제로 breakpoint 를 넘나들 때 이 상태가 재현됐다.
           * 화면 밖에 있는 것만 연출 대상으로 삼아 그 위험을 없앤다.
           */
          const targets = panels.filter(
            (panel) =>
              panel.getBoundingClientRect().top > window.innerHeight * 0.9,
          );

          targets.forEach((panel) => {
            gsap.fromTo(
              panel,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 85%",
                  once: true,
                },
              },
            );
          });

          return () => {
            if (targets.length > 0) {
              gsap.set(targets, { clearProps: "all" });
            }
          };
        },
      );

      /*
       * 측정을 명시적으로 다시 잡는다.
       *
       * 이 컴포넌트는 setup 중에 레이아웃을 직접 바꾼다 —
       * data-showcase="pinned" 가 붙으면 패널이 position:absolute 로
       * 빠지면서 문서 높이가 통째로 달라진다. ScrollTrigger 가 그 전에
       * 측정했다면 핀 구간의 스크롤 거리가 어긋난다.
       *
       * rAF 를 한 프레임 기다리는 것은 브라우저가 새 레이아웃을 적용한
       * 뒤에 재보기 위해서다.
       */
      const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(refreshId);
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="lineup-heading"
      className="relative border-t border-hairline"
    >
      <div
        ref={stage}
        className="showcase-stage relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 py-20 md:px-12"
      >
        <h2 id="lineup-heading" className="sr-only">
          제품 라인업
        </h2>

        {/* 진행 표시 — 긴 핀 구간에서 "어디까지 왔는지"를 알려준다 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-8 right-6 hidden font-display text-xs tracking-[0.3em] text-ink-400 md:right-12 md:block"
        >
          <span data-showcase-index className="text-ink-100">
            01
          </span>
          <span className="mx-1">/</span>
          <span>{String(equipment.length).padStart(2, "0")}</span>
        </div>

        {equipment.map((product) => (
          <article
            key={product.slug}
            className="showcase-panel flex flex-col justify-center gap-10 border-b border-hairline py-16 last:border-b-0 md:grid md:grid-cols-2 md:items-center md:gap-16 md:border-b-0 md:px-12 md:py-0"
          >
            {/* ── 텍스트 ── */}
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-3">
                <span className="font-display text-[0.65rem] tracking-[0.28em] text-signal uppercase">
                  {CATEGORY_LABEL[product.category]}
                </span>
                {product.isPlaceholder && (
                  <span className="rounded-xs border border-ink-600 px-1.5 py-0.5 text-[0.65rem] text-ink-400">
                    샘플 데이터
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-[clamp(1.9rem,4.5vw,3.25rem)] leading-[1.1] font-bold tracking-tight text-ink-100">
                {product.nameKo}
              </h3>
              <p className="font-display mt-1 text-sm tracking-[0.2em] text-ink-400 uppercase">
                {product.nameEn}
              </p>

              <p className="mt-6 max-w-md text-pretty text-ink-300 md:text-lg">
                {product.summary}
              </p>

              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <dt className="text-xs tracking-wider text-ink-400">
                    설치 면적
                  </dt>
                  <dd className="tabular font-display mt-1 text-2xl font-bold text-signal">
                    {product.footprintM2}
                    <span className="ml-0.5 text-base">m²</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wider text-ink-400">
                    가로 × 세로 × 높이
                  </dt>
                  <dd className="tabular mt-1 text-ink-100">
                    {product.widthMm} × {product.depthMm} × {product.heightMm}
                    <span className="ml-1 text-ink-400">mm</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wider text-ink-400">중량</dt>
                  <dd className="tabular mt-1 text-ink-100">
                    {product.weightKg}
                    <span className="ml-1 text-ink-400">kg</span>
                  </dd>
                </div>
              </dl>

              <Link
                href={`/products/${product.slug}`}
                className="mt-8 inline-flex items-center gap-2 border-b border-ink-600 pb-1 text-sm font-medium text-ink-100 transition-colors hover:border-signal hover:text-signal"
              >
                제품 자세히 보기
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* ── 시각 자료 ── */}
            <div className="order-1 md:order-2">
              <FootprintDiagram
                nameKo={product.nameKo}
                footprintM2={product.footprintM2!}
                widthMm={product.widthMm!}
                depthMm={product.depthMm!}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
