import Link from "next/link";

import { CATEGORY_LABEL, type Product } from "@/lib/catalog";
import { FootprintDiagram } from "@/components/footprint-diagram";
import { SampleBadge } from "@/components/sample-badge";

/**
 * 카탈로그 카드.
 *
 * 기구에는 설치 면적을 항상 노출한다 — 이 사이트가 파는 것이 그 숫자다.
 * 부품·악세사리는 치수가 없으므로 다이어그램 대신 이름과 용도만 보여준다.
 */
export function ProductCard({ product }: { product: Product }) {
  const hasFootprint =
    product.footprintM2 != null &&
    product.widthMm != null &&
    product.depthMm != null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-4 border border-hairline p-5 transition-colors hover:border-ink-400"
    >
      <div className="aspect-4/3 bg-ink-900 p-4">
        {hasFootprint ? (
          <FootprintDiagram
            nameKo={product.nameKo}
            footprintM2={product.footprintM2!}
            widthMm={product.widthMm!}
            depthMm={product.depthMm!}
            compact
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-[0.65rem] tracking-[0.2em] text-ink-600 uppercase">
              {product.nameEn}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-[0.62rem] tracking-[0.25em] text-signal uppercase">
            {CATEGORY_LABEL[product.category]}
          </span>
          {product.isPlaceholder && <SampleBadge />}
        </div>

        <h3 className="text-lg leading-snug font-bold text-ink-100">
          {product.nameKo}
        </h3>
        <p className="flex-1 text-sm text-pretty text-ink-400">
          {product.summary}
        </p>

        {product.footprintM2 != null && (
          <p className="tabular font-display pt-1 text-sm font-bold text-signal">
            설치 면적 {product.footprintM2} m²
          </p>
        )}
      </div>
    </Link>
  );
}
