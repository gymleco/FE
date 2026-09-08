/**
 * 짐레코 로고.
 *
 * ── 왜 두 장인가 ──
 *
 * 본사에서 받은 원본이 «가로형 흰색» 한 벌뿐이다. 이 사이트는 밝은 테마를
 * 함께 쓰므로, 흰 로고를 그대로 두면 밝은 바탕에서 통째로 사라진다.
 * 같은 파일의 알파는 건드리지 않고 색만 잉크색으로 바꾼 벌을 따로 두고,
 * 어느 쪽을 보일지는 CSS 가 고른다(globals.css `.logo-on-*`).
 *
 * 단색 흰 로고라 이 변환은 글자꼴을 하나도 바꾸지 않는다 —
 * 알파가 형태를 그대로 들고 있다.
 *
 * ── 왜 next/image 가 아닌가 ──
 *
 * 크기가 고정된 작은 정적 파일이다. 최적화 서버를 거칠 이유가 없고,
 * 이 프로젝트는 이미 같은 이유로 제품 사진에도 쓰지 않는다.
 *
 * ── 접근성 ──
 *
 * 두 장이 DOM 에 다 있으므로 alt 를 둘 다 주면 화면을 읽어 주는 사람에게
 * 「GYMLECO GYMLECO」 로 두 번 들린다. 이름은 감싸는 링크가 말하고,
 * 그림 자체는 장식으로 둔다.
 */
export function BrandLogo({
  /** 높이(px). 폭은 비율(300:79)로 따라간다. */
  height = 22,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const width = Math.round((height * 300) / 79);

  return (
    <span className={`inline-flex shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-white.png"
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        className="logo-on-dark h-auto"
        style={{ width, height }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-ink.png"
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        className="logo-on-light h-auto"
        style={{ width, height }}
      />
    </span>
  );
}
