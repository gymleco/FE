"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { Product } from "@/lib/catalog";
import { formatPyeong } from "@/lib/area";

/**
 * 히어로 시안 B — 기구 한 대를 크게, 옆 기구는 살짝 걸치게.
 *
 * ── 원판을 없앤 것이 아니라 눕혔다 ──
 *
 * 기울어진 원판은 장식이 아니라 «바닥 면적» 이었다. 그 은유를 버리면
 * 이 사이트의 논지(자리를 얼마나 차지하는가)가 화면에서 사라진다.
 * 그래서 판은 남기되 바닥에 깔린 얇은 타원으로 눕혔다. 은유는 지키고
 * 세로 공간은 돌려받는다 — 정사각 원판이 세로를 다 먹어 기구가 작았다.
 *
 * ── 왜 scroll-snap 인가 ──
 *
 * 상태로 위치를 계산해 옮기면 관성·손가락 추적·튕김을 전부 직접 만들어야
 * 하고, 그렇게 만든 것은 대체로 브라우저 것보다 나쁘다. 제품 쇼케이스에서
 * 이미 쓰는 방식을 그대로 쓴다.
 *
 *   · 손가락으로 밀면 브라우저가 관성까지 처리한다
 *   · JS 가 죽어도 넘길 수 있다 — 최악이 «안 도는 목록» 이지 빈 화면이 아니다
 *   · 화살표는 scrollIntoView 를 부를 뿐이라 동작이 한 갈래다
 *
 * ── 옆 기구를 걸쳐 두는 이유 ──
 *
 * 「넘길 수 있다」 를 글로 안내하는 것보다, 옆에 반쯤 걸친 기구 하나가
 * 더 잘 말한다. 그래서 칸을 화면보다 좁게 잡아 좌우가 비어 보이게 했다.
 */
export function HeroStage({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.cutoutUrl).slice(0, 6);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    /*
     * ★ IntersectionObserver 의 임계값으로 «지금 어느 칸인가» 를 정하지 않는다.
     *   칸이 화면보다 좁아 여러 개가 동시에 보이는데, 화면 폭에 따라 두 칸이
     *   같이 임계값을 넘는다. 실제로 PC 에서 첫 칸이 아니라 두 번째 칸이
     *   선택된 채로 시작했다.
     *
     *   대신 «스크롤 가운데에 가장 가까운 칸» 을 고른다. 화면 폭이나 칸
     *   개수와 무관하게 답이 하나로 정해진다.
     */
    let raf = 0;
    const pick = () => {
      raf = 0;
      const slides = Array.from(el.querySelectorAll<HTMLElement>("[data-slide]"));

      /*
       * ★ offsetLeft 를 쓰면 안 된다.
       *   offsetLeft 는 «가장 가까운 배치 조상» 기준이다. 이 레일은 격자
       *   안에 있어서 그 조상이 격자 전체가 되고, 왼쪽 글 칸의 너비가
       *   그대로 섞여 들어온다. scrollLeft(레일 기준)와 더하면 답이 어긋난다.
       *   실제로 PC 에서 화살표를 눌러도 제목이 안 바뀌었다.
       *
       *   화면 좌표로 재면 조상이 무엇이든 상관없다.
       */
      const box = el.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      let best = 0;
      let bestGap = Infinity;
      slides.forEach((s, i) => {
        const b = s.getBoundingClientRect();
        const gap = Math.abs(b.left + b.width / 2 - mid);
        if (gap < bestGap) { bestGap = gap; best = i; }
      });
      setActive(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };

    pick();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (items.length === 0) return null;
  const p = items[active] ?? items[0];

  /** 화살표 — 위치를 직접 계산하지 않고 그 칸으로 스크롤만 시킨다 */
  const go = (d: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const next = Math.min(Math.max(active + d, 0), items.length - 1);
    el.querySelectorAll<HTMLElement>("[data-slide]")[next]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden">
      {/*
        세로 띠.

        ★ -z-10 을 쓰면 안 된다. 페이지 배경보다 뒤로 밀려 아예 안 보인다.
          실제로 그렇게 뒀다가 「띠가 없는 화면」 을 한참 봤다.

        위아래로 끝까지 세운다. 화면을 다 덮는 히어로라 띠도 같이 흘러야
        «뒤에 선 판» 으로 읽힌다 — 중간에서 끊기면 그냥 네모가 된다.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[8%] z-0 w-[46%] bg-[image:var(--hero-band)] lg:right-[22%] lg:w-[20%]"
      />

      <div className="relative z-10 grid items-center gap-5 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-8">
        {/* 글 — DOM 에서 먼저. JS 없이도 읽는 순서가 맞는다 */}
        <div className="order-2 px-6 md:px-12 lg:order-1">
          <p className="font-display text-[0.68rem] tracking-[0.25em] text-accent uppercase">
            Born in Sweden
          </p>

          {/*
            기구가 바뀌면 글도 바뀐다. 화면을 읽어 주는 사람에게도 알린다 —
            바뀐 것을 못 보고 지나가면 넘긴 의미가 없다.
          */}
          <div aria-live="polite">
            <h1 className="mt-3 text-[clamp(1.9rem,5.5vw,3.4rem)] leading-[1.12] font-bold tracking-tight text-balance text-ink-100">
              {p.nameKo}
            </h1>
            <p className="font-display mt-1 text-sm tracking-[0.18em] text-ink-400 uppercase">
              {p.nameEn}
            </p>
            <p className="mt-4 max-w-md text-pretty text-ink-300 md:text-lg">
              {p.summary}
            </p>
            {p.footprintM2 != null && (
              <p className="tabular font-display mt-5 inline-flex items-baseline gap-2 border-l-2 border-accent pl-3 text-lg font-bold text-ink-100">
                설치 면적 {p.footprintM2}m²
                <span className="text-sm font-normal text-ink-300">
                  {formatPyeong(p.footprintM2)}
                </span>
              </p>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/contact?type=DEMO"
              className="rounded-full bg-signal px-6 py-3 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
            >
              무료 시연 신청
            </Link>
            <Link
              href={`/products/${p.slug}`}
              className="rounded-full border border-hairline px-6 py-3 text-sm font-semibold text-ink-100 transition-colors hover:border-ink-300"
            >
              이 기구 자세히
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 lg:mt-8">
            <span className="tabular font-display text-sm text-ink-400">
              <b className="text-ink-100">{String(active + 1).padStart(2, "0")}</b>
              <span className="mx-1.5 text-ink-600">/</span>
              {String(items.length).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              {([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => go(d)}
                  disabled={d === -1 ? active === 0 : active === items.length - 1}
                  aria-label={d === 1 ? "다음 기구" : "이전 기구"}
                  className="flex size-10 items-center justify-center rounded-full border border-hairline text-ink-300 transition-colors hover:border-accent hover:text-ink-100 disabled:opacity-35 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" aria-hidden="true"
                       className={d === -1 ? "rotate-180" : ""}>
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
            <span className="text-xs text-ink-400 lg:hidden">밀어서 넘겨 보세요</span>
          </div>
        </div>

        {/* 기구 레일 */}
        <div className="order-1 min-w-0 lg:order-2">
          <div
            ref={rail}
            role="group"
            aria-label="제품 라인업. 좌우로 밀어 넘길 수 있습니다."
            /*
              칸을 화면보다 좁게 잡아 좌우에 옆 기구가 걸치게 한다.

              ★ 레일에 패딩을 주지 않는다.
                칸 너비를 %로 주면 그 %가 «패딩을 뺀 안쪽» 을 기준으로 잡혀
                의도한 폭과 달라진다. 대신 빈 칸을 앞뒤에 하나씩 두어
                첫 칸과 끝 칸도 가운데 설 수 있게 한다.
            */
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          >
            {/* 첫 칸을 가운데 세우기 위한 빈 자리 */}
            <div aria-hidden="true" className="w-[11%] shrink-0 lg:w-[21%]" />
            {items.map((it, i) => (
              <div
                key={it.slug}
                data-slide
                className="flex w-[78%] shrink-0 snap-center items-end justify-center lg:w-[58%]"
              >
                <div className="relative flex w-full items-end justify-center">
                  {/* 눕힌 원판 — 「이 기구는 바닥의 이만큼을 쓴다」 */}
                  <div
                    aria-hidden="true"
                    className={`absolute bottom-0 left-1/2 h-[9%] w-[76%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,var(--color-accent)_0%,transparent_70%)] transition-opacity duration-500 ${
                      i === active ? "opacity-25" : "opacity-0"
                    }`}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.cutoutUrl}
                    srcSet={it.cutoutSrcSet}
                    sizes="(min-width: 1024px) 680px, 90vw"
                    alt={`${it.nameKo} 제품 사진`}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding={i === 0 ? "sync" : "async"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    draggable={false}
                    /*
                      ★ max-h 가 아니라 h 다.
                        max-h 는 상한일 뿐이라 원본(329px)보다 크게 만들지 못한다.
                        실제로 그렇게 뒀더니 원판 시안보다 작게 나왔다.

                      옆 기구는 흐리게·작게 둔다 — «있다» 는 것만 알리고
                      주인공을 빼앗지 않는다.
                    */
                    className={`relative h-[42svh] w-auto object-contain transition-[opacity,transform,filter] duration-500 [filter:var(--cutout-lift)] lg:h-[70svh] ${
                      i === active
                        ? "scale-100 opacity-100"
                        : "scale-90 opacity-35 blur-[1.5px]"
                    }`}
                  />
                </div>
              </div>
            ))}
            <div aria-hidden="true" className="w-[11%] shrink-0 lg:w-[21%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
