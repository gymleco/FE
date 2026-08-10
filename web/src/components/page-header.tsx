import type { ReactNode } from "react";

/**
 * 하위 페이지 상단 공통 블록.
 *
 * eyebrow 는 영문 라벨, title 은 한글 제목.
 * 라틴 디스플레이 서체는 영문에만 쓴다 — 한글에 걸면 폴백이 일어나
 * 의도한 형태가 나오지 않는다.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="border-b border-hairline px-6 pt-14 pb-10 md:px-12 md:pt-20 md:pb-14">
      <p className="font-display text-[0.7rem] tracking-[0.35em] text-signal uppercase">
        {eyebrow}
      </p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[clamp(1.9rem,5vw,3.25rem)] leading-[1.1] font-bold tracking-tight text-balance text-ink-100">
          {title}
        </h1>
        {aside}
      </div>
      {description && (
        <p className="mt-6 max-w-2xl text-pretty text-ink-300 md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
