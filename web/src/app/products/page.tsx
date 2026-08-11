import type { Metadata } from "next";

import type { ProductCategory } from "@/lib/catalog";
import { getProducts } from "@/lib/products-source";
import { CatalogGrid } from "@/components/catalog-grid";
import { FloatingCta } from "@/components/floating-cta";
import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "제품 라인업",
  description:
    "짐레코 상업용 헬스기구 전체 라인업. 제품마다 설치 면적을 표시해 20~30평 공간에도 구성이 가능한지 바로 확인하실 수 있습니다.",
};

const CATEGORIES: ProductCategory[] = [
  "RACK",
  "STRENGTH",
  "CABLE",
  "BENCH",
  "CARDIO",
];

export default async function ProductsPage() {
  const products = await getProducts("EQUIPMENT");

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Products"
          title="제품 라인업"
          description="20~30평 공간에도 라인업을 온전히 갖출 수 있도록 설계돼 있습니다. 각 제품의 설치 면적을 일반 기구 평균과 비교해 표시했습니다."
        />

        <section className="px-6 py-12 md:px-12">
          <CatalogGrid products={products} categories={CATEGORIES} />
        </section>

        <section className="border-t border-hairline px-6 py-16 md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="max-w-xl text-pretty text-ink-300">
              공간 크기와 천장 높이만 알려주시면 배치안을 함께 그려
              드립니다. 어떤 조합이 맞는지 판단이 어려우실 때 가장 빠른 방법입니다.
            </p>
            <a
              href="/contact"
              className="rounded-full bg-signal px-6 py-3 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
            >
              배치안 문의하기
            </a>
          </div>
        </section>
      </main>
      <FloatingCta />
    </>
  );
}
