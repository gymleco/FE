"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * 다크 / 라이트 전환.
 *
 * ── 상태를 어디에 두는가 ──
 *
 * React state 가 아니라 <html data-theme> 에 둔다. 첫 페인트 전에 이미
 * 값이 정해져 있어야 하는데(안 그러면 어두운 화면이 한 번 번쩍인다),
 * React 는 그 시점에 아직 안 돌아간다. layout.tsx 의 인라인 스크립트가
 * localStorage 를 읽어 속성을 먼저 박아 두고, 이 컴포넌트는 그 속성을
 * 읽어 쓰기만 한다.
 *
 * useEffect + setState 로 읽어오지 않는 이유도 같다. 그 방식은 첫 렌더에서
 * 무조건 "다크" 를 그린 뒤 한 박자 늦게 고치므로 라벨이 눈에 띄게 바뀐다.
 * useSyncExternalStore 는 서버 스냅샷과 클라이언트 스냅샷을 따로 받아
 * 수화 시점에 바로 맞는 값을 잡는다.
 *
 * ── 아이콘이 깜빡이지 않는 이유 ──
 *
 * 해 · 달 아이콘은 JS 상태가 아니라 CSS 가 고른다([data-theme] 선택자).
 * 그래서 자바스크립트가 늦거나 아예 죽어도 아이콘은 항상 맞는 쪽이 보인다.
 * JS 상태는 aria-label 처럼 CSS 로 표현할 수 없는 것에만 쓴다.
 *
 * ── 저장 실패를 삼키는 이유 ──
 *
 * 사파리 프라이빗 모드나 쿠키 차단 설정에서는 localStorage 접근 자체가
 * 예외를 던진다. 테마는 기억되지 않아도 되는 값이므로, 저장에 실패해도
 * 전환은 그대로 되게 둔다.
 */

const KEY = "gymleco-theme";
/** 다른 탭·다른 토글 버튼과 값을 맞추기 위한 신호 */
const EVENT = "gymleco:themechange";

type Theme = "dark" | "light";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  // 다른 탭에서 바꾼 경우
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const readTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** 서버에는 브라우저 저장소가 없다. 기본값인 라이트로 그린다. */
const serverTheme = (): Theme => "light";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);

  const toggle = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    // 모바일 브라우저의 상단 바 색까지 같이 넘긴다. 이게 남아 있으면
    // 밝은 페이지 위에 검은 띠가 얹혀 어중간해 보인다.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f7f7f5" : "#08090a");
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // 저장이 막힌 환경 — 이번 방문 동안만 유지된다
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "light" ? "어두운 테마로 전환" : "밝은 테마로 전환"
      }
      title={theme === "light" ? "어두운 테마로" : "밝은 테마로"}
      className={`shrink-0 rounded-full border border-hairline p-2 text-ink-300 transition-colors hover:border-accent hover:text-ink-100 ${className}`}
    >
      {/*
        두 아이콘을 모두 내보내고 CSS 가 하나를 감춘다.
        theme-icon-* 규칙은 globals.css 에 있다.
      */}
      <svg
        className="theme-icon-dark"
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* 달 — 지금 밝은 화면이니 눌러서 어둡게 */}
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <svg
        className="theme-icon-light"
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* 해 — 지금 어두운 화면이니 눌러서 밝게 */}
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
