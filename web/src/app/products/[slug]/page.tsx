import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CATEGORY_LABEL,
  catalog,
  findProduct,
  relatedProducts,
  TYPICAL_FOOTPRINT_M2,
} from "@/lib/catalog";
import { FloatingCta } from "@/components/floating-cta";
import { FootprintDiagram } from "@/components/footprint-diagram";
import { ProductCard } from "@/components/product-card";
import { SampleBadge } from "@/components/sample-badge";
import { SiteHeader } from "@/components/site-header";

/** 빌드 시점에 전 제품 페이지를 만든다. 검색 유입이 핵심인 사이트다. */
export function generateStaticParams() {
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) {
    return { title: "제품을 찾을 수 없습니다" };
  }

  const footprint =
    product.footprintM2 != null
      ? ` 설치 면적 ${product.footprintM2}m².`
      : "";

  return {
    title: product.nameKo,
    description: `${product.summary}${footprint} ${product.nameEn} — 짐레코 코리아.`,
    openGraph: {
      title: `${product.nameKo} | GYMLECO KOREA`,
      description: product.summary,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) {
    notFound();
  }

  const hasFootprint =
    product.footprintM2 != null &&
    product.widthMm != null &&
    product.depthMm != null;

  const related = relatedProducts(product);
  const savedPercent =
    product.footprintM2 != null
      ? Math.round((1 - product.footprintM2 / TYPICAL_FOOTPRINT_M2) * 100)
      : 0;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* ── 경로 ── */}
        <nav aria-label="현재 위치" className="px-6 pt-8 md:px-12">
          <ol className="flex flex-wrap gap-2 text-sm text-ink-400">
            <li>
              <Link href="/products" className="hover:text-ink-100">
                제품
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>{CATEGORY_LABEL[product.category]}</li>
            <li aria-hidden="true">›</li>
            <li className="text-ink-100">{product.nameKo}</li>
          </ol>
        </nav>

        {/* ── 개요 ── */}
        <section className="grid gap-10 px-6 pt-10 pb-16 md:grid-cols-2 md:gap-16 md:px-12">
          <div className="order-2 md:order-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-[0.65rem] tracking-[0.28em] text-signal uppercase">
                {CATEGORY_LABEL[product.category]}
              </span>
              {product.isPlaceholder && <SampleBadge />}
            </div>

            <h1 className="mt-4 text-[clamp(1.9rem,5vw,3.25rem)] leading-[1.1] font-bold tracking-tight text-ink-100">
              {product.nameKo}
            </h1>
            <p className="font-display mt-1 text-sm tracking-[0.2em] text-ink-400 uppercase">
              {product.nameEn}
            </p>

            <p className="mt-6 max-w-md text-pretty text-ink-300 md:text-lg">
              {product.summary}
            </p>

            {hasFootprint && (
              <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
                <SpecRow label="설치 면적">
                  <span className="tabular font-display text-xl font-bold text-signal">
                    {product.footprintM2} m²
                  </span>
                </SpecRow>
                <SpecRow label="가로 × 세로 × 높이">
                  <span className="tabular">
                    {product.widthMm} × {product.depthMm} × {product.heightMm}{" "}
                    <span className="text-ink-400">mm</span>
                  </span>
                </SpecRow>
                {product.weightKg != null && (
                  <SpecRow label="중량">
                    <span className="tabular">
                      {product.weightKg} <span className="text-ink-400">kg</span>
                    </span>
                  </SpecRow>
                )}
              </dl>
            )}

            {/*
              문의로 넘어갈 때 이 제품이 미리 선택되게 한다.
              방금 본 제품을 다시 고르게 하면 거기서 이탈한다.
            */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/contact?type=QUOTE&product=${product.slug}`}
                className="rounded-full bg-signal px-6 py-3 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
              >
                이 제품 견적 문의
              </Link>
              <Link
                href={`/contact?type=DEMO&product=${product.slug}`}
                className="rounded-full border border-ink-600 px-6 py-3 text-sm font-medium text-ink-100 transition-colors hover:border-ink-300"
              >
                무료 시연 신청
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2">
            {hasFootprint ? (
              <FootprintDiagram
                nameKo={product.nameKo}
                footprintM2={product.footprintM2!}
                widthMm={product.widthMm!}
                depthMm={product.depthMm!}
              />
            ) : (
              <div className="flex aspect-4/3 items-center justify-center border border-hairline bg-ink-900">
                <span className="font-display text-xs tracking-[0.2em] text-ink-600 uppercase">
                  {product.nameEn}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── 설치 공간 ── */}
        {hasFootprint && savedPercent > 0 && (
          <section className="border-t border-hairline px-6 py-14 md:px-12">
            <h2 className="text-xl font-semibold tracking-tight text-ink-100">
              설치 공간
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-ink-300">
              같은 운동을 하는 일반 상업용 기구의 평균 설치 면적은{" "}
              <span className="tabular">{TYPICAL_FOOTPRINT_M2}m²</span> 입니다.{" "}
              {product.nameKo}는{" "}
              <span className="tabular font-semibold text-signal">
                {product.footprintM2}m²
              </span>{" "}
              로 <span className="font-semibold text-signal">{savedPercent}%</span>{" "}
              적은 자리를 차지합니다. 기구 한 대의 차이는 작아 보이지만,
              라인업 전체로 보면 러닝머신 두세 대가 더 들어갑니다.
            </p>
          </section>
        )}

        {/* ── 상세 설명 ── */}
        {product.description && (
          <section className="border-t border-hairline px-6 py-14 md:px-12">
            <h2 className="text-xl font-semibold tracking-tight text-ink-100">
              제품 설명
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-ink-300">
              {product.description}
            </p>
          </section>
        )}

        {/* ── 관련 제품 ── */}
        {related.length > 0 && (
          <section className="border-t border-hairline px-6 py-14 md:px-12">
            <h2 className="text-xl font-semibold tracking-tight text-ink-100">
              함께 보는 제품
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      <FloatingCta />
    </>
  );
}

function SpecRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <dt className="text-sm text-ink-400">{label}</dt>
      <dd className="text-ink-100">{children}</dd>
    </div>
  );
}
