import { TYPICAL_FOOTPRINT_M2, type Product } from "@/lib/products";

/**
 * 설치 면적 다이어그램
 *
 * 제품 사진이 아직 없다 (Phase 0 최대 리스크, 기획서 §16).
 * 그래서 자리표시자로 회색 박스를 두는 대신, 이 사이트의 핵심 소구점인
 * "설치 면적"을 실제 치수 비율로 그린다.
 *
 * 일반 상업용 기구의 평균 면적을 흐린 사각형으로 겹쳐 두어
 * §3.1 의 "공간 절약 비교 연출"을 정적으로도 성립시킨다.
 * 실사진이 확보되면 이 다이어그램은 사진 옆 보조 정보로 내려간다.
 */
export function FootprintDiagram({ product }: { product: Product }) {
  const widthM = product.widthMm / 1000;
  const depthM = product.depthMm / 1000;

  // 비교 기준: 평균 면적을 같은 넓이의 정사각형으로 환산
  const typicalSide = Math.sqrt(TYPICAL_FOOTPRINT_M2);

  const PAD = 5;
  const CANVAS = 100;
  const maxExtent = Math.max(widthM, depthM, typicalSide) * 1.1;
  const scale = (CANVAS - PAD * 2) / maxExtent;

  // 두 사각형을 같은 좌하단 원점에 붙여야 면적 비교가 직관적으로 읽힌다
  const originX = PAD;
  const originY = CANVAS - PAD;

  const typicalPx = typicalSide * scale;
  const productW = widthM * scale;
  const productD = depthM * scale;

  const savedPercent = Math.round(
    (1 - product.footprintM2 / TYPICAL_FOOTPRINT_M2) * 100,
  );

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${CANVAS} ${CANVAS}`}
        className="w-full"
        role="img"
        aria-label={`${product.nameKo} 설치 면적 ${product.footprintM2}제곱미터. 가로 ${product.widthMm}mm, 세로 ${product.depthMm}mm. 일반 기구 평균 ${TYPICAL_FOOTPRINT_M2}제곱미터와 비교.`}
      >
        {/* 바닥 격자 — 1m 단위 */}
        <g stroke="currentColor" className="text-ink-700" strokeWidth="0.25">
          {Array.from({ length: Math.ceil(maxExtent) + 1 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={originX + i * scale}
              y1={originY}
              x2={originX + i * scale}
              y2={originY - (CANVAS - PAD * 2)}
            />
          ))}
          {Array.from({ length: Math.ceil(maxExtent) + 1 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={originX}
              y1={originY - i * scale}
              x2={originX + (CANVAS - PAD * 2)}
              y2={originY - i * scale}
            />
          ))}
        </g>

        {/* 일반 기구 평균 면적 */}
        <rect
          x={originX}
          y={originY - typicalPx}
          width={typicalPx}
          height={typicalPx}
          className="fill-ink-700/40 stroke-ink-600"
          strokeWidth="0.4"
          strokeDasharray="2 1.5"
        />

        {/* 이 제품의 실제 설치 면적 */}
        <rect
          x={originX}
          y={originY - productD}
          width={productW}
          height={productD}
          className="fill-signal/85 stroke-signal"
          strokeWidth="0.6"
        />
      </svg>

      <figcaption className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-2 text-ink-300">
          <span
            aria-hidden="true"
            className="inline-block size-3 rounded-xs bg-signal"
          />
          짐레코{" "}
          <strong className="tabular font-semibold text-ink-100">
            {product.footprintM2}m²
          </strong>
        </span>
        <span className="flex items-center gap-2 text-ink-400">
          <span
            aria-hidden="true"
            className="inline-block size-3 rounded-xs border border-ink-600 bg-ink-700/40"
          />
          일반 기구 평균 <span className="tabular">{TYPICAL_FOOTPRINT_M2}m²</span>
        </span>
        {savedPercent > 0 && (
          <span className="tabular font-display font-bold text-signal">
            −{savedPercent}%
          </span>
        )}
      </figcaption>
    </figure>
  );
}
