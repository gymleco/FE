import { TYPICAL_FOOTPRINT_M2 } from "@/lib/catalog";
import { formatPyeong } from "@/lib/area";

/**
 * 설치 면적 다이어그램
 *
 * 제품 사진이 아직 없다 (Phase 0 최대 리스크).
 * 그래서 자리표시자로 회색 박스를 두는 대신, 이 사이트의 핵심 소구점인
 * "설치 면적"을 실제 치수 비율로 그린다.
 *
 * 일반 상업용 기구의 평균 면적을 흐린 사각형으로 겹쳐 두어
 * "공간 절약 비교"가 정적으로도 성립하게 한다.
 * 실사진이 확보되면 이 다이어그램은 사진 옆 보조 정보로 내려간다.
 *
 * 제품 객체가 아니라 숫자를 받는다 — 부품·악세사리처럼 치수가 없는
 * 품목에는 애초에 렌더하지 않기 위해서다.
 */
export function FootprintDiagram({
  nameKo,
  footprintM2,
  widthMm,
  depthMm,
  compact = false,
}: {
  nameKo: string;
  footprintM2: number;
  widthMm: number;
  depthMm: number;
  compact?: boolean;
}) {
  const widthM = widthMm / 1000;
  const depthM = depthMm / 1000;

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
    (1 - footprintM2 / TYPICAL_FOOTPRINT_M2) * 100,
  );

  const gridLines = Math.ceil(maxExtent) + 1;

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${CANVAS} ${CANVAS}`}
        className="w-full"
        role="img"
        aria-label={`${nameKo} 설치 면적 ${footprintM2}제곱미터. 가로 ${widthMm}mm, 세로 ${depthMm}mm. 일반 기구 평균 ${TYPICAL_FOOTPRINT_M2}제곱미터와 비교.`}
      >
        {/* 바닥 격자 — 1m 단위 */}
        <g stroke="currentColor" className="text-ink-700" strokeWidth="0.25">
          {Array.from({ length: gridLines }, (_, i) => (
            <line
              key={`v${i}`}
              x1={originX + i * scale}
              y1={originY}
              x2={originX + i * scale}
              y2={originY - (CANVAS - PAD * 2)}
            />
          ))}
          {Array.from({ length: gridLines }, (_, i) => (
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

        {/*
          이 제품의 실제 설치 면적.

          data-fp-rect 는 쇼케이스가 잡는 손잡이다. 제품이 넘어갈 때
          앞 제품 크기에서 이 크기로 자라거나 줄어드는 연출을 건다.

          transform-box: fill-box + origin 좌하단 — 두 사각형이 같은
          좌하단 원점을 공유하므로, 스케일도 같은 모서리에서 일어나야
          "같은 자리에서 면적만 달라졌다"로 읽힌다.
        */}
        <rect
          data-fp-rect
          x={originX}
          y={originY - productD}
          width={productW}
          height={productD}
          className="fill-accent/85 stroke-accent"
          strokeWidth="0.6"
          style={{ transformBox: "fill-box", transformOrigin: "left bottom" }}
        />
      </svg>

      {!compact && (
        <figcaption className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-2 text-ink-300">
            {/* 범례 네모는 위 도형(fill-accent)과 같은 토큰을 쓴다. 하나만
                signal 로 두면 밝은 테마에서 "노랑 = 짐레코" 라고 적어 놓고
                정작 도형은 앰버가 되어 범례가 거짓말을 한다. */}
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-xs bg-accent"
            />
            짐레코{" "}
            <strong className="tabular font-semibold text-ink-100">
              {footprintM2}m²
            </strong>
            <span className="tabular text-ink-400">
              {formatPyeong(footprintM2)}
            </span>
          </span>
          <span className="flex items-center gap-2 text-ink-400">
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-xs border border-ink-600 bg-ink-700/40"
            />
            일반 기구 평균{" "}
            <span className="tabular">{TYPICAL_FOOTPRINT_M2}m²</span>
            <span className="tabular">{formatPyeong(TYPICAL_FOOTPRINT_M2)}</span>
          </span>
          {savedPercent > 0 && (
            <span className="tabular font-display font-bold text-accent">
              −{savedPercent}%
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
