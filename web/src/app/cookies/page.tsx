import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";
import { LegalBody, LegalDraftNotice, LegalSection } from "@/components/legal";

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
 *   - 분석·광고 스크립트가 하나도 없다.
 *
 * ★ 분석 도구(GA 등)를 붙이는 날, 코드보다 이 문서를 먼저 고친다.
 *   순서가 뒤집히면 «고지 없이 수집한 기간» 이 생긴다. 되돌릴 수 없다.
 */
export default function CookiesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Cookies"
          title="쿠키 정책"
          description="이 사이트는 광고·분석용 쿠키를 사용하지 않습니다. 저장하는 것은 화면 밝기 설정 하나뿐입니다."
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

          <LegalSection title="3. 이 사이트가 저장하는 것">
            <p>
              저장하는 항목은 하나이며, 쿠키가 아니라 브라우저의 로컬 저장소를
              씁니다. 로컬 저장소에 담긴 값은 서버로 전송되지 않습니다.
            </p>

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
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              이 값에는 이름·연락처 같은 개인정보가 들어 있지 않으며, 방문자를
              식별하는 데 쓰이지 않습니다. 지우시면 화면 밝기가 기본값으로
              돌아갈 뿐 다른 기능에는 영향이 없습니다.
            </p>
          </LegalSection>

          <LegalSection title="4. 관리자 화면의 쿠키">
            <p>
              직원용 관리자 화면(별도 주소)은 로그인 상태를 유지하기 위해 세션
              쿠키를 사용합니다. 이 쿠키는 로그인에 반드시 필요한 항목이며
              일반 방문자에게는 발급되지 않습니다.
            </p>
          </LegalSection>

          <LegalSection title="5. 저장된 값을 지우는 방법">
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
            <p className="mt-3">
              브라우저에서 저장을 아예 차단하셔도 사이트는 정상 동작합니다.
              화면 밝기가 매번 기본값으로 시작할 뿐입니다.
            </p>
          </LegalSection>

          <LegalSection title="6. 이 정책이 바뀌는 경우">
            <p>
              앞으로 방문자 분석 도구를 도입하게 되면, 도입 전에 이 문서를 먼저
              고쳐 어떤 도구가 무엇을 수집하는지 밝히고 필요한 동의 절차를
              마련합니다.
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
