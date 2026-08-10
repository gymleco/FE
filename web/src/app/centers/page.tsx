import type { Metadata } from "next";
import Link from "next/link";

import { centersByRegion, officialCenters } from "@/lib/centers";
import { findProduct } from "@/lib/catalog";
import { FloatingCta } from "@/components/floating-cta";
import { PageHeader } from "@/components/page-header";
import { SampleBadge } from "@/components/sample-badge";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "짐레코 공식 헬스장",
  description:
    "짐레코 기구를 도입한 오피셜 센터. 직접 운동해 보고 결정하실 수 있습니다. 가까운 센터에서 기구를 체험하세요.",
};

export default function CentersPage() {
  const regions = Object.keys(centersByRegion);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Official Centers"
          title="짐레코 공식 헬스장"
          description="짐레코 기구를 도입한 센터입니다. 카탈로그 사진보다 직접 잡아보고 움직여 보는 편이 빠릅니다. 방문 전 센터에 이용 가능 여부를 확인해 주세요."
        />

        {officialCenters.length > 0 ? (
          <>
            <section className="px-6 py-12 md:px-12">
              {regions.map((region) => (
                <div key={region} className="mb-14 last:mb-0">
                  <h2 className="font-display border-b border-hairline pb-3 text-sm tracking-[0.25em] text-signal uppercase">
                    {region}
                  </h2>
                  <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {centersByRegion[region].map((center) => (
                      <li
                        key={center.slug}
                        className="flex flex-col gap-4 border border-hairline p-5"
                      >
                        <div className="flex aspect-4/3 items-center justify-center bg-ink-900">
                          <span className="font-display text-[0.65rem] tracking-[0.2em] text-ink-600 uppercase">
                            Center Photo
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg leading-snug font-bold text-ink-100">
                              {center.name}
                            </h3>
                            {center.isPlaceholder && <SampleBadge />}
                          </div>

                          <p className="text-sm text-ink-400">
                            {center.address}
                          </p>
                          <p className="flex-1 text-sm text-pretty text-ink-300">
                            {center.summary}
                          </p>

                          <dl className="tabular flex flex-wrap gap-x-5 gap-y-1 pt-1 text-sm text-ink-400">
                            {center.areaPyeong && (
                              <div className="flex gap-1.5">
                                <dt>규모</dt>
                                <dd className="text-ink-100">
                                  {center.areaPyeong}평
                                </dd>
                              </div>
                            )}
                            {center.openedAt && (
                              <div className="flex gap-1.5">
                                <dt>도입</dt>
                                <dd className="text-ink-100">
                                  {center.openedAt}
                                </dd>
                              </div>
                            )}
                          </dl>

                          {center.equipmentSlugs.length > 0 && (
                            <div className="border-t border-hairline pt-3">
                              <p className="text-xs text-ink-400">도입 기구</p>
                              <ul className="mt-2 flex flex-wrap gap-1.5">
                                {center.equipmentSlugs.map((slug) => {
                                  const product = findProduct(slug);
                                  if (!product) return null;
                                  return (
                                    <li key={slug}>
                                      <Link
                                        href={`/products/${slug}`}
                                        className="inline-block rounded-full border border-ink-700 px-2.5 py-1 text-xs text-ink-300 transition-colors hover:border-signal hover:text-signal"
                                      >
                                        {product.nameKo}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <p className="px-6 pb-12 text-sm text-ink-400 md:px-12">
              센터 정보는 각 센터의 게재 동의를 받아 표시하고 있습니다.
              운영 시간·이용 조건은 센터마다 다르므로 방문 전 확인해 주세요.
            </p>
          </>
        ) : (
          <section className="px-6 py-16 md:px-12">
            <div className="border border-hairline p-10 text-center">
              <p className="text-ink-300">
                공개된 공식 헬스장이 아직 없습니다.
              </p>
              <p className="mt-2 text-sm text-ink-400">
                시연을 원하시면 직접 방문 일정을 잡아 드립니다.
              </p>
              <Link
                href="/contact?type=DEMO"
                className="mt-6 inline-block rounded-full bg-signal px-5 py-2.5 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
              >
                무료 시연 신청
              </Link>
            </div>
          </section>
        )}

        {/* ── 오피셜 센터 제도 ── */}
        <section className="border-t border-hairline px-6 py-16 md:px-12">
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-tight text-ink-100">
            오피셜 센터 제도
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-ink-300">
            짐레코 기구로 센터를 구성하시면 오피셜 센터로 등록하실 수
            있습니다. 브랜드 노출과 운영 지원을 함께 받습니다.
          </p>

          <dl className="mt-10 grid gap-8 md:grid-cols-3">
            <Benefit
              title="공식 사이트 노출"
              body="이 페이지와 지역 검색에 센터가 노출됩니다. 시연을 원하는 방문자가 가까운 센터를 찾습니다."
            />
            <Benefit
              title="시연 거점"
              body="기구 도입을 검토하는 분들이 방문합니다. 센터 입장에서도 신규 회원 접점이 됩니다."
            />
            <Benefit
              title="운영 지원"
              body="부품 우선 공급과 정기 점검을 지원합니다. 구체적인 조건은 문의 시 안내드립니다."
            />
          </dl>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/contact?type=OFFICIAL"
              className="rounded-full bg-signal px-6 py-3 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
            >
              오피셜 센터 신청 · 문의
            </Link>
            <p className="text-sm text-ink-400">
              등록 조건은 센터 규모와 도입 기구 구성에 따라 달라집니다.
            </p>
          </div>
        </section>
      </main>
      <FloatingCta label="시연 · 오피셜 센터 문의" />
    </>
  );
}

function Benefit({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-hairline pt-5">
      <dt className="font-display text-sm tracking-[0.18em] text-signal uppercase">
        {title}
      </dt>
      <dd className="mt-3 text-sm text-pretty text-ink-300">{body}</dd>
    </div>
  );
}
