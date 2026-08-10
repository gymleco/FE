import type { Metadata } from "next";
import Link from "next/link";

import { parts } from "@/lib/catalog";
import { FloatingCta } from "@/components/floating-cta";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "부품",
  description:
    "짐레코 헬스기구 정품 부품. 케이블 와이어, 도르래, 패드, 중량 핀 등 소모품을 본사 직영으로 공급합니다.",
};

export default function PartsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Parts"
          title="부품"
          description="본사 직영이라 부품 조달 경로가 짧습니다. 모델명과 증상만 알려주시면 필요한 부품을 확인해 드립니다."
        />

        <section className="px-6 py-12 md:px-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {parts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        {/* 부품은 "무엇이 필요한지 모르는" 상태로 오는 경우가 많다 */}
        <section className="border-t border-hairline px-6 py-16 md:px-12">
          <h2 className="text-xl font-semibold tracking-tight text-ink-100">
            어떤 부품이 필요한지 모르시겠다면
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <Step
              n="1"
              title="증상을 알려주세요"
              body="“케이블에서 소음이 난다”, “패드가 꺼졌다” 정도면 충분합니다."
            />
            <Step
              n="2"
              title="사진 한 장이면 더 빠릅니다"
              body="해당 부위를 찍어 보내주시면 모델과 규격을 저희가 확인합니다."
            />
            <Step
              n="3"
              title="교체 주기도 안내드립니다"
              body="지금 함께 바꾸는 편이 나은 소모품이 있으면 같이 알려드립니다."
            />
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/contact?type=PART"
              className="rounded-full bg-signal px-6 py-3 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
            >
              부품 문의하기
            </Link>
            <p className="text-sm text-ink-400">
              타사 기구 부품은 호환이 어려울 수 있습니다. 문의 시 확인해 드립니다.
            </p>
          </div>
        </section>
      </main>
      <FloatingCta label="부품 문의" />
    </>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border-t border-hairline pt-5">
      <span className="font-display text-sm font-bold text-signal">{n}</span>
      <h3 className="mt-2 font-semibold text-ink-100">{title}</h3>
      <p className="mt-2 text-sm text-pretty text-ink-400">{body}</p>
    </div>
  );
}
