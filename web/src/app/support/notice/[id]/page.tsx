import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FloatingCta } from "@/components/floating-cta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getNotice } from "@/lib/support-source";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const notice = await getNotice(Number(id));
  if (!notice) return { title: "공지사항 | GYMLECO KOREA" };
  return {
    title: `${notice.title} | GYMLECO KOREA`,
    robots: { index: true, follow: true },
  };
}

export default async function NoticeDetailPage({ params }: Params) {
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric)) notFound();

  const notice = await getNotice(numeric);
  if (!notice) notFound();

  const date = notice.publishedAt
    ? new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(notice.publishedAt))
    : "";

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-20 md:px-12 md:py-28">
          <Link
            href="/support/notice"
            className="font-display text-[0.7rem] tracking-[0.25em] text-ink-400 uppercase transition-colors hover:text-ink-100"
          >
            ← 공지사항
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {notice.pinned && (
              <span className="font-display border border-signal px-2 py-0.5 text-[0.62rem] font-bold tracking-wider text-signal">
                고정
              </span>
            )}
            <time className="tabular text-sm text-ink-400">{date}</time>
          </div>

          <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.5rem)] leading-tight font-bold tracking-tight text-balance text-ink-100">
            {notice.title}
          </h1>

          {/*
            본문은 서버가 저장 시점에 살균한 HTML 이다.
            여기서 다시 거르지 않는 이유는 방어선을 한 곳에 두기 위해서다 —
            두 곳에서 거르면 어느 쪽이 실제로 막고 있는지 아무도 모르게 된다.
          */}
          <div
            className="notice-body mt-10 text-pretty text-ink-300"
            dangerouslySetInnerHTML={{ __html: notice.body ?? "" }}
          />

          <div className="mt-16 border-t border-hairline pt-8">
            <p className="text-sm text-ink-400">
              더 궁금하신 점은{" "}
              <Link
                href="/contact"
                className="text-signal underline underline-offset-4"
              >
                문의
              </Link>
              로 보내주세요.
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
      <FloatingCta />
    </>
  );
}
