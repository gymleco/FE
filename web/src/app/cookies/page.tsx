import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";
import { LegalBody, LegalDraftNotice, LegalSection } from "@/components/legal";
import { ANALYTICS_ENABLED, GA_ID } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "쿠키 정책",
  robots: { index: true, follow: false },
};

/**
 * ⚠️ 법적 문서다. 게시 전에 검토받아야 한다.
 *
 * ── 이 문서는 «지금 실제로 무엇을 저장하는가» 를 적은 것이다 ──
 *
 * 남의 쿠키 정책을 베껴 오면 광고·분석 쿠키 목록이 통째로 따라온다.
 * 쓰지도 않는 쿠키를 쓴다고 적어 두는 것은 거짓 고지다.
 *
 * 확인한 사실(2026-09-10 기준):
 *   - 공개 사이트의 모든 응답에 Set-Cookie 가 없다. 실제로 확인했다.
 *   - 저장하는 것은 화면 밝기 설정 하나이고, 쿠키가 아니라
 *     localStorage 다 (app/layout.tsx 의 THEME_BOOTSTRAP, theme-toggle.tsx).
 *
 * ── 문서가 코드보다 늦지 않게 하는 방법 ──
 *
 * 분석 도구를 붙이는 날 이 문서를 고치는 것을 «사람이 기억하는» 방식은
 * 반드시 한 번은 어긋난다. 고지가 늦으면 «고지 없이 수집한 기간» 이
 * 생기고, 그건 나중에 문서를 고쳐도 되돌릴 수 없다.
 *
 * 그래서 이 문서가 스크립트·CSP 와 «같은 환경변수» 를 읽는다.
 * 측정 ID 를 넣는 순간 아래 문구도 같이 바뀐다. 사람의 기억에
 * 기대지 않는다. → src/lib/analytics.ts
 */
export default function CookiesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Cookies"
          title="쿠키 정책"
          description={
            ANALYTICS_ENABLED
              ? "이 사이트는 방문 통계를 파악하기 위해 분석 도구를 사용합니다. 광고·추적 목적으로는 사용하지 않습니다."
              : "이 사이트는 광고·분석용 쿠키를 사용하지 않습니다. 저장하는 것은 화면 밝기 설정 하나뿐입니다."
          }
        />

        <LegalBody>
          <LegalDraftNotice>
            현재 문서는 초안입니다. 사업자 정보와 시행일이 확정되면 정식
            게시됩니다.
          </LegalDraftNotice>

          <LegalSection title="1. 쿠키란">
            <p>
              쿠키는 웹사이트가 방문자의 브라우저에 저장하는 작은 기록입니다.
              로그인 상태를 유지하거나, 방문자의 행동을 분석하거나, 광고를
              맞춤 노출하는 데 쓰입니다.
            </p>
          </LegalSection>

          {ANALYTICS_ENABLED ? (
            <LegalSection title="2. 이 사이트가 쓰는 분석 도구">
              <p>
                방문자 수와 어떤 화면이 많이 읽히는지를 파악하기 위해 구글
                애널리틱스(Google Analytics 4)를 사용합니다. 측정 ID 는{" "}
                <span className="font-mono text-xs text-ink-100">{GA_ID}</span>{" "}
                입니다.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>방문 화면, 머문 시간, 유입 경로, 기기·브라우저 종류</li>
                <li>
                  접속 IP 는 마지막 자리를 지운 상태로 처리합니다(IP 익명화)
                </li>
              </ul>
              <p className="mt-3">
                <strong className="text-ink-100">
                  광고 재타겟팅에는 사용하지 않으며,
                </strong>{" "}
                수집한 자료를 광고 목적으로 제3자에게 제공하지 않습니다.
                이름·연락처 같은 문의 정보는 분석 도구로 전송되지 않습니다.
              </p>
              <p className="mt-3">
                이 도구는 미국에 서버를 둔 Google LLC 가 운영하므로, 위 항목이
                국외로 이전됩니다. 자세한 내용은{" "}
                <Link
                  href="/privacy"
                  className="border-b border-accent text-accent hover:text-accent-hover"
                >
                  개인정보처리방침
                </Link>
                에서 확인하실 수 있습니다.
              </p>
            </LegalSection>
          ) : (
            <LegalSection title="2. 이 사이트가 쓰지 않는 것">
              <p>
                짐레코 코리아 웹사이트는{" "}
                <strong className="text-ink-100">
                  광고 쿠키, 분석 쿠키, 제3자 추적 스크립트를 사용하지 않습니다.
                </strong>
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>구글 애널리틱스 등 방문자 분석 도구를 넣지 않았습니다</li>
                <li>광고 재타겟팅용 픽셀을 넣지 않았습니다</li>
                <li>다른 회사와 방문 기록을 주고받지 않습니다</li>
              </ul>
              <p className="mt-3">
                그래서 이 사이트에는 쿠키 동의 배너가 없습니다. 동의를 받을 만한
                쿠키를 애초에 심지 않기 때문입니다.
              </p>
            </LegalSection>
          )}

          <LegalSection title="3. 이 사이트가 저장하는 것">
            {!ANALYTICS_ENABLED && (
              <p>
                저장하는 항목은 하나이며, 쿠키가 아니라 브라우저의 로컬 저장소를
                씁니다. 로컬 저장소에 담긴 값은 서버로 전송되지 않습니다.
              </p>
            )}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-ink-400">
                    <th className="py-2 pr-4 font-medium">이름</th>
                    <th className="py-2 pr-4 font-medium">담는 값</th>
                    <th className="py-2 pr-4 font-medium">쓰는 이유</th>
                    <th className="py-2 font-medium">보관 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-hairline align-top">
                    <td className="py-3 pr-4 font-mono text-xs text-ink-100">
                      gymleco-theme
                    </td>
                    <td className="py-3 pr-4">light 또는 dark</td>
                    <td className="py-3 pr-4">
                      선택하신 화면 밝기를 다음 방문에도 유지하기 위해
                    </td>
                    <td className="py-3">직접 지우실 때까지</td>
                  </tr>
                  {ANALYTICS_ENABLED && (
                    <>
                      <tr className="border-b border-hairline align-top">
                        <td className="py-3 pr-4 font-mono text-xs text-ink-100">
                          _ga
                        </td>
                        <td className="py-3 pr-4">임의로 생성된 방문자 구분값</td>
                        <td className="py-3 pr-4">
                          같은 방문자의 재방문을 한 사람으로 세기 위해
                        </td>
                        <td className="py-3">2년</td>
                      </tr>
                      <tr className="border-b border-hairline align-top">
                        <td className="py-3 pr-4 font-mono text-xs text-ink-100">
                          _ga_&lt;측정ID&gt;
                        </td>
                        <td className="py-3 pr-4">방문 세션 상태</td>
                        <td className="py-3 pr-4">
                          한 번의 방문이 어디서 시작해 어디서 끝났는지 잇기 위해
                        </td>
                        <td className="py-3">2년</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              화면 밝기 값에는 이름·연락처 같은 개인정보가 들어 있지 않으며,
              방문자를 식별하는 데 쓰이지 않습니다. 지우시면 화면 밝기가
              기본값으로 돌아갈 뿐 다른 기능에는 영향이 없습니다.
            </p>
          </LegalSection>

          <LegalSection title="4. 관리자 화면의 쿠키">
            <p>
              직원용 관리자 화면(별도 주소)은 로그인 상태를 유지하기 위해 세션
              쿠키를 사용합니다. 이 쿠키는 로그인에 반드시 필요한 항목이며
              일반 방문자에게는 발급되지 않습니다.
            </p>
          </LegalSection>

          <LegalSection title="5. 저장된 값을 지우거나 거부하는 방법">
            <p>
              브라우저 설정에서 이 사이트의 저장 데이터를 지우시면 됩니다.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-ink-100">크롬</strong> — 설정 &rsaquo;
                개인정보 보호 및 보안 &rsaquo; 서드 파티 쿠키 · 사이트 데이터
              </li>
              <li>
                <strong className="text-ink-100">사파리</strong> — 설정 &rsaquo;
                개인정보 보호 &rsaquo; 웹사이트 데이터 관리
              </li>
              <li>
                <strong className="text-ink-100">엣지</strong> — 설정 &rsaquo;
                쿠키 및 사이트 권한 &rsaquo; 쿠키 및 사이트 데이터 관리
              </li>
            </ul>
            {ANALYTICS_ENABLED && (
              <p className="mt-3">
                분석에 집계되는 것 자체를 원하지 않으시면, 구글이 제공하는
                차단 프로그램(Google Analytics 옵트아웃 브라우저 부가기능)을
                설치하시면 됩니다.
              </p>
            )}
            <p className="mt-3">
              브라우저에서 저장을 아예 차단하셔도 사이트는 정상 동작합니다.
              화면 밝기가 매번 기본값으로 시작할 뿐입니다.
            </p>
          </LegalSection>

          <LegalSection title="6. 이 정책이 바뀌는 경우">
            <p>
              {ANALYTICS_ENABLED
                ? "분석·광고 도구를 새로 도입하거나 수집 항목이 달라지면, 적용 전에 이 문서를 먼저 고쳐 무엇이 달라지는지 밝힙니다."
                : "앞으로 방문자 분석 도구를 도입하게 되면, 도입 전에 이 문서를 먼저 고쳐 어떤 도구가 무엇을 수집하는지 밝히고 필요한 동의 절차를 마련합니다."}
            </p>
            <p className="mt-3">
              개인정보 전반의 처리에 관한 사항은{" "}
              <Link
                href="/privacy"
                className="border-b border-accent text-accent hover:text-accent-hover"
              >
                개인정보처리방침
              </Link>
              에서 확인하실 수 있습니다.
            </p>
          </LegalSection>

          <LegalSection title="7. 시행일">
            <p className="text-ink-400">이 정책은 —— 부터 적용됩니다.</p>
          </LegalSection>
        </LegalBody>
      </main>
    </>
  );
}
