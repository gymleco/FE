import { NavLink, Outlet } from "react-router";

import { useAuth } from "@/auth/auth";
import { Button } from "@/components/ui";

/**
 * 바깥 틀 — 왼쪽 메뉴 + 본문.
 *
 * 만든 화면만 메뉴에 올린다. 눌리지 않는 항목을 «준비 중» 으로 걸어 두면
 * 대표님이 그걸 누르고 아무 일도 일어나지 않는 경험을 하게 된다.
 * 메뉴에 있으면 동작해야 한다.
 */

const NAV = [
  { to: "/", label: "대시보드", end: true },
  { to: "/products", label: "제품" },
  { to: "/used", label: "중고" },
] as const;

export function Shell() {
  const { state, logout } = useAuth();
  const who = state.status === "in" ? state.me.username : "";

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-line bg-surface px-4 py-4 md:w-56 md:border-r md:border-b-0 md:px-3 md:py-5">
        <div className="flex items-center justify-between gap-3 md:block">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.2em] text-accent">
              GYMLECO
            </p>
            <p className="text-sm font-bold">관리 화면</p>
          </div>
          <div className="md:hidden">
            <Button onClick={() => void logout()}>로그아웃</Button>
          </div>
        </div>

        <nav aria-label="주요" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : false}
              className={({ isActive }) =>
                `rounded-xs px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-surface-2 text-ink"
                    : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden flex-col gap-2 md:flex">
          <p className="px-3 text-xs text-ink-3">
            <span className="font-semibold text-ink-2">{who}</span> 님으로 로그인
          </p>
          <Button onClick={() => void logout()}>로그아웃</Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}

/** 화면마다 반복되는 제목 줄 */
export function PageHead({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {desc && <p className="mt-1 text-sm text-ink-2">{desc}</p>}
      </div>
      {action}
    </header>
  );
}
