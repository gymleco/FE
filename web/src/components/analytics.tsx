import Script from "next/script";

import { GA_ID } from "@/lib/analytics";

/**
 * 구글 애널리틱스 삽입.
 *
 * 측정 ID 가 없으면 아무것도 그리지 않는다 — 지금이 그 상태다.
 * 켜는 방법은 lib/analytics.ts 에 적어 두었다.
 *
 * ★ afterInteractive 로 둔다.
 *   beforeInteractive 는 분석 스크립트를 첫 화면 그리기 앞줄에 세운다.
 *   이 사이트의 목표 행동은 문의이고, 그 앞을 가로막을 만한 값어치가
 *   분석 스크립트에는 없다. 기획서 §3.4 의 «첫 화면 2.5초» 도 지켜야 한다.
 *
 * ★ 이 컴포넌트가 붙어도 CSP 는 저절로 열리지 않는다.
 *   next.config.ts 가 같은 환경변수를 읽어 구글 도메인을 허용한다.
 *   둘이 갈라지면 스크립트가 «에러 화면 없이» 차단돼, 붙인 줄 알고
 *   며칠 지나서야 데이터가 안 쌓인 것을 알게 된다.
 */
export function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());
gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
