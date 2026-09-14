"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { scrollToTop } from "@/lib/scroll";

/**
 * 퀵메뉴 — 어느 화면에서든 문의로 가는 길.
 *
 * 예전의 «떠 있는 문의 버튼» 을 대신한다. 둘을 같이 두면 한 화면에
 * 문의 버튼이 헤더 · 본문 · 떠 있는 버튼 · 퀵메뉴까지 넷, 다섯이 된다.
 * 어느 것을 눌러야 할지 알려 주지 않으면 사람은 아무것도 누르지 않는다.
 *
 * ── 모바일: 아래 고정 바 ──
 * 인스타에서 들어오는 모바일이 주 트래픽이고, 엄지가 닿는 곳은 화면 아래다.
 * 작은 칸(제품 · 정품 확인 · 카톡 · 전화) + 오른쪽의 큰 문의 버튼.
 *
 * ── PC: 오른쪽 아래 세로 ──
 * 세로 가운데에 두면 오른쪽 끝에 붙은 본문(제품 격자, 라인업 도형)을 가린다.
 * 예전 떠 있는 버튼이 있던 모서리라, 이미 본 사람에게도 낯설지 않다.
 *
 * ── 없는 값은 칸째로 뺀다 ──
 * 카카오 채널 주소와 대표 전화는 아직 없다. 빈 칸이나 눌러도 아무 일도
 * 없는 버튼을 두는 것보다 칸이 없는 편이 낫다. 값이 들어오면 저절로 생긴다.
 */

type Inquiry = { label: string; href: string } | null;

/**
 * 화면마다 문의 유형을 미리 잡아 준다.
 * 예전 떠 있는 버튼이 화면마다 «부품 문의», «중고 문의» 로 이름을 바꾸던 일을 잇는다.
 */
function inquiryFor(pathname: string): Inquiry {
  // 이미 문의 화면이다. 거기서 «문의하기» 를 또 보여 주면 제자리를 가리킨다.
  if (pathname.startsWith("/contact")) return null;
  if (pathname.startsWith("/parts")) return { label: "부품 문의", href: "/contact?type=PART" };
  if (pathname.startsWith("/used")) return { label: "중고 문의", href: "/contact?type=USED" };
  if (pathname.startsWith("/centers")) return { label: "시연 문의", href: "/contact?type=DEMO" };
  return { label: "견적 문의", href: "/contact?type=QUOTE" };
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function QuickMenuBar({ chatUrl, phone }: { chatUrl: string; phone: string }) {
  const pathname = usePathname() ?? "/";
  const inquiry = inquiryFor(pathname);
  const tel = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : "";

  return (
    <>
      {/* ── 모바일 ─────────────────────────────────────────── */}
      <nav
        aria-label="빠른 메뉴"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div
          className={`flex h-[60px] items-center gap-1 px-2 ${inquiry ? "" : "justify-around"}`}
        >
          <BarItem
            href="/products"
            label="제품"
            icon={<IconGrid />}
            active={isActive(pathname, "/products")}
          />
          <BarItem
            href="/verify"
            label="정품 확인"
            icon={<IconShield />}
            active={isActive(pathname, "/verify")}
          />
          {chatUrl && (
            <BarItem href={chatUrl} label="카톡 상담" icon={<KakaoMark />} newTab />
          )}
          {tel && <BarItem href={tel} label="전화" icon={<IconPhone />} />}

          {inquiry && (
            <Link
              href={inquiry.href}
              className="ml-auto flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-signal px-4 text-sm font-bold whitespace-nowrap text-signal-ink transition-colors hover:bg-signal-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <IconPen className="size-4" />
              {inquiry.label}
            </Link>
          )}
        </div>
      </nav>

      {/* ── PC ─────────────────────────────────────────────── */}
      <nav aria-label="빠른 메뉴" className="fixed right-6 bottom-6 z-40 hidden lg:block">
        <ul className="flex w-[4.75rem] flex-col divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-ink-950/95 shadow-[var(--shadow-lift)] backdrop-blur">
          {chatUrl && (
            <li>
              <RailItem href={chatUrl} label="카톡 상담" icon={<KakaoMark />} newTab />
            </li>
          )}
          {inquiry && (
            <li>
              <RailItem href={inquiry.href} label={inquiry.label} icon={<IconPen />} primary />
            </li>
          )}
          <li>
            <RailItem
              href="/verify"
              label="정품 확인"
              icon={<IconShield />}
              active={isActive(pathname, "/verify")}
            />
          </li>
          <li>
            <button
              type="button"
              onClick={scrollToTop}
              className={`${RAIL_BASE} text-ink-300 hover:bg-ink-900 hover:text-ink-100`}
            >
              <IconUp />
              <span>맨 위로</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

/* ── 칸 ─────────────────────────────────────────────────────── */

/*
 * 글자색을 바탕 클래스에 넣지 않는다.
 * 상태마다 text-* 를 덧붙이면 같은 속성의 클래스가 둘이 되는데, Tailwind 에서
 * 이긴 쪽을 정하는 건 클래스를 쓴 순서가 아니라 CSS 가 생성된 순서다.
 * 색은 상태별로 딱 하나만 붙인다.
 */
const BAR_BASE =
  "flex h-full min-w-[3.5rem] flex-col items-center justify-center gap-1 rounded-lg px-1.5 text-[0.68rem] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none";

const RAIL_BASE =
  "flex w-full flex-col items-center gap-1 px-2 py-3 text-[0.68rem] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent focus-visible:outline-none";

type ItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  /** 사이트 밖(카카오톡)으로 나가는 칸. 새 창으로 연다 */
  newTab?: boolean;
};

function BarItem({ href, label, icon, active = false, newTab = false }: ItemProps) {
  const className = `${BAR_BASE} ${active ? "text-ink-100" : "text-ink-400 hover:text-ink-100"}`;
  return (
    <ItemLink href={href} className={className} active={active} newTab={newTab}>
      {icon}
      <span>{label}</span>
    </ItemLink>
  );
}

function RailItem({
  href,
  label,
  icon,
  active = false,
  newTab = false,
  primary = false,
}: ItemProps & { primary?: boolean }) {
  const tone = primary
    ? "bg-signal text-signal-ink hover:bg-signal-hover"
    : active
      ? "text-ink-100 hover:bg-ink-900"
      : "text-ink-300 hover:bg-ink-900 hover:text-ink-100";
  return (
    <ItemLink href={href} className={`${RAIL_BASE} ${tone}`} active={active} newTab={newTab}>
      {icon}
      <span className="text-center leading-tight">{label}</span>
    </ItemLink>
  );
}

/** 사이트 안 주소는 Link, 밖(카카오 · 전화)은 a */
function ItemLink({
  href,
  className,
  active,
  newTab,
  children,
}: {
  href: string;
  className: string;
  active: boolean;
  newTab: boolean;
  children: ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} aria-current={active ? "page" : undefined} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/* ── 아이콘 ─────────────────────────────────────────────────── */

function Svg({ children, className = "size-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

function IconGrid() {
  return (
    <Svg>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

function IconShield() {
  return (
    <Svg>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6l7-3z" />
      <path d="M9 12.2l2.1 2.1L15.2 10" />
    </Svg>
  );
}

function IconPhone() {
  return (
    <Svg>
      <path d="M6.5 3.5h3l1.6 4.4-2.1 1.3a11 11 0 0 0 5.8 5.8l1.3-2.1 4.4 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
    </Svg>
  );
}

function IconPen({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M4 20h4.2L19.4 8.8a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20z" />
      <path d="M13.5 6.5l4 4" />
    </Svg>
  );
}

function IconUp() {
  return (
    <Svg>
      <path d="M12 19V5" />
      <path d="M5.5 11.5L12 5l6.5 6.5" />
    </Svg>
  );
}

/**
 * 카카오 칸 표시.
 *
 * 카카오 공식 말풍선 기호는 카카오 디자인 가이드의 원본 파일로만 쓸 수 있다.
 * 받기 전까지는 흔한 말풍선 모양에 카카오 노랑(#FEE500) 바탕만 둔다 —
 * «누르면 카카오로 간다» 는 것은 색이 먼저 말해 준다.
 */
function KakaoMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 items-center justify-center rounded-full bg-[#FEE500] text-black/85"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
        <path d="M12 4.5c-4.7 0-8.5 2.9-8.5 6.6 0 2.3 1.5 4.4 3.8 5.6l-.9 3.3 3.8-2.5c.6.1 1.2.1 1.8.1 4.7 0 8.5-2.9 8.5-6.5S16.7 4.5 12 4.5z" />
      </svg>
    </span>
  );
}
