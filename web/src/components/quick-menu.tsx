import { Suspense } from "react";

import { QuickMenuBar } from "@/components/quick-menu-bar";
import { KAKAO_CHAT_URL } from "@/lib/kakao";
import { getSiteInfo } from "@/lib/settings-source";

/**
 * 퀵메뉴 — 서버 쪽 껍데기.
 *
 * 대표 전화는 관리 화면의 사이트 설정에서, 카카오 채널은 환경변수에서 온다.
 * 둘 다 서버에서 읽어 넘기고, 화면에 따라 달라지는 부분(지금 어느 화면인가)은
 * 브라우저 쪽 QuickMenuBar 가 맡는다.
 *
 * ★ Suspense 로 감싼다.
 *   QuickMenuBar 는 usePathname 을 쓴다. Next 16 문서에 따르면
 *   cacheComponents 를 켜면, 빌드 때 모르는 동적 주소(제품 상세 등)에서
 *   usePathname 이 멈추고, 감싸는 경계가 없으면 빌드가 실패한다.
 *   지금은 그 설정을 쓰지 않지만, 켜는 날 빌드가 깨지지 않게 미리 둔다.
 *   멈추더라도 최악은 «퀵메뉴가 조금 늦게 뜬다» 이지 화면이 비는 게 아니다.
 */
export async function QuickMenu() {
  const site = await getSiteInfo();

  return (
    <Suspense fallback={null}>
      <QuickMenuBar chatUrl={KAKAO_CHAT_URL} phone={site.phone?.trim() ?? ""} />
    </Suspense>
  );
}
