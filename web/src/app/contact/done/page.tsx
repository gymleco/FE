import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getSiteInfo } from "@/lib/settings-source";

export const metadata: Metadata = {
  title: "문의가 접수되었습니다",
  // 접수 완료 화면은 검색에 노출될 이유가 없다
  robots: { index: false, follow: false },
};

export default async function ContactDonePage() {
  const site = await getSiteInfo();

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-1 items-center px-6 py-24 md:px-12">
        <div className="mx-auto max-w-lg text-center">
          <p
            aria-hidden="true"
            className="font-display text-4xl font-black text-accent"
          >
            ✓
          </p>

          <h1 className="mt-6 text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-tight text-balance text-ink-100">
            문의가 접수되었습니다
          </h1>

          {/*
            언제 연락이 가는지 반드시 적는다.
            기다림이 불안하면 다른 업체에도 문의하게 된다.
          */}
          <p className="mt-6 text-pretty text-ink-300">
            담당자가 <strong className="text-ink-100">영업일 기준 1일 이내</strong>에
            연락드리겠습니다.
          </p>
          {/*
            번호가 없으면 이 줄을 아예 내보내지 않는다.
            «급하시면 전화 주세요» 밑에 안 받는 번호가 적혀 있는 것이
            아무 번호도 없는 것보다 나쁘다.
          */}
          {site.phone && (
            <p className="mt-3 text-sm text-ink-400">
              급하시면 전화로 문의해 주세요 —{" "}
              <a
                href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
                className="underline underline-offset-2"
              >
                {site.phone}
              </a>
            </p>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-full border border-ink-600 px-6 py-3 text-sm text-ink-100 transition-colors hover:border-ink-300"
            >
              제품 더 보기
            </Link>
            <Link
              href="/"
              className="rounded-full border border-ink-600 px-6 py-3 text-sm text-ink-100 transition-colors hover:border-ink-300"
            >
              홈으로
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
