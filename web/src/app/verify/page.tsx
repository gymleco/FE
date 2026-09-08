import type { Metadata } from "next";

import { FloatingCta } from "@/components/floating-cta";
import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VerifyForm } from "@/components/verify-form";

export const metadata: Metadata = {
  title: "정품 확인",
  description:
    "짐레코 기구의 일련번호와 모델번호로 정품 여부를 확인합니다. 기구에 붙은 명판에서 두 번호를 읽어 입력해 주세요.",
  // 조회 결과는 사람마다 다르다. 검색에 걸릴 것은 이 안내 화면뿐이다.
  robots: { index: true, follow: true },
};

/**
 * 정품 확인.
 *
 * ── 왜 이 화면이 필요한가 ──
 *
 * 짐레코 기구를 베낀 물건이 돌아다닌다. 사는 쪽에서는 사진과 겉모습만으로
 * 가릴 수 없고, 특히 중고 시장에서 그렇다.
 *
 * ── 무엇을 약속하고 무엇을 약속하지 않는가 ──
 *
 * 「이 번호는 짐레코가 발급한 번호다」 까지가 우리가 말할 수 있는 것이다.
 * 「이 기구는 정품이다」 라고는 말하지 않는다 — 진짜 명판을 베껴 붙이면
 * 번호도 맞기 때문이다. 그 대신 «이 번호의 기구는 무엇인가» 를 알려 주고,
 * 눈앞의 기구와 대조하도록 시킨다. 대조하는 순간 복제가 드러난다.
 *
 * 안내 문구는 전부 서버에서 렌더된다. JS 가 늦어도 «무엇을 어디서 읽어
 * 입력하는가» 는 그대로 읽힌다 (FE/CLAUDE.md 연출 제약).
 */
export default function VerifyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Authenticity"
          title="정품 확인"
          description="기구에 붙은 명판에서 일련번호와 모델번호를 읽어 입력해 주세요. 짐레코가 발급한 번호인지, 그 번호의 기구가 무엇인지 알려 드립니다."
        />

        <section className="px-6 py-12 md:px-12">
          <VerifyForm />
        </section>

        <section className="border-t border-hairline px-6 py-14 md:px-12">
          <div className="mx-auto max-w-xl">
            <h2 className="font-display text-[0.68rem] tracking-[0.22em] text-accent uppercase">
              알아두실 것
            </h2>
            <dl className="mt-6 flex flex-col gap-6 text-sm">
              <div>
                <dt className="font-semibold text-ink-100">명판은 어디에 있나요</dt>
                <dd className="mt-1.5 text-ink-300">
                  대부분 프레임 아래쪽이나 웨이트 스택 옆에 붙어 있습니다.
                  일련번호와 모델번호가 함께 적혀 있습니다.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-100">
                  띄어쓰기나 대소문자가 달라도 되나요
                </dt>
                <dd className="mt-1.5 text-ink-300">
                  괜찮습니다. 하이픈·공백·대소문자는 저희가 맞춰서 찾습니다.
                  숫자와 글자만 명판 그대로 옮겨 적어 주세요.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-100">
                  번호가 맞으면 정품인가요
                </dt>
                <dd className="mt-1.5 text-ink-300">
                  번호가 맞다는 것은 <b className="text-ink-100">그 번호를 저희가
                  발급했다</b>는 뜻입니다. 진짜 기구의 명판을 베껴 붙인 경우에도
                  번호는 맞을 수 있으므로,{" "}
                  <b className="text-ink-100">
                    화면에 나온 기구가 눈앞의 기구와 같은지 꼭 확인
                  </b>
                  해 주세요.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-100">중고로 사려고 합니다</dt>
                <dd className="mt-1.5 text-ink-300">
                  구매 전에 확인해 보시길 권합니다. 결과가 이상하거나 판단이
                  어려우시면 문의로 알려 주세요 — 저희가 확인해 드립니다.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingCta />
    </>
  );
}
