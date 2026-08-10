import Link from "next/link";

const NAV = [
  { href: "/products", label: "제품" },
  { href: "/used", label: "중고" },
  { href: "/parts", label: "부품" },
  { href: "/accessories", label: "악세사리" },
  { href: "/centers", label: "공식 헬스장" },
  { href: "/about", label: "브랜드" },
] as const;

/**
 * 공통 헤더.
 *
 * 메인은 배경 위에 겹쳐야 해서 자체 헤더를 쓰고, 나머지 페이지가 이걸 쓴다.
 *
 * 모바일에서는 메뉴가 가로 스크롤된다. 햄버거로 접는 것보다
 * 항목이 보이는 편이 낫다 — 중고·부품처럼 목적이 뚜렷한 방문자가
 * 메뉴를 열어봐야 한다는 사실 자체를 모를 수 있다.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-ink-950/90 backdrop-blur">
      <div className="flex items-center gap-6 px-6 py-4 md:px-12">
        <Link
          href="/"
          className="font-display shrink-0 text-base font-black tracking-[0.18em] text-ink-100"
        >
          GYMLECO
        </Link>

        <nav
          aria-label="주요"
          className="-mx-2 flex min-w-0 flex-1 gap-5 overflow-x-auto px-2 text-sm whitespace-nowrap"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink-300 transition-colors hover:text-ink-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact"
          className="hidden shrink-0 rounded-full bg-signal px-4 py-2 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover sm:block"
        >
          문의
        </Link>
      </div>
    </header>
  );
}
