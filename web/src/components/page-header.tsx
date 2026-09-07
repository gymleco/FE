import type { ReactNode } from "react";
import Link from "next/link";

import type { BannerView } from "@/lib/banner-source";

/**
 * 하위 페이지 상단 공통 블록.
 *
 * eyebrow 는 영문 라벨, title 은 한글 제목.
 * 라틴 디스플레이 서체는 영문에만 쓴다 — 한글에 걸면 폴백이 일어나
 * 의도한 형태가 나오지 않는다.
 *
 * ── 배너 ──
 *
 * 대표님이 관리 화면에서 이 위치에 배너를 걸면 사진이 바닥에 깔리고,
 * 제목과 부제가 그 위에 얹힌다. 없으면 지금 모습 그대로다.
 * 사진이 밝든 어둡든 글이 읽혀야 하므로 덮개는 사진이 있을 때 «항상» 깐다 —
 * 그건 사진을 고른 사람이 아니라 이 코드가 보장할 일이다.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
  banner,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  banner?: BannerView | null;
}) {
  const body = (
    <div
      className={`relative isolate overflow-hidden border-b border-hairline px-6 pt-14 pb-10 md:px-12 md:pt-20 md:pb-14 ${
        banner ? "md:pt-28 md:pb-20" : ""
      }`}
    >
      {banner && (
        <>
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet={banner.pcSrcSet}
              sizes="100vw"
            />
            { }
            <img
              src={banner.mobileUrl}
              srcSet={banner.mobileSrcSet}
              sizes="100vw"
              alt=""
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
          </picture>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(var(--scrim-rgb))_0%,rgb(var(--scrim-rgb)_/_0.9)_58%,rgb(var(--scrim-rgb)_/_0.7)_100%)]"
          />
        </>
      )}
      <p className="font-display text-[0.7rem] tracking-[0.35em] text-accent uppercase">
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

      {/* 배너에 적은 문구는 페이지 제목을 덮지 않고 아래에 덧붙인다 */}
      {banner?.subtitle && (
        <p className="mt-4 max-w-2xl text-pretty text-sm text-accent">
          {banner.subtitle}
        </p>
      )}
    </div>
  );

  /*
   * 배너에 갈 곳이 적혀 있으면 머리글 전체가 링크가 된다.
   * 사진만 눌리게 하면 «사진을 눌러야 하는 줄» 알아야 하고, 아무도 모른다.
   */
  return banner?.linkUrl ? (
    <Link href={banner.linkUrl} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
