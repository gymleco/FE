import type { Metadata } from "next";
import Link from "next/link";

import { FloatingCta } from "@/components/floating-cta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getFaqs } from "@/lib/support-source";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description:
    "가격, 배송·설치, 중고 등급, 사후관리에 대해 자주 묻는 질문을 모았습니다.",
};

export default async function FaqPage() {
  const { items, isDraft } = await getFaqs();

  // 분류별로 묶는다. 순서는 서버가 준 순서를 그대로 지킨다.
  const groups: { category: string; items: typeof items }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.category === item.category) last.items.push(item);
    else groups.push({ category: item.category, items: [item] });
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="border-b border-hairline px-6 py-20 md:px-12 md:py-28">
          <p className="font-display text-[0.7rem] tracking-[0.35em] text-accent uppercase">
            FAQ
          </p>
          <h1 className="mt-5 text-[clamp(2rem,5vw,3.25rem)] leading-tight font-bold tracking-tight text-ink-100">
            자주 묻는 질문
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-ink-300">
            여기서 답을 찾지 못하셨다면{" "}
            <Link href="/contact" className="text-accent underline underline-offset-4">
              문의
            </Link>
            로 보내주세요. 영업일 기준 하루 안에 답변드립니다.
          </p>
        </section>

        <section className="px-6 py-16 md:px-12 md:py-20">
          <div className="mx-auto max-w-3xl">
            {groups.map((group) => (
              <div key={group.category} className="mb-14 last:mb-0">
                <h2 className="font-display mb-4 text-[0.72rem] tracking-[0.25em] text-ink-400 uppercase">
                  {group.category}
                </h2>

                <div className="border-t border-hairline">
                  {group.items.map((faq) => (
                    /*
                      details/summary 를 쓴다. 아코디언을 JS 로 만들면
                      스크립트가 늦게 오는 동안 답변이 안 보이고,
                      검색엔진이 접힌 내용을 놓칠 수 있다.
                      브라우저 기본 동작이면 그 두 문제가 없다.
                    */
                    <details
                      key={faq.id}
                      className="group border-b border-hairline"
                    >
                      <summary className="flex cursor-pointer list-none items-start gap-4 py-5 text-ink-100 transition-colors marker:content-none hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">
                        <span className="flex-1 text-pretty">{faq.question}</span>
                        <svg
                          className="mt-1 shrink-0 text-ink-400 transition-transform group-open:rotate-45"
                          width="16" height="16" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </summary>
                      <div className="pb-6 text-pretty text-ink-300">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}

            {isDraft && (
              <p className="mt-12 border border-dashed border-ink-600 px-4 py-3 text-sm text-ink-400">
                아직 등록된 질문이 없어 <strong className="text-ink-300">초안</strong>을
                보여 드리고 있습니다. 관리 화면에서 하나라도 등록하면 이 목록은
                등록한 내용으로 바뀝니다.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingCta />
    </>
  );
}
