"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { Product } from "@/lib/catalog";
import { formatPyeong } from "@/lib/area";

/**
 * 라인업 원판 — 기울어진 원 위의 기구를 직접 돌려 본다.
 *
 * ── 왜 CSS 3D(preserve-3d)를 쓰지 않는가 ──
 *
 * preserve-3d 는 자식에 filter·opacity 를 걸면 평탄화되고, 브라우저마다
 * 쌓임 순서가 달라진다. 여기서는 원 위의 좌표를 직접 계산해
 * translate·scale·opacity 만 쓴다. 계산이 우리 손에 있으니
 * 앞뒤 순서(zIndex)와 크기를 정확히 통제할 수 있고 어디서나 같게 나온다.
 *
 * ── 실패했을 때의 모습 ──
 *
 * JS 가 죽거나 아직 마운트 전이면 기구들이 그냥 가로로 놓인다.
 * 숨겨 두고 살아나기를 기다리지 않는다 — 최악이 "안 도는 목록"이지
 * "빈 화면"이 아니어야 한다 (FE/CLAUDE.md 연출 제약).
 */

/** 원판을 내려다보는 각도. 1 이면 정원, 작을수록 눕는다. */
const TILT = 0.34;

/** 원판 지름의 몇 배를 끌어야 한 바퀴 도는가 */
const DRAG_TURNS = 1.15;

/** 손을 뗀 뒤 남는 회전이 줄어드는 비율 (프레임당) */
const FRICTION = 0.93;

/** 이보다 느려지면 가장 가까운 제품으로 붙인다 */
const SNAP_THRESHOLD = 0.0016;

const TAU = Math.PI * 2;

/** 구독할 외부 상태가 없다. 참조가 매 렌더 바뀌면 재구독하므로 밖에 둔다. */
const subscribeNothing = () => () => {};

/**
 * variant
 *   "inline"  글 옆에 놓이는 원판 (지금까지의 모습)
 *   "canvas"  화면 전체를 바닥으로 깔고 글이 그 위에 얹히는 모습.
 *             이때 정면 기구 설명은 아래 «가운데» 가 아니라 오른쪽으로 간다 —
 *             왼쪽 아래는 제목과 버튼이 차지하기 때문이다.
 */
export function LineupDisc({
  products,
  variant = "inline",
}: {
  products: Product[];
  variant?: "inline" | "canvas";
}) {
  const canvas = variant === "canvas";
  const items = products.slice(0, 7);
  const n = items.length;

  const [angle, setAngle] = useState(0);
  const [touched, setTouched] = useState(false);

  const box = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  /** 지금 각도. 자동 회전이 «어디서부터» 돌지 알아야 해서 따로 들고 있는다. */
  const angleRef = useRef(0);
  /** PC 에서는 끌지 않는다 — 원판이 화면을 채워 «어디를 잡나» 가 애매해진다.
   *  대신 화살표와 기구 클릭으로 넘긴다. 손가락 화면은 미는 게 자연스러워 그대로 둔다. */
  const [dragOff, setDragOff] = useState(false);
  /** 끌었는지 눌렀는지 가른다. 끌고 손을 뗀 것을 클릭으로 처리하면 안 된다. */
  const moved = useRef(false);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastT = useRef(0);

  /*
   * 원 배치는 수화(hydration)가 끝난 뒤에만 켠다. 그 전까지는 일반 흐름으로
   * 보이므로, JS 가 죽어도 최악이 "가로로 놓인 목록" 이지 빈 화면이 아니다.
   *
   * useEffect + setState 로 하지 않는 이유: 첫 렌더 직후 상태를 바꾸면
   * 연쇄 렌더가 한 번 더 돈다. useSyncExternalStore 는 서버 스냅샷과
   * 클라이언트 스냅샷을 따로 받으므로, 수화 시점에 곧바로 true 로 잡힌다.
   * 구독할 외부 상태가 없으니 구독 함수는 아무것도 하지 않는다.
   */
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,   // 브라우저
    () => false,  // 서버 · 수화 직전
  );

  /** 관성 + 스냅 — 손을 뗀 뒤 자연스럽게 멈추고 제품 하나가 정면에 온다 */
  const coast = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const step = () => {
      let stop = false;
      setAngle((a) => {
        if (Math.abs(velocity.current) > SNAP_THRESHOLD) {
          velocity.current *= FRICTION;
          return a + velocity.current;
        }
        // 가장 가까운 칸으로 부드럽게 붙인다
        const slot = TAU / n;
        const target = Math.round(a / slot) * slot;
        const diff = target - a;
        if (Math.abs(diff) < 0.0006) {
          stop = true;
          return target;
        }
        return a + diff * 0.16;
      });
      if (stop) return;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [n]);

  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /*
   * ── PC 에서는 끌기를 끈다 ──
   *
   * 원판이 화면을 채우게 되면서 «어디를 잡아야 하는지» 가 애매해졌다.
   * 배경 아무 데나 끌려도, 제목 근처에서도 원판이 잡혔다.
   * 대신 화살표와 «기구를 눌러 앞으로» 두 가지를 준다 — 목표가 분명한 조작이다.
   *
   * 손가락 화면은 그대로 둔다. 거기서는 미는 동작이 자연스럽고,
   * 화살표를 얹으면 작은 화면만 더 복잡해진다.
   */
  useEffect(() => {
    const fine = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const decide = () => setDragOff(fine.matches);
    decide();
    fine.addEventListener("change", decide);
    return () => fine.removeEventListener("change", decide);
  }, []);

  /** 목표 각도까지 부드럽게 옮긴다. */
  const tweenTo = useCallback((to: number) => {
    cancelAnimationFrame(raf.current);
    const from = angleRef.current;
    const t0 = performance.now();
    const DUR = 700;
    const run = (t: number) => {
      const k = Math.min(1, (t - t0) / DUR);
      const e = 1 - Math.pow(1 - k, 3); // 끝에서 부드럽게 선다
      setAngle(from + (to - from) * e);
      if (k < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
  }, []);

  /** 그 기구를 정면으로 가져온다. */
  const bringToFront = useCallback(
    (i: number) => {
      if (n === 0) return;
      const slot = TAU / n;
      const base = -i * slot;
      /*
       * 지금 각도에서 «가장 가까운 같은 자리» 를 고른다.
       * 이걸 안 하면 두 칸 옆 기구를 눌렀는데 원판이 한 바퀴를 돌아 버린다.
       */
      const turns = Math.round((angleRef.current - base) / TAU);
      tweenTo(base + turns * TAU);
    },
    [n, tweenTo],
  );

  /** 한 칸 넘긴다. dir=1 이 다음 기구다. */
  const step = useCallback(
    (dir: 1 | -1) => {
      if (n === 0) return;
      const slot = TAU / n;
      tweenTo((Math.round(angleRef.current / slot) - dir) * slot);
    },
    [n, tweenTo],
  );

  const onDown = (e: React.PointerEvent) => {
    if (n === 0 || dragOff) return; // PC 는 끌지 않는다 — 화살표와 클릭으로 넘긴다
    moved.current = false;
    cancelAnimationFrame(raf.current);
    dragging.current = true;
    velocity.current = 0;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    setTouched(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const w = box.current?.clientWidth || 1;
    const dx = e.clientX - lastX.current;
    const now = performance.now();
    const dt = Math.max(1, now - lastT.current);

    if (Math.abs(dx) > 2) moved.current = true;
    const dAngle = (dx / w) * (TAU / DRAG_TURNS);
    setAngle((a) => a + dAngle);

    // 프레임 간격이 들쭉날쭉해도 속도가 튀지 않게 16ms 기준으로 환산
    velocity.current = (dAngle / dt) * 16;
    lastX.current = e.clientX;
    lastT.current = now;
  };

  const onUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    coast();
  };

  /** 키보드로도 돌아가야 한다 — 드래그만 되면 키보드 사용자는 못 쓴다 */
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setTouched(true);
    cancelAnimationFrame(raf.current);
    const slot = TAU / n;
    setAngle((a) => {
      const cur = Math.round(a / slot);
      return (cur + (e.key === "ArrowRight" ? -1 : 1)) * slot;
    });
  };

  if (n === 0) return null;

  // 지금 정면에 있는 제품. theta = angle + i·(2π/n) 가 0 에 가장 가까운 i.
  const front = ((Math.round((-angle / TAU) * n) % n) + n) % n;

  return (
    <div
      className={
        canvas
          ? "relative mx-auto flex h-full w-full max-w-[34rem] flex-col lg:max-w-none"
          : "relative mx-auto w-full max-w-[42rem]"
      }
    >
      <div
        ref={box}
        role="group"
        aria-label={
          dragOff
            ? "제품 라인업 원판. 기구를 누르거나 좌우 방향키로 넘길 수 있습니다."
            : "제품 라인업 원판. 끌거나 좌우 방향키로 돌려 볼 수 있습니다."
        }
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className={`relative aspect-square touch-pan-y select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          dragOff ? "" : "cursor-grab active:cursor-grabbing"
        } ${
          canvas
            ? "mx-auto h-full max-h-full min-h-0 w-auto max-w-full flex-1 lg:translate-x-[4%] lg:-translate-y-[7%]"
            : "w-full"
        }`}
      >
        {/* 바닥 원판 — 쇼케이스의 설치 면적 격자와 같은 어휘를 쓴다 */}
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <radialGradient id="disc-face" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.14" />
              <stop offset="65%" stopColor="var(--color-accent)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g transform={`translate(50 62) scale(1 ${TILT})`}>
            <circle r="46" fill="url(#disc-face)" />
            {/*
              바깥 링만 브랜드색으로 또렷하게 둔다.
              ink-600 으로 두면 바탕과 대비가 2:1 도 안 돼서, 이 화면에서
              가장 눈에 띄어야 할 «기울어진 판» 이 보이지 않는다.
              안쪽 보조선은 흐린 채로 둬야 바깥 링이 살아난다.
            */}
            <circle r="46" fill="none" stroke="var(--color-accent)"
                    strokeOpacity="0.45" strokeWidth="0.6" />
            <circle r="31" fill="none" stroke="var(--color-ink-700)" strokeWidth="0.4" />
            <circle r="16" fill="none" stroke="var(--color-ink-700)" strokeWidth="0.4" />
            {/*
              눈금 — 제품이 놓이는 자리.

              ★ 좌표를 반드시 반올림한다.
                Math.sin 의 마지막 자리가 Node 와 브라우저에서 다르게 나와
                서버는 "-37.23909236273086", 클라이언트는 "…85" 를 찍었고
                React 가 하이드레이션 불일치로 잡았다.
            */}
            {items.map((_, i) => {
              const t = (i / n) * TAU;
              const r = (v: number) => Math.round(v * 1000) / 1000;
              return (
                <line
                  key={i}
                  x1={r(Math.sin(t) * 43)}
                  y1={r(Math.cos(t) * 43)}
                  x2={r(Math.sin(t) * 46)}
                  y2={r(Math.cos(t) * 46)}
                  stroke="var(--color-ink-600)"
                  strokeWidth="0.6"
                />
              );
            })}
          </g>
        </svg>

        {/* 제품 */}
        <div
          className={
            mounted
              ? "absolute inset-0"
              : "flex h-full flex-wrap items-center justify-center gap-4"
          }
        >
          {items.map((p, i) => {
            const theta = angle + (i / n) * TAU;
            // 앞(=화면 아래쪽)일수록 1 에 가깝다
            const depth = (1 + Math.cos(theta)) / 2;

            const style = mounted
              ? ({
                  position: "absolute",
                  left: `${50 + Math.sin(theta) * 38}%`,
                  top: `${62 + Math.cos(theta) * 38 * TILT}%`,
                  transform: `translate(-50%, -100%) scale(${0.42 + depth * 0.58})`,
                  opacity: 0.3 + depth * 0.7,
                  zIndex: Math.round(depth * 100),
                  filter: depth < 0.45 ? "blur(1.2px)" : undefined,
                } as const)
              : undefined;

            const isFront = i === front;
            return (
              /*
                누르면 그 기구가 앞으로 온다.
                버튼으로 두는 이유는 마우스만이 아니라 탭 · 엔터로도 닿아야 하기
                때문이다. 이미 앞에 있는 기구는 누를 것이 없으므로 끈다.
              */
              <button
                key={p.slug}
                type="button"
                style={style}
                disabled={isFront}
                aria-label={`${p.nameKo} 앞으로 가져오기`}
                onClick={() => {
                  // 끌고 손을 뗀 것을 클릭으로 오해하면 안 된다
                  if (moved.current) return;
                  setTouched(true);
                  bringToFront(i);
                }}
                className={`w-[19%] min-w-20 rounded-xs outline-none transition-[filter] focus-visible:ring-2 focus-visible:ring-accent ${
                  isFront
                    ? "cursor-default"
                    : "cursor-pointer hover:brightness-125"
                }`}
              >
                <DiscItem product={p} />
              </button>
            );
          })}
        </div>

        {/*
          앞뒤로 한 칸씩.

          원판 «아래» 에 둔다. 옆에 두면 화면을 채운 원판의 좌우 끝까지 손이
          가야 하고, 왼쪽은 제목 자리와 겹친다.
          끌 수 있는 화면(손가락)에서는 내보내지 않는다 — 미는 동작으로 충분하고
          작은 화면만 복잡해진다.
        */}
        {dragOff && n > 1 && (
          <div className="absolute top-[84%] left-1/2 flex -translate-x-1/2 gap-2">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                aria-label={dir === 1 ? "다음 기구" : "이전 기구"}
                onClick={() => {
                  setTouched(true);
                  step(dir);
                }}
                className="flex size-10 items-center justify-center rounded-full border border-hairline bg-ink-900/70 text-ink-300 backdrop-blur transition-colors hover:border-accent hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.2"
                     strokeLinecap="round" strokeLinejoin="round"
                     aria-hidden="true">
                  <path d={dir === 1 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/*
        정면 기구 설명.

        처음에는 이 글을 원판 위 칸에 붙였는데, 칸이 좁아 글이 옆 기구를
        덮었다. 원판 아래로 내리면 폭이 넉넉해 겹치지 않고,
        돌릴 때마다 바뀌는 내용이 한자리에서 읽힌다.

        높이를 고정한다 — 설명 길이가 제품마다 달라 그대로 두면
        돌릴 때마다 아래 버튼들이 위아래로 튄다.
      */}
      <div
        aria-live="polite"
        className={`min-h-[5.5rem] px-2 text-center sm:min-h-[5rem] ${
          canvas
            ? "mt-4 shrink-0 lg:absolute lg:top-0 lg:right-0 lg:mt-0 lg:max-w-xs lg:px-0 lg:text-right"
            : "mt-4"
        }`}
      >
        <p className="font-display text-lg font-bold tracking-tight text-ink-100">
          {items[front].nameKo}
        </p>
        {items[front].footprintM2 != null && (
          <p className="tabular font-display mt-0.5 text-sm font-bold text-accent">
            설치 면적 {items[front].footprintM2}m² ·{" "}
            {formatPyeong(items[front].footprintM2!)}
          </p>
        )}
        {items[front].summary && (
          <p
            className={`mt-2 max-w-md text-sm text-pretty text-ink-300 ${
              canvas ? "mx-auto lg:mx-0 lg:ml-auto" : "mx-auto"
            }`}
          >
            {items[front].summary}
          </p>
        )}
      </div>

      {/*
        조작할 수 있다는 사실을 알려 준다.
        자동으로 돌지 않으므로, 힌트가 없으면 멈춘 그림으로 보인다.
        한 번 만지면 사라진다 — 역할을 다했기 때문이다.
      */}
      <p
        aria-hidden="true"
        className={`pointer-events-none font-display text-[0.72rem] tracking-[0.22em] text-ink-300 uppercase transition-opacity duration-500 ${
          canvas
            ? "mt-3 shrink-0 text-center lg:absolute lg:top-28 lg:right-0 lg:mt-0 lg:text-right"
            : "mt-3 text-center"
        } ${!dragOff && touched ? "opacity-0" : "opacity-100"}`}
      >
        {dragOff
          ? "기구를 누르면 앞으로 옵니다"
          : "← 끌어서 돌려 보세요 →"}
      </p>
    </div>
  );
}

/**
 * 원판 위의 한 칸.
 *
 * 누끼 사진이 오면 사진, 아직 없으면 설치 면적 타일.
 * 작은 크기에서는 다이어그램의 격자·점선이 뭉개져 읽히지 않으므로
 * 축약된 타일을 쓴다 — 비어 보이는 대신 핵심 수치를 말한다.
 */
function DiscItem({ product }: { product: Product }) {
  if (product.cutoutUrl) {
    return (
      <div className="flex flex-col items-center gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.cutoutUrl}
          srcSet={product.cutoutSrcSet}
          sizes="(min-width: 1024px) 220px, 130px"
          alt=""
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-auto w-full object-contain drop-shadow-[var(--shadow-lift)]"
        />
      </div>
    );
  }

  /*
   * 누끼가 오기 전까지는 "설치 면적 타일"이 원판 위에 누워 있다.
   *
   * 처음엔 세로로 선 블록으로 그렸더니 원판 위의 제품이 아니라
   * 막대그래프처럼 읽혔다. 눕히면 바닥 면적이라는 뜻이 그대로 살고,
   * 나중에 누끼 사진이 오면 그 자리에 기구가 "서는" 대비도 생긴다.
   */
  const ratio =
    product.widthMm && product.depthMm
      ? Math.min(2.4, Math.max(0.5, product.widthMm / product.depthMm))
      : 1;

  return (
    <div className="flex flex-col items-center gap-1">
      {/*
        기울기를 transform 이 아니라 비율에 넣는다.
        scaleY 는 그려지는 크기만 줄이고 레이아웃 높이는 그대로 두어,
        납작해진 타일 위로 원래 높이만큼 빈 자리가 남고 라벨이 떠 버렸다.
      */}
      <div
        className="w-full rounded-[1px] bg-signal/90 shadow-[var(--shadow-lift-sm)]"
        style={{ aspectRatio: `${ratio / TILT}` }}
      />
    </div>
  );
}

