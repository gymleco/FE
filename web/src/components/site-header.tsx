"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_GROUPS, pathOf } from "@/lib/nav";

/**
 * 공통 헤더 — 두 줄.
 *
 * ── 왜 드롭다운을 걷어냈나 ──
 *
 * 드롭다운은 «누르기 전까지 보이지 않는» 메뉴다. 마우스를 정확히 얹고
 * 있어야 열려 있고, 살짝 벗어나면 닫힌다. 하위 항목이 다섯인 고객센터에서
 * 특히 불편했다.
 *
 * 대신 윗줄에 묶음(상품 · 브랜드 · 고객센터)을 두고, 아랫줄에 그 묶음의
 * 하위를 **펼쳐 둔다**. 지금 보고 있는 곳의 형제 항목이 늘 보이므로,
 * 「제품 라인업 옆에 중고가 있다」 는 사실을 열어 보지 않아도 안다.
 *
 * ── 아랫줄이 언제 자리를 차지하는가 ──
 *
 * 지금 페이지가 어느 묶음에 속하면 아랫줄은 **늘 있다**. 다른 묶음에
 * 마우스를 얹으면 그 자리에서 내용만 바뀌므로 높이가 흔들리지 않는다.
 *
 * 어느 묶음에도 속하지 않는 페이지(홈 · 접수 완료)에서는 아랫줄이 없다.
 * 이때 마우스를 얹어 잠깐 보여 주는 것을 «자리를 차지하는 줄» 로 만들면,
 * 마우스를 얹었다 뗄 때마다 본문이 40px 씩 오르내린다. 그래서 그때만
 * 띄워서(absolute) 보여 준다 — 보이는 모습은 같고 본문은 움직이지 않는다.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  const active = NAV_GROUPS.find((g) =>
    g.items.some((i) => pathOf(i.href) === pathname),
  );
  const shown = NAV_GROUPS.find((g) => g.label === hovered) ?? active;

  /* 지금 페이지가 어느 묶음에도 없으면, 아랫줄은 떠서 보인다 */
  const floating = !active;

  return (
    /*
      z-[45] — 떠 있는 문의 버튼(z-40) 보다 위, 「본문 바로가기」(z-50) 보다 아래.
      sticky 헤더는 자체 쌓임 맥락을 만들기 때문에 안쪽에서 z-50 을 줘 봐야
      바깥의 z-40 을 못 이긴다. 실제로 서랍 위로 문의 버튼이 겹쳐 떴다.
    */
    <header
      className="sticky top-0 z-[45] border-b border-hairline bg-ink-950/90 backdrop-blur"
      onMouseLeave={() => setHovered(null)}
    >
      {/*
        ★ 세 칸 격자로 나눈다.
          flex + justify-between 으로 두면 로고와 버튼의 폭이 달라서 메뉴가
          «가운데» 가 아니라 «남은 자리의 가운데» 에 놓인다. 양쪽을 1fr 로
          잡아야 화면 정가운데에 선다.
      */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 md:px-12">
        <Link
          href="/"
          className="font-display justify-self-start text-base font-black tracking-[0.18em] text-ink-100"
        >
          GYMLECO
        </Link>

        <nav aria-label="주요" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_GROUPS.map((group) => {
              const on = shown?.label === group.label;
              return (
                <li key={group.label}>
                  {/*
                    누르는 자리를 넉넉히 준다. 글자만큼만 잡아 두면 항목
                    사이 빈틈을 눌러 아무 일도 안 일어나는 일이 생긴다.
                  */}
                  <Link
                    href={group.href}
                    onMouseEnter={() => setHovered(group.label)}
                    onFocus={() => setHovered(group.label)}
                    aria-current={active?.label === group.label ? "true" : undefined}
                    className={`block px-5 py-3 text-[0.95rem] font-semibold transition-colors ${
                      on ? "text-ink-100" : "text-ink-300 hover:text-ink-100"
                    }`}
                  >
                    {group.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 격자 가운데 칸은 lg 미만에서 비므로, 오른쪽 칸이 두 칸을 걸친다 */}
        <div className="col-start-3 flex items-center justify-self-end gap-3">
          <ThemeToggle />
          <Link
            href="/contact"
            className="hidden shrink-0 rounded-full bg-signal px-4 py-2 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover sm:block"
          >
            문의
          </Link>
          <MobileNav />
        </div>
      </div>

      {shown && (
        <div
          className={`hidden border-t border-hairline bg-ink-900/80 lg:block ${
            floating
              ? "absolute inset-x-0 top-full border-b border-hairline backdrop-blur"
              : ""
          }`}
        >
          <nav aria-label={`${shown.label} 하위`} className="px-6 md:px-12">
            <ul className="flex flex-wrap items-center justify-center gap-x-1">
              {shown.items.map((item) => {
                const current = pathOf(item.href) === pathname;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        current
                          ? "font-bold text-accent"
                          : "text-ink-300 hover:text-ink-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
