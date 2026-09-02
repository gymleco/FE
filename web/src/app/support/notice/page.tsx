import type { Metadata } from "next";
import Link from "next/link";

import { FloatingCta } from "@/components/floating-cta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getNotices } from "@/lib/support-source";

export const metadata: Metadata = {
  title: "공지사항 | GYMLECO KOREA",
  description: "서비스 점검, 배송 일정, 운영 안내를 알려 드립니다.",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  // 서버·브라우저 시간대가 달라도 같은 날짜가 찍히도록 한국 시간으로 고정한다
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default async function NoticePage() {
  const items = await getNotices();

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="border-b border-hairline px-6 py-20 md:px-12 md:py-28">
          <p className="font-display text-[0.7rem] tracking-[0.35em] text-accent uppercase">
            Notice
          </p>
          <h1 className="mt-5 text-[clamp(2rem,5vw,3.25rem)] leading-tight font-bold tracking-tight text-ink-100">
            공지사항
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-ink-300">
            서비스 점검, 배송 일정, 운영 안내를 알려 드립니다.
          </p>
        </section>

        <section className="px-6 py-16 md:px-12 md:py-20">
          <div className="mx-auto max-w-3xl">
            {items.length === 0 ? (
              /*
                공지는 초안을 두지 않는다. "지금 알릴 것이 있는가" 의 문제라
                없는데 지어내면 거짓말이 된다. 대신 다음 행동을 알려 준다.
              */
              <div className="border border-hairline px-6 py-14 text-center">
                <p className="text-ink-300">등록된 공지가 없습니다.</p>
                <p className="mt-3 text-sm text-ink-400">
                  급하신 내용은{" "}
                  <Link
                    href="/contact"
                    className="text-accent underline underline-offset-4"
                  >
                    문의
                  </Link>
                  로 보내주시면 바로 안내해 드립니다.
                </p>
              </div>
            ) : (
              <ul className="border-t border-hairline">
                {items.map((n) => (
                  <li key={n.id} className="border-b border-hairline">
                    <Link
                      href={`/support/notice/${n.id}`}
                      className="flex items-baseline gap-4 py-5 transition-colors hover:text-accent"
                    >
                      {n.pinned && (
                        <span className="font-display shrink-0 border border-accent px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider text-accent">
                          고정
                        </span>
                      )}
                      <span className="flex-1 text-pretty text-ink-100">
                        {n.title}
                      </span>
                      <time className="tabular shrink-0 text-sm text-ink-400">
                        {formatDate(n.publishedAt)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingCta />
    </>
  );
}
