import type { Metadata } from "next";
import Link from "next/link";

import { accessories } from "@/lib/catalog";
import { FloatingCta } from "@/components/floating-cta";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "악세사리",
  description:
    "리프팅 벨트, 케이블 핸들, 고무 바닥재 등 헬스장 운영에 필요한 악세사리. 기구와 함께 주문하시면 배송·설치를 한 번에 진행합니다.",
};

export default function AccessoriesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Accessories"
          title="악세사리"
          description="기구만으로는 운영이 되지 않습니다. 바닥재, 핸들, 보호 장비까지 함께 준비하시면 오픈 후 추가 주문이 줄어듭니다."
        />

        <section className="px-6 py-12 md:px-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {accessories.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section className="border-t border-hairline px-6 py-16 md:px-12">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight text-ink-100">
                기구와 함께 주문하시면
              </h2>
              <p className="mt-4 text-pretty text-ink-300">
                배송과 설치를 한 번에 진행합니다. 특히 고무 바닥재는
                기구를 들이기 전에 깔아야 하므로, 오픈 일정이 정해져 있다면
                기구 견적 단계에서 함께 논의하시는 편이 좋습니다.
              </p>
              <p className="mt-4 text-sm text-ink-400">
                아래층 소음 민원의 대부분은 바닥재 단계에서 해결됩니다.
                건물 구조에 따라 권장 두께가 달라 현장 확인이 필요할 수 있습니다.
              </p>
            </div>
            <Link
              href="/contact?type=QUOTE"
              className="rounded-full bg-signal px-6 py-3 text-sm font-bold whitespace-nowrap text-signal-ink transition-colors hover:bg-signal-hover"
            >
              함께 견적 받기
            </Link>
          </div>
        </section>
      </main>
      <FloatingCta />
    </>
  );
}
