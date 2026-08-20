import type { Product } from "@/lib/catalog";
import { FootprintDiagram } from "@/components/footprint-diagram";

/**
 * 제품 시각 자료.
 *
 * 우선순위: 실제 사진 → 설치 면적 다이어그램 → 이름만
 *
 * ── next/image 를 쓰지 않는 이유 ──
 *
 * next/image 의 최적화 서버는 요청마다 원본을 받아 리사이즈한다.
 * 우리는 업로드 시점에 이미 3종 렌디션을 만들어 CDN 에 올려 두었다.
 * 여기서 next/image 를 쓰면 같은 일을 두 번 하고, 자체 호스팅 시에는
 * 그 CPU 를 우리 서버가 쓴다.
 *
 * 대신 srcset/sizes 로 브라우저가 알아서 고르게 한다 —
 * 표준 기능이고, 서버 비용이 0이며, CDN 캐시가 그대로 먹는다.
 * 키가 UUID 라 내용이 절대 바뀌지 않아 immutable 캐시도 안전하다.
 */
export function ProductMedia({
  product,
  sizes,
  priority = false,
  compactDiagram = false,
}: {
  product: Product;
  /** 이 이미지가 화면에서 차지할 폭. 브라우저가 렌디션을 고르는 기준이다. */
  sizes: string;
  /** 첫 화면에 보이는 이미지에만 true — 그 외에는 지연 로딩 */
  priority?: boolean;
  compactDiagram?: boolean;
}) {
  if (product.imageUrl && product.imageSrcSet) {
    return (
      /*
       * 비율을 고정한 상자 안에 object-contain 으로 넣는다.
       *
       * 제품 사진의 실제 비율은 제각각이다(누끼 이미지는 특히).
       * 상자를 고정하지 않으면 이미지가 도착하는 순간 카드 높이가 튀어
       * 격자 전체가 재배치된다(레이아웃 시프트). 세로로 긴 사진은
       * 잘리는 대신 여백을 갖는다 — 기구를 잘라 보여주는 것보다 낫다.
       */
      <div className="relative aspect-4/3 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          srcSet={product.imageSrcSet}
          sizes={sizes}
          alt={`${product.nameKo} 제품 사진`}
          loading={priority ? "eager" : "lazy"}
          // 첫 화면 이미지는 디코딩도 앞당긴다
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    );
  }

  const hasFootprint =
    product.footprintM2 != null &&
    product.widthMm != null &&
    product.depthMm != null;

  if (hasFootprint) {
    return (
      <FootprintDiagram
        nameKo={product.nameKo}
        footprintM2={product.footprintM2!}
        widthMm={product.widthMm!}
        depthMm={product.depthMm!}
        compact={compactDiagram}
      />
    );
  }

  return (
    <div className="flex aspect-4/3 items-center justify-center bg-ink-900">
      <span className="font-display text-[0.65rem] tracking-[0.2em] text-ink-600 uppercase">
        {product.nameEn}
      </span>
    </div>
  );
}
