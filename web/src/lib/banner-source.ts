import "server-only";

import { fetchBanners } from "@/lib/api";
import { imageSrcSet, imageUrl } from "@/lib/products-source";

/**
 * 페이지 맨 위에 걸리는 배너.
 *
 * ── 어느 것을 보여 주는가 ──
 *
 * 서버가 이미 «지금 보여도 되는 것» 만 걸러서 순서대로 준다 — 노출이 켜져 있고,
 * 시작일이 지났고, 종료일이 안 지난 것. 그래서 여기서는 맨 앞의 하나만 쓴다.
 * 여러 장을 돌려 보여 주는 것은 지금 필요하지 않다. 필요해지면 이 함수가
 * 배열을 그대로 넘기면 된다.
 *
 * ── 없으면 없는 대로 ──
 *
 * 배너가 없는 페이지가 더 많다. 없을 때 빈 상자를 남기면 «만들다 만 화면» 이
 * 되므로, 없으면 아예 아무것도 걸지 않고 지금의 머리글 그대로 둔다.
 */

export type BannerView = {
  pcUrl: string;
  pcSrcSet: string;
  mobileUrl: string;
  mobileSrcSet: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
};

export async function getBanner(position: string): Promise<BannerView | null> {
  const items = await fetchBanners(position);
  const b = items?.[0];
  if (!b?.imagePcKey || !b?.imageMobileKey) return null;

  return {
    pcUrl: imageUrl(b.imagePcKey, 1600),
    pcSrcSet: imageSrcSet(b.imagePcKey),
    mobileUrl: imageUrl(b.imageMobileKey, 800),
    mobileSrcSet: imageSrcSet(b.imageMobileKey),
    title: b.title || null,
    subtitle: b.subtitle || null,
    /*
     * 주소는 DOM 에 넣기 직전에 한 번 더 본다.
     * 서버가 저장 시점에 걸러 주지만, 예전에 들어간 값이 있을 수 있고
     * javascript: 로 시작하는 주소를 href 에 그대로 넣으면 클릭 한 번에 실행된다.
     */
    linkUrl: safeLink(b.linkUrl),
  };
}

function safeLink(url: string | null | undefined): string | null {
  if (!url) return null;
  // 사이트 안(/로 시작) 이거나 http(s) 인 것만 허용한다
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return /^https?:\/\//i.test(url) ? url : null;
}
