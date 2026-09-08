"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { NAV_GROUPS, pathOf } from "@/lib/nav";

/**
 * 모바일 서랍 메뉴.
 *
 * ── 왜 <details> 인가 ──
 *
 * useState 로 여닫으면 JS 가 늦거나 죽었을 때 메뉴가 아예 안 열린다.
 * 헤더는 모든 페이지의 유일한 이동 수단이라, 그 경우 사이트가 통째로
 * 막힌다. <details> 는 브라우저가 여닫으므로 수화 전에도 열린다.
 * JS 는 «닫아 주는» 일만 얹는다 — 없어도 손해가 없는 것만.
 *
 * ── 왜 아코디언인가 ──
 *
 * 열넷을 한 줄로 펼치면 서랍을 열자마자 스크롤해야 한다. 접어 두면
 * 세 줄이라 한눈에 들어오고, 지금 보고 있는 묶음만 펼쳐 둔다.
 * 안쪽도 <details> 라 접고 펴는 데 JS 가 필요 없다.
 */
export function MobileNav() {
  const drawer = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  const close = () => {
    if (drawer.current) drawer.current.open = false;
  };

  /*
   * 페이지가 바뀌면 서랍을 닫는다.
   * 클라이언트 이동이라 화면만 갈리고 서랍은 열린 채로 남는다 —
   * 실제로 그렇게 두었더니 목적지 화면이 서랍에 가려 보이지 않았다.
   */
  useEffect(close, [pathname]);

  /* 서랍이 열려 있는 동안 뒤쪽 본문이 따라 움직이지 않게 한다 */
  useEffect(() => {
    const el = drawer.current;
    if (!el) return;
    const sync = () => {
      document.body.style.overflow = el.open ? "hidden" : "";
    };
    el.addEventListener("toggle", sync);
    return () => {
      el.removeEventListener("toggle", sync);
      document.body.style.overflow = "";
    };
  }, []);

  /* Esc 로도 닫힌다 — 서랍을 연 사람이 가장 먼저 누르는 키다 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <details ref={drawer} className="shrink-0 lg:hidden [&_summary::-webkit-details-marker]:hidden">
      <summary
        aria-label="메뉴"
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full border border-hairline text-ink-300 transition-colors hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </summary>

      {/*
        뒷배경. <details> 바깥을 눌러도 닫히지 않으므로 «닫는 자리» 를
        안쪽에 직접 만든다. 화면을 읽어 주는 사람에게는 의미가 없다.
      */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm"
      />

      <nav
        aria-label="전체 메뉴"
        className="fixed top-0 right-0 z-50 flex h-dvh w-[min(21rem,86vw)] flex-col overflow-y-auto border-l border-hairline bg-ink-900"
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <BrandLogo height={20} />
          <button
            type="button"
            onClick={close}
            aria-label="메뉴 닫기"
            className="flex size-9 items-center justify-center rounded-full text-ink-300 transition-colors hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-2 py-2">
          {NAV_GROUPS.map((group) => {
            const here = group.items.some((i) => pathOf(i.href) === pathname);
            return (
              <details
                key={group.label}
                open={here}
                className="group border-b border-hairline last:border-0 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-4 text-base font-semibold text-ink-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">
                  {group.label}
                  {/* 열리면 화살표가 돈다 — 지금 상태를 아이콘이 말한다 */}
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
                    className="text-ink-400 transition-transform group-open:rotate-180"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <ul className="pb-2">
                  {group.items.map((item) => {
                    const current = pathOf(item.href) === pathname;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          aria-current={current ? "page" : undefined}
                          className={`block rounded-xs px-3 py-2.5 pl-6 text-sm transition-colors ${
                            current
                              ? "font-semibold text-accent"
                              : "text-ink-300 hover:text-ink-100"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </div>

        {/*
          문의는 서랍 안에서도 버튼으로 둔다.
          목록의 한 줄로 두면 «가장 하고 싶은 행동» 이 다른 열넷과 같은
          무게가 된다 (기획서 §3.4-4 — 문의 진입로 상시 노출).
        */}
        <div className="border-t border-hairline p-4">
          <Link
            href="/contact"
            onClick={close}
            className="block rounded-full bg-signal px-4 py-3 text-center text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
          >
            견적 · 무료 시연 문의
          </Link>
        </div>
      </nav>
    </details>
  );
}
