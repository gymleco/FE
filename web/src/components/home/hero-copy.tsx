"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * 히어로 왼쪽 문구 — 시간이 지나면 스스로 바뀐다.
 *
 * ── h1 을 여러 개 만들지 않는 이유 ──
 *
 * 슬라이드마다 <h1> 을 두면 문서에 제목이 넷이 되어 검색엔진이 무엇을
 * 페이지 주제로 볼지 잃는다. 숨긴 슬라이드는 접근성 트리에서도 빠지므로,
 * 2번 문구가 보이는 동안에는 페이지에 제목이 아예 없는 상태가 된다.
 *
 * 그래서 h1 은 하나만 두고 그 안의 글자만 바꾼다.
 * 서버가 그리는 값은 항상 0번이라 검색엔진은 대표 문구 하나만 본다.
 *
 * ── 멈출 수 있어야 한다 ──
 *
 * 5초 넘게 스스로 바뀌는 내용에는 멈출 방법이 있어야 한다(WCAG 2.2.2).
 * 마우스를 올리거나 초점이 들어오면 멈추고, 점을 눌러 직접 고를 수도 있다.
 * prefers-reduced-motion 이면 아예 돌지 않는다.
 */

type Slide = {
  eyebrow: string;
  title: [string, string];
  body: string;
};

/* 네 문구는 각각 사이트의 실제 구역과 짝이 맞는다 —
   브랜드 / 설치 면적 / 내구성 / 중고. 지어낸 수사가 아니라
   방문자가 다음에 눌러 볼 곳을 미리 말해 주는 역할이다. */
const SLIDES: Slide[] = [
  {
    eyebrow: "Born in Sweden",
    title: ["스웨덴에서 온,", "공간을 아는 기구"],
    body: "본사 직영이라 중간 마진이 없습니다. 컴팩트 설계로 20~30평 피티샵에도 들어가고, 유지보수는 최소한으로 줄였습니다.",
  },
  {
    eyebrow: "Space First",
    title: ["20평에도", "다 들어갑니다"],
    body: "기구마다 설치 면적을 m²와 평으로 함께 적습니다. 도면 없이도 몇 대가 들어가는지 먼저 셈해 보실 수 있습니다.",
  },
  {
    eyebrow: "Built to Last",
    title: ["10년 뒤에도", "같은 운동감"],
    body: "화려한 디스플레이 대신 프레임 두께와 용접, 베어링 수명에 비용을 씁니다. 소모품은 규격품이라 교체가 쉽습니다.",
  },
  {
    eyebrow: "Used & Parts",
    title: ["중고도", "정비해 드립니다"],
    body: "센터 리뉴얼로 회수한 기구를 점검·정비 후 판매합니다. A·B·C 등급 기준을 밝히고, 교체한 소모품 내역을 함께 드립니다.",
  },
];

/*
 * ★ 제목 한 줄은 8자를 넘기지 않는다.
 *
 * 1440px 에서 왼쪽 칸은 약 624px 이고 글자는 72px 이라 8자(576px)까지
 * 들어간다. 9자가 되면 세 번째 줄로 넘치면서 원판을 아래로 밀어낸다.
 * 실제로 "라인업이 들어갑니다"(9자) 가 그렇게 깨졌다.
 * 문구를 추가하실 때 이 규칙을 지켜 주세요.
 */

/**
 * 한 문구가 머무는 시간(ms).
 *
 * 이 시간의 마지막 FADE 만큼은 흐려지는 중이라, 실제로 읽을 수 있는
 * 시간은 4000 − 420 ≈ 3.6초다. 본문이 50자 안팎이라 이보다 짧으면
 * 다 읽기 전에 넘어간다.
 */
const DWELL = 4000;

/** 교차 페이드 시간(ms) */
const FADE = 420;

export function HeroCopy() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tick = window.setInterval(() => {
      if (paused.current || document.hidden) return;
      // 먼저 흐려지고, 글자를 바꾼 뒤 다시 나타난다.
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % SLIDES.length);
        setVisible(true);
      }, FADE);
    }, DWELL);

    return () => window.clearInterval(tick);
  }, []);

  const go = (i: number) => {
    if (i === index) return;
    setVisible(false);
    window.setTimeout(() => {
      setIndex(i);
      setVisible(true);
    }, FADE);
  };

  const slide = SLIDES[index];

  /*
   * 두 덩어리로 나눠 내보낸다.
   *
   * 모바일 순서가 제목 → 기구 → 설명 이라 제목과 본문이 원판을 사이에
   * 두고 떨어져 앉는다. 한 상자로 묶으면 그 사이에 원판을 넣을 수 없다.
   * 같은 visible 상태를 함께 쓰므로 두 덩어리가 한 몸처럼 흐려진다.
   */
  const pause = {
    onPointerEnter: () => (paused.current = true),
    onPointerLeave: () => (paused.current = false),
    onFocusCapture: () => (paused.current = true),
    onBlurCapture: () => (paused.current = false),
  };

  const fade = {
    className: "transition-opacity duration-[420ms] ease-out",
    style: { opacity: visible ? 1 : 0 },
  };

  return (
    /*
      한 덩어리다.
      예전에는 head · body 두 칸으로 나뉘어 원판 좌우로 갈라졌는데,
      이제 원판이 화면 바닥으로 깔리고 이 글이 그 «위에» 얹힌다.
      나뉘어 있을 이유가 없어졌고, 나뉜 채로 두면 두 덩어리가 각자
      가운데로 밀려나 사이에 구멍이 났다.
    */
    <div className="max-w-xl" {...pause}>
      <div {...fade}>
        <p className="font-display text-[0.7rem] tracking-[0.4em] text-accent uppercase">
          {slide.eyebrow}
        </p>

        {/* 문서에 하나뿐인 h1. 글자만 바뀐다. */}
        <h1 className="mt-6 text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.05] font-bold tracking-tight text-balance text-ink-100">
          {slide.title[0]}
          <br />
          {slide.title[1]}
        </h1>
      </div>

      <p
        {...fade}
        className={`${fade.className} mt-6 text-pretty text-ink-300 md:text-lg lg:min-h-[4.5rem]`}
      >
        {slide.body}
      </p>

        {/* 직접 고를 수 있게 — 자동으로만 바뀌면 놓친 문구를 다시 볼 수 없다 */}
        <div
          className="mt-7 flex items-center gap-2.5"
          role="tablist"
          aria-label="소개 문구"
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.eyebrow}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={s.title.join(" ")}
              onClick={() => go(i)}
              className="group pointer-events-auto flex h-6 items-center outline-none"
            >
              <span
                className={`block h-[3px] rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-7 bg-signal"
                    : "w-3.5 bg-ink-600 group-hover:bg-ink-400 group-focus-visible:bg-signal"
                }`}
              />
            </button>
          ))}
        </div>

        {/*
          여기엔 data-cta-anchor 를 달지 않는다.
          히어로가 sticky 라 뒤에 계속 남아 있어서, 표시를 달면 화면을
          영영 벗어나지 않아 떠 있는 버튼이 페이지 내내 숨어 버린다.
        */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="pointer-events-auto rounded-full bg-signal px-6 py-3 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
          >
            무료 시연 신청
          </Link>
          <Link
            href="/products"
            className="pointer-events-auto rounded-full border border-ink-600 px-6 py-3 text-sm font-medium text-ink-100 transition-colors hover:border-ink-300"
          >
            제품 라인업 보기
          </Link>
      </div>
    </div>
  );
}
