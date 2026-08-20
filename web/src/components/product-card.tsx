import Link from "next/link";

import { CATEGORY_LABEL, type Product } from "@/lib/catalog";
import { ProductMedia } from "@/components/product-media";
import { SampleBadge } from "@/components/sample-badge";

/**
 * 카탈로그 카드.
 *
 * 기구에는 설치 면적을 항상 노출한다 — 이 사이트가 파는 것이 그 숫자다.
 * 부품·악세사리는 치수가 없으므로 다이어그램 대신 이름과 용도만 보여준다.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-4 border border-hairline p-5 transition-colors hover:border-ink-400"
    >
      <div className="aspect-4/3 overflow-hidden bg-ink-900 p-4">
        <ProductMedia
          product={product}
          compactDiagram
          /*
           * 카드는 3열(데스크톱) → 2열(태블릿) → 1열(모바일).
           * 데스크톱에서도 400px 을 넘지 않으므로 대부분 400 렌디션이 선택된다.
           * 목록 한 화면에 12장이 뜨는데 여기서 1600 을 받으면 수 MB 가 된다.
           */
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
        />
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
