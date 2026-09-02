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

export function LineupDisc({ products }: { products: Product[] }) {
  const items = products.slice(0, 7);
  const n = items.length;

  const [angle, setAngle] = useState(0);
  const [touched, setTouched] = useState(false);

  const box = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
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

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onDown = (e: React.PointerEvent) => {
    if (n === 0) return;
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
    <div className="relative mx-auto w-full max-w-[42rem]">
      <div
        ref={box}
        role="group"
        aria-label="제품 라인업 원판. 좌우 방향키로 돌려 볼 수 있습니다."
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className="relative aspect-square w-full cursor-grab touch-pan-y select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
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
            <circle r="46" fill="none" stroke="var(--color-ink-600)" strokeWidth="0.5" />
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

            return (
              <div key={p.slug} style={style} className="w-[19%] min-w-20">
                <DiscItem product={p} />
              </div>
            );
          })}
        </div>
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
        className="mt-4 min-h-[5.5rem] px-2 text-center sm:min-h-[5rem]"
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
          <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-ink-300">
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
        className={`pointer-events-none mt-2 text-center font-display text-[0.62rem] tracking-[0.22em] text-ink-400 uppercase transition-opacity duration-500 ${
          touched ? "opacity-0" : "opacity-100"
        }`}
      >
        ← 끌어서 돌려 보세요 →
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

