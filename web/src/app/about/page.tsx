import type { Metadata } from "next";
import Link from "next/link";

import { FloatingCta } from "@/components/floating-cta";
import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "About Gymleco",
  description:
    "스웨덴에서 만드는 상업용 헬스기구 짐레코. 화려한 디스플레이 대신 프레임과 베어링에 비용을 씁니다. 본사 직영 한국 총판.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Born in Sweden"
          title="스웨덴에서 만듭니다"
          description="짐레코는 상업용 헬스기구를 만듭니다. 가정용을 크게 만든 것이 아니라, 하루 수백 번 쓰이는 것을 전제로 설계합니다."
        />

        {/* ── 제조 철학 ── */}
        <section className="px-6 py-16 md:px-12 md:py-24">
          <div className="max-w-3xl">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.4rem)] leading-[1.3] font-semibold tracking-tight text-balance text-ink-100">
              좋은 기구는 조용합니다. 흔들리지 않고, 자주 고장 나지 않고,
              필요 이상으로 자리를 차지하지 않습니다.
            </h2>
            <p className="mt-8 text-pretty text-ink-300 md:text-lg">
              화면이 달린 기구가 늘고 있습니다. 짐레코는 그 경쟁에
              뛰어들지 않습니다. 대신 프레임의 두께와 용접 품질, 베어링의
              수명에 비용을 씁니다. 10년 뒤에도 처음과 같은 운동감을 내는
              것이 목표입니다.
            </p>
            <p className="mt-5 text-pretty text-ink-300 md:text-lg">
              디지털 기능을 원하신다면 다른 선택지가 더 나을 수 있습니다.
              저희가 잘하는 것은 오래 쓰는 기구를 좁은 공간에 넣는 일입니다.
            </p>
          </div>
        </section>

        {/* ── 세 가지 기준 ── */}
        <section className="border-t border-hairline px-6 py-16 md:px-12">
          <dl className="grid gap-10 md:grid-cols-3">
            <Pillar
              en="Durability"
              ko="내구성"
              body="상업용 기준으로 설계합니다. 하루 수백 회 사용을 전제로 프레임 두께와 용접부를 잡습니다. 소모품은 교체 가능한 구조로 만들어, 부품 하나 때문에 기구 전체를 버리지 않게 합니다."
            />
            <Pillar
              en="Space Efficiency"
              ko="공간 효율"
              body="같은 운동을 더 좁은 면적에서. 벽면 설치를 전제로 깊이를 줄이거나, 각도를 조정해 천장 높이 제약을 피합니다. 20~30평 피티샵에서도 라인업을 온전히 갖출 수 있습니다."
            />
            <Pillar
              en="Feel"
              ko="운동감"
              body="중량이 걸리는 궤적과 저항 곡선을 다듬습니다. 숫자로 표현하기 어려운 부분이라, 직접 써보시길 권합니다."
            />
          </dl>
        </section>

        {/* ── 한국 총판 ── */}
        <section className="border-t border-hairline px-6 py-16 md:px-12">
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-tight text-ink-100">
            한국 총판
          </h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-pretty text-ink-300">
                짐레코 코리아는 스웨덴 본사 직영 총판입니다. 수입 대리점을
                거치지 않습니다.
              </p>
              <ul className="mt-6 space-y-3 text-ink-300">
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-signal">
                    —
                  </span>
                  <span>중간 마진이 붙지 않습니다</span>
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-signal">
                    —
                  </span>
                  <span>
                    부품 조달 경로가 짧아 교체 대기 시간이 줄어듭니다
                  </span>
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-signal">
                    —
                  </span>
                  <span>
                    본사 기술 자료를 직접 받아 정비 기준이 일관됩니다
                  </span>
                </li>
              </ul>
            </div>
            <div className="border-t border-hairline pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-10">
              <h3 className="font-semibold text-ink-100">
                기구는 써봐야 압니다
              </h3>
              <p className="mt-3 text-pretty text-ink-400">
                사진과 스펙만으로 판단하기 어려운 것이 운동감입니다.
                가까운 공식 헬스장에서 직접 잡아보시거나, 무료 시연을
                신청하시면 일정을 잡아 드립니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/centers"
                  className="rounded-full border border-ink-600 px-5 py-2.5 text-sm text-ink-100 transition-colors hover:border-ink-300"
                >
                  공식 헬스장 보기
                </Link>
                <Link
                  href="/contact?type=DEMO"
                  className="rounded-full bg-signal px-5 py-2.5 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
                >
                  무료 시연 신청
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 창업 준비 중이라면 ── */}
        <section className="border-t border-hairline px-6 py-20 md:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[clamp(1.6rem,4vw,2.6rem)] leading-tight font-bold tracking-tight text-balance text-ink-100">
              공간을 알려주시면
              <br />
              배치안을 함께 그려 드립니다
            </h2>
            <p className="mt-6 text-pretty text-ink-300">
              평수와 천장 높이, 예상 회원 수만 알려주셔도 충분합니다.
              어떤 기구를 몇 대 넣을 수 있는지부터 같이 보시죠.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-block rounded-full bg-signal px-8 py-4 font-bold text-signal-ink transition-colors hover:bg-signal-hover"
            >
              견적 문의하기
            </Link>
          </div>
        </section>
      </main>
      <FloatingCta />
    </>
  );
}

function Pillar({ en, ko, body }: { en: string; ko: string; body: string }) {
  return (
    <div className="border-t border-hairline pt-6">
      <dt>
        <span className="font-display block text-sm tracking-[0.22em] text-signal uppercase">
          {en}
        </span>
        <span className="mt-2 block text-lg font-bold text-ink-100">{ko}</span>
      </dt>
      <dd className="mt-4 text-sm text-pretty text-ink-300">{body}</dd>
    </div>
  );
}
