import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/products", label: "제품" },
  { href: "/used", label: "중고" },
  { href: "/parts", label: "부품" },
  { href: "/accessories", label: "악세사리" },
  { href: "/centers", label: "공식 헬스장" },
  { href: "/about", label: "브랜드" },
] as const;

/**
 * 고객센터 — 문의와 FAQ 를 묶는다.
 *
 * 기구 문의와 "배송 언제 오나요" 는 성격이 다르다. 한 창구로 받으면
 * 대표님이 견적 문의 사이에서 단순 질문을 골라내는 일을 매번 해야 한다.
 * FAQ 를 앞에 두면 답이 이미 있는 질문은 거기서 끝난다.
 */
const SUPPORT = [
  { href: "/contact", label: "문의하기" },
  { href: "/support/faq", label: "FAQ" },
  { href: "/support/notice", label: "공지사항" },
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
          className="no-scrollbar -mx-2 flex min-w-0 flex-1 gap-5 overflow-x-auto px-2 text-sm whitespace-nowrap"
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

        {/*
          고객센터 — CSS 로만 여는 드롭다운.

          JS 상태를 쓰지 않는다. 헤더는 모든 페이지에 있어 서버 컴포넌트로
          두는 편이 낫고, hover/focus-within 만으로 여닫는 데 충분하다.
          focus-within 이 있어야 키보드로도 열린다.
        */}
        <div className="group relative hidden shrink-0 sm:block">
          <button
            type="button"
            aria-haspopup="true"
            className="flex items-center gap-1 py-2 text-sm text-ink-300 transition-colors group-hover:text-ink-100 group-focus-within:text-ink-100"
          >
            고객센터
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div className="invisible absolute right-0 top-full z-40 w-36 border border-hairline bg-ink-900 py-1 opacity-0 shadow-lg transition-[opacity,visibility] group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            {SUPPORT.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 text-sm text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <ThemeToggle />

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
