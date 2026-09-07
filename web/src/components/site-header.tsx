import Link from "next/link";

import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_GROUPS } from "@/lib/nav";

/**
 * 공통 헤더.
 *
 * ── 한 줄에 늘어놓기를 그만둔 이유 ──
 *
 * 예전에는 여섯 항목을 한 줄에 두고 넘치면 가로로 스크롤시켰다. 그때는
 * 「항목이 잘려 보이는 것 자체가 더 있다는 신호」라고 적어 두었는데,
 * 페이지가 열넷이 되면서 그 신호가 «메뉴가 끝없이 이어진다» 로 바뀌었다.
 * 무엇이 있는지 보려면 계속 밀어야 하고, 밀어 본 사람만 소식과
 * 개인정보처리방침을 찾는다.
 *
 * 세 덩어리(상품 · 브랜드 · 고객센터)로 접었다. 구조는 lib/nav.ts 한 곳에
 * 있고 데스크톱 드롭다운과 모바일 서랍이 같은 것을 읽는다.
 *
 * ── 드롭다운에 JS 를 쓰지 않는다 ──
 *
 * 헤더는 모든 페이지에 있으므로 서버 컴포넌트로 두는 편이 낫다.
 * hover 와 focus-within 만으로 충분하다 — focus-within 이 있어야
 * 키보드로도 열린다. 묶음 이름 자체가 링크라, 열리지 않아도 길은 막히지
 * 않는다(상품 → 제품 라인업, 브랜드 → About, 고객센터 → 문의).
 *
 * 모바일 서랍만 클라이언트다. 거기서도 여닫는 것은 <details> 이고
 * JS 는 «닫아 주는» 일만 얹는다.
 */
export function SiteHeader() {
  return (
    /*
      z-[45] — 떠 있는 문의 버튼(z-40) 보다 위, 「본문 바로가기」(z-50) 보다 아래.
      sticky 헤더는 자체 쌓임 맥락을 만들기 때문에 안쪽에서 z-50 을 줘 봐야
      바깥의 z-40 을 못 이긴다. 실제로 서랍 위로 문의 버튼이 겹쳐 떴다.
    */
    <header className="sticky top-0 z-[45] border-b border-hairline bg-ink-950/90 backdrop-blur">
      <div className="flex items-center gap-4 px-6 py-4 md:px-12">
        <Link
          href="/"
          className="font-display mr-auto shrink-0 text-base font-black tracking-[0.18em] text-ink-100"
        >
          GYMLECO
        </Link>

        <nav aria-label="주요" className="hidden items-center gap-1 lg:flex">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="group relative">
              <Link
                href={group.href}
                className="flex items-center gap-1 px-3 py-2 text-sm text-ink-300 transition-colors group-hover:text-ink-100 group-focus-within:text-ink-100"
              >
                {group.label}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>

              {/*
                visibility 를 같이 전환한다. opacity 만 0 으로 두면 보이지
                않는 판이 그대로 깔려 있어 아래 글자가 눌리지 않는다.
              */}
              <div className="invisible absolute top-full left-0 z-40 w-44 border border-hairline bg-ink-900 py-1 opacity-0 shadow-lg transition-[opacity,visibility] group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 text-sm whitespace-nowrap text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <ThemeToggle />

        <Link
          href="/contact"
          className="hidden shrink-0 rounded-full bg-signal px-4 py-2 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover sm:block"
        >
          문의
        </Link>

        <MobileNav />
      </div>
    </header>
  );
}
