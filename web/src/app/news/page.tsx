import type { Metadata } from "next";
import Link from "next/link";

import { FloatingCta } from "@/components/floating-cta";
import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "소식",
  description:
    "짐레코 코리아의 신제품 입고, 전시·시연 행사, 공식 헬스장 오픈 소식을 전합니다.",
};

/**
 * 소식 목록.
 *
 * CMS 연동 전 — news 테이블은 스키마(V1)에 이미 있고, 발행 API 가
 * 생기면 이 페이지가 fetch 결과로 대체된다 (ISR).
 * 그전까지는 빈 상태를 정직하게 보여준다. 메인과 푸터가 /news 로
 * 링크하고 있으므로 404 로 두지 않는다.
 */
export default function NewsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="News"
          title="짐레코 소식"
          description="신제품 입고, 전시·시연 행사, 공식 헬스장 오픈 소식을 이곳에 올립니다."
        />

        <section className="px-6 py-16 md:px-12">
          <p className="text-ink-400">등록된 소식이 아직 없습니다.</p>
          <p className="mt-4 max-w-xl text-pretty text-ink-400">
            새 소식이 올라올 때까지, 궁금하신 내용은{" "}
            <Link
              href="/contact"
              className="border-b border-signal text-signal hover:text-signal-hover"
            >
              문의
            </Link>
            로 보내주시면 바로 안내해 드립니다.
          </p>
        </section>
      </main>
      <FloatingCta />
    </>
  );
}
