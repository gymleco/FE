"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { CATEGORY_LABEL, type Product } from "@/lib/catalog";
import { formatPyeong } from "@/lib/area";
import { ProductMedia } from "@/components/product-media";
import { TYPICAL_FOOTPRINT_M2 } from "@/lib/catalog";

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
export function ProductShowcase({ products }: { products: Product[] }) {
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

          /*
           * 면적 사각형이 "앞 제품에서 자라거나 줄어든다".
           *
           * 두 패널의 다이어그램은 같은 축척으로 그려져 있으므로,
           * 들어오는 사각형을 (앞 면적 / 이 면적) 배에서 1 로 되돌리면
           * 앞 제품의 크기에서 출발해 제 크기로 변하는 것처럼 보인다.
           * 사각형을 새로 그리지 않고 이미 있는 것을 스케일만 바꾼다.
           */
          const areaOf = (i: number) => products[i]?.footprintM2 ?? 0;

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

            const cur = areaOf(i);
            const prev = areaOf(i - 1);
            if (!cur || !prev) return;

            // 사각형은 면적비의 제곱근만큼 커지고 작아진다 (넓이 ∝ 변²)
            const from = Math.sqrt(prev / cur);
            const rect = panel.querySelector<SVGRectElement>("[data-fp-rect]");
            if (rect) {
              tl.fromTo(
                rect,
                { scaleX: from, scaleY: from },
                {
                  scaleX: 1,
                  scaleY: 1,
                  ease: "power2.out",
                  duration: 0.55,
                  immediateRender: false,
                },
                i - 1 + 0.25,
              );
            }

            /*
             * 숫자를 굴리지 않는다.
             *
             * 앞 제품 값에서 굴러오는 연출이었는데, 그 값을 textContent 로
             * 직접 쓰는 방식이라 GSAP 이 되돌리지 못한다. 창을 줄여 모바일
             * 폭이 되면 matchMedia 가 애니메이션을 걷어 가지만 글자는 그
             * 자리에 굳어, 레그 프레스가 «3.4m² 1.0평 −19%» 여야 하는데
             * «2.4m² 1.0평 −19%» 로 남았다. 세 값이 서로 모순인 채로.
             *
             * 이 사이트가 파는 것이 «면적이 정확하다» 는 신뢰다.
             * 굴러가는 숫자로 얻는 것보다 틀린 숫자로 잃는 것이 크다.
             */
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

  /*
   * 모바일에서 «지금 몇 번째인지» 를 센다.
   *
   * 스크롤 위치를 매 프레임 재지 않고 관찰자에게 맡긴다 — 이 화면은 이미
   * GSAP 이 매 프레임 도는 중이라 거기에 얹으면 넘기는 손맛이 둔해진다.
   * 데스크톱에서는 패널이 겹쳐 있어 이 값이 의미가 없으므로 쓰지 않는다.
   */
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const slides = [...el.querySelectorAll<HTMLElement>("[data-slide]")];
    if (slides.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.55) {
            setActive(slides.indexOf(e.target as HTMLElement));
          }
        }
      },
      { root: el, threshold: [0.55, 0.8] },
    );
    slides.forEach((x) => io.observe(x));
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="lineup-heading"
      className="relative border-t border-hairline"
    >
      {/*
        ── 모바일은 옆으로 넘긴다 ──

        세로로 쌓으면 제품 여섯 개를 보려고 화면을 여섯 번 내려야 하고,
        그동안 «같은 화면이 계속된다» 로 읽힌다. 옆으로 넘기면 한 손으로
        훑을 수 있고, 넘길 때마다 사진과 사양이 함께 바뀐다.

        브라우저의 scroll-snap 을 쓴다. 직접 만들면 관성 · 튕김 · 손가락
        추적을 다시 구현해야 하는데, 그건 이미 브라우저가 훨씬 잘 한다.
        자바스크립트가 죽어도 넘기는 것은 그대로 된다.

        데스크톱(md 이상)은 지금의 핀 연출 그대로다 — 두 규칙이 겹치지
        않도록 모바일 전용 클래스는 md 에서 모두 해제한다.
      */}
      <div
        ref={stage}
        className="showcase-stage relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-16 md:px-12 md:py-20"
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
          <span>{String(products.length).padStart(2, "0")}</span>
        </div>

        {/*
          ── 모바일: 사진만 넘긴다 ──

          사진은 옆으로 넘어가고 설명은 제자리에서 «내용만» 바뀐다.
          인스타 게시물과 같은 방식이라 따로 배우지 않아도 된다.

          브라우저의 scroll-snap 을 쓴다. 직접 만들면 관성 · 튕김 · 손가락
          추적을 다시 구현해야 하는데 그건 브라우저가 훨씬 잘 하고,
          자바스크립트가 죽어도 넘기는 것은 그대로 된다.
        */}
        <div className="md:hidden">
          <div
            ref={rail}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          >
            {products.map((product, index) => (
              <div
                key={product.slug}
                data-slide
                className="flex w-full shrink-0 snap-center items-center justify-center [&_img]:max-h-[38svh] [&_svg]:max-h-[38svh]"
              >
                <ProductMedia
                  product={product}
                  priority={index === 0}
                  sizes="92vw"
                />
              </div>
            ))}
          </div>

          {/*
            점은 사진 «바로 아래» 에 둔다. 설명 끝에 두면 사진과 멀어져서
            무엇을 넘기는 표시인지 알 수 없다.
          */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {products.map((x, i) => (
              <button
                key={x.slug}
                type="button"
                aria-label={`${x.nameKo} 보기`}
                aria-current={i === active}
                onClick={() => {
                  const el = rail.current;
                  if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                }}
                className="flex h-6 items-center px-0.5"
              >
                <span
                  className={`block h-[3px] rounded-full transition-all duration-300 ${
                    i === active ? "w-6 bg-signal" : "w-2 bg-ink-600"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* 설명은 제자리. 넘길 때 내용만 바뀐다. */}
          <div className="mt-6 px-6">
            <ProductSpecs product={products[active] ?? products[0]} />
          </div>
        </div>

        {/* ── 데스크톱: 지금까지의 핀 연출 그대로 ── */}
        {products.map((product, index) => (
          <article
            key={product.slug}
            className="showcase-panel hidden md:grid md:grid-cols-2 md:items-center md:gap-16 md:px-12 md:py-0"
          >
            {/*
              가운데 한 장만 좌우를 뒤집는다. 여섯 장이 모두 «왼쪽 글 / 오른쪽 그림»
              이면 내용이 바뀌어도 눈에는 같은 화면이 여섯 번 지나가는 것으로 읽혀
              실제보다 길게 느껴진다. 한 장만 바꿔도 «흐름» 이 생긴다.
            */}
            <div
              className={
                index === Math.floor(products.length / 2)
                  ? "md:order-2"
                  : "md:order-1"
              }
            >
              <ProductSpecs product={product} />
            </div>

            <div
              className={
                index === Math.floor(products.length / 2)
                  ? "md:order-1"
                  : "md:order-2"
              }
            >
              {/*
               * 첫 패널만 즉시 로딩한다. 나머지는 스크롤로 도달해야 보이므로
               * 지연 로딩이 맞다 — 제품 사진을 첫 화면에서 전부 받으면
               * "첫 화면 2.5초" 제약을 그대로 깨뜨린다 (기획서 §3.4).
               */}
              <ProductMedia
                product={product}
                priority={false}
                sizes="46vw"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * 한 제품의 사양.
 *
 * 모바일과 데스크톱이 같은 것을 쓴다. 두 벌로 적어 두면 한쪽만 고친 상태가
 * 반드시 생기는데, 여기 적힌 숫자는 이 사이트가 파는 것 그 자체다.
 */
function ProductSpecs({ product }: { product: Product }) {
  return (
    <div>
              <div className="flex items-center gap-3">
        <span className="font-display text-[0.65rem] tracking-[0.28em] text-accent uppercase">
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
          {/*
            평을 병기한다. 사장님이 임대차 계약서에서 보는 단위는
            m² 가 아니라 평이라, m² 만으로는 크기 감이 오지 않는다.
          */}
          <dd className="tabular font-display mt-1 text-2xl font-bold text-accent">
            {/* 숫자도 앞 제품 값에서 굴러온다. data-area 가 목표값이다. */}
            <span data-area={product.footprintM2}>
              {product.footprintM2}
            </span>
            <span className="ml-0.5 text-base">m²</span>
            <span className="ml-2 text-sm font-medium text-ink-300">
              {formatPyeong(product.footprintM2!)}
            </span>
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

      {/*
        이 구간이 하려는 말을 문장으로 한 번 더 한다.
        −43% 라는 숫자는 도면 범례에 작게만 있어서, 스크롤하는 사람이
        «그래서 뭐가 좋은데» 에 닿지 못한 채 지나간다. 왼쪽 글이 위에서
        끝나 아래 3분의 1이 비어 있던 자리이기도 하다.
      */}
      {product.footprintM2 != null &&
        product.footprintM2 < TYPICAL_FOOTPRINT_M2 && (
          <p className="mt-7 border-l-2 border-plot pl-4 text-pretty text-ink-300">
            같은 종류의 일반 기구보다{" "}
            <strong className="tabular font-semibold text-ink-100">
              {Math.round(
                (1 - product.footprintM2 / TYPICAL_FOOTPRINT_M2) * 100,
              )}
              %
            </strong>{" "}
            덜 차지합니다.
          </p>
        )}

      <Link
        href={`/products/${product.slug}`}
        className="mt-8 inline-flex items-center gap-2 border-b border-ink-600 pb-1 text-sm font-medium text-ink-100 transition-colors hover:border-accent hover:text-accent"
      >
        제품 자세히 보기
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
