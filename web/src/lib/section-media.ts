import "server-only";

import { fetchSectionMedia } from "@/lib/api";
import { imageSrcSet, imageUrl } from "@/lib/products-source";

/**
 * 구역 배경 이미지 — 대표님이 관리 화면에서 올리는 사진.
 *
 * ── 없으면 없는 대로 ──
 *
 * 아직 사진을 못 받은 구역이 많다. 없을 때 깨진 그림이나 빈 상자를 보여 주면
 * "만들다 만 화면" 이 되므로, 없으면 아예 배경을 걸지 않고 지금의 모습 그대로
 * 둔다. 사진이 들어오는 순간 화면이 바뀐다.
 *
 * ── PC · 모바일을 따로 받는 이유 ──
 *
 * 같은 사진을 두 화면에 쓰면 한쪽이 반드시 어색해진다. 가로로 넓은 사진을
 * 세로 화면에 깔면 가운데만 크게 잘리고, 반대는 위아래가 텅 빈다.
 * 서버가 둘 다 필수로 받는 이유이기도 하다.
 */

export type SectionMedia = {
  pcUrl: string;
  pcSrcSet: string;
  mobileUrl: string;
  mobileSrcSet: string;
  alt: string;
};

export async function getSectionMedia(
  key: string,
): Promise<SectionMedia | null> {
  const all = await fetchSectionMedia();
  const m = all?.[key];
  if (!m?.pc || !m?.mobile) return null;

  return {
    pcUrl: imageUrl(m.pc, 1600),
    pcSrcSet: imageSrcSet(m.pc),
    mobileUrl: imageUrl(m.mobile, 800),
    mobileSrcSet: imageSrcSet(m.mobile),
    /*
     * 장식용 배경이면 alt 는 빈 문자열이 맞다. 화면을 읽어 주는 사람에게
     * "왜 짐레코인가 사진" 이라고 말해 봐야 아무 정보도 되지 않는다.
     * 관리 화면에서 받은 설명은 title 로만 남긴다.
     */
    alt: "",
  };
}
