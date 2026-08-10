import type { Metadata } from "next";
import Link from "next/link";

import {
  availableCount,
  CONDITION_DESC,
  CONDITION_LABEL,
  sortedUsedItems,
  STATUS_LABEL,
  type UsedItem,
} from "@/lib/used";
import { FloatingCta } from "@/components/floating-cta";
import { PageHeader } from "@/components/page-header";
import { SampleBadge } from "@/components/sample-badge";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "중고 기구",
  description:
    "짐레코 중고 헬스기구. 센터 리뉴얼·폐업으로 회수한 기구를 점검 후 판매합니다. 상태 등급과 연식을 명시하며, 재고는 수시로 바뀝니다.",
};

export default function UsedPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Used"
          title="중고 기구"
          description="센터 리뉴얼이나 폐업으로 회수한 기구를 점검·정비 후 판매합니다. 예산이 빠듯한 초기 창업에 현실적인 선택지입니다."
          aside={
            <span className="tabular font-display text-sm text-ink-400">
              현재 판매중{" "}
              <span className="text-signal">{availableCount}</span> 건
            </span>
          }
        />

        {/* 중고는 "상태를 믿을 수 있는가"가 구매 결정의 전부다 */}
        <section className="border-b border-hairline px-6 py-10 md:px-12">
          <h2 className="font-display text-[0.7rem] tracking-[0.28em] text-ink-400 uppercase">
            상태 등급 기준
          </h2>
          <dl className="mt-5 grid gap-4 md:grid-cols-3">
            {(["A", "B", "C"] as const).map((grade) => (
              <div key={grade} className="border border-hairline p-4">
                <dt className="flex items-center gap-2">
                  <span className="font-display flex size-7 items-center justify-center rounded-full border border-signal text-sm font-bold text-signal">
                    {grade}
                  </span>
                  <span className="font-semibold text-ink-100">
                    {CONDITION_LABEL[grade]}
                  </span>
                </dt>
                <dd className="mt-3 text-sm text-pretty text-ink-400">
                  {CONDITION_DESC[grade]}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm text-ink-400">
            모든 매물은 인수 후 점검을 거칩니다. 소모품(케이블·패드 등)은
            필요 시 교체 후 판매하며, 교체 내역을 함께 안내드립니다.
          </p>
        </section>

        <section className="px-6 py-12 md:px-12">
          {sortedUsedItems.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedUsedItems.map((item) => (
                <UsedCard key={item.slug} item={item} />
              ))}
            </ul>
          ) : (
            <div className="border border-hairline p-10 text-center">
              <p className="text-ink-300">
                현재 등록된 중고 매물이 없습니다.
              </p>
              <p className="mt-2 text-sm text-ink-400">
                찾으시는 기구를 알려주시면 입고 시 연락드리겠습니다.
              </p>
              <Link
                href="/contact?type=USED"
                className="mt-6 inline-block rounded-full bg-signal px-5 py-2.5 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
              >
                입고 알림 신청
              </Link>
            </div>
          )}
        </section>

        <section className="border-t border-hairline px-6 py-16 md:px-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink-100">
                재고는 수시로 바뀝니다
              </h2>
              <p className="mt-4 text-pretty text-ink-300">
                중고는 같은 모델이라도 상태와 연식이 제각각이라 한 대씩
                올라옵니다. 원하시는 기구가 목록에 없으면 알려주세요 —
                입고되면 먼저 연락드립니다.
              </p>
              <Link
                href="/contact?type=USED"
                className="mt-6 inline-block rounded-full bg-signal px-6 py-3 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
              >
                중고 문의 · 입고 알림
              </Link>
            </div>
            <div className="border-t border-hairline pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-10">
              <h3 className="font-semibold text-ink-100">
                기구를 처분하셔야 한다면
              </h3>
              <p className="mt-3 text-sm text-pretty text-ink-400">
                리뉴얼이나 폐업으로 기구를 정리하시는 경우 매입 상담도
                진행합니다. 모델과 연식, 대략적인 상태를 알려주시면
                방문 일정을 잡아 확인해 드립니다.
              </p>
            </div>
          </div>
        </section>
      </main>
      <FloatingCta label="중고 문의" />
    </>
  );
}

function UsedCard({ item }: { item: UsedItem }) {
  const sold = item.status === "SOLD";

  return (
    <li
      className={
        sold
          ? "flex flex-col gap-4 border border-hairline p-5 opacity-55"
          : "flex flex-col gap-4 border border-hairline p-5"
      }
    >
      <div className="flex aspect-4/3 items-center justify-center bg-ink-900">
        <span className="font-display text-[0.65rem] tracking-[0.2em] text-ink-600 uppercase">
          {item.modelName}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={
            sold
              ? "rounded-xs border border-ink-600 px-2 py-0.5 text-[0.68rem] text-ink-400"
              : "rounded-xs bg-signal px-2 py-0.5 text-[0.68rem] font-bold text-signal-ink"
          }
        >
          {STATUS_LABEL[item.status]}
        </span>
        <span className="font-display rounded-xs border border-ink-600 px-2 py-0.5 text-[0.68rem] text-ink-300">
          {item.conditionGrade}급 · {CONDITION_LABEL[item.conditionGrade]}
        </span>
        {item.isPlaceholder && <SampleBadge />}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-lg leading-snug font-bold text-ink-100">
          {item.nameKo}
        </h3>
        <p className="tabular text-sm text-ink-400">
          {item.yearMade ? `${item.yearMade}년식` : "연식 미상"}
          {item.quantity > 1 && ` · ${item.quantity}대`}
        </p>
        <p className="flex-1 text-sm text-pretty text-ink-400">
          {item.description}
        </p>

        <p className="tabular pt-1 font-semibold text-signal">
          {item.priceKrw
            ? `${item.priceKrw.toLocaleString("ko-KR")}원`
            : "가격 문의"}
        </p>
      </div>

      {!sold && (
        <Link
          href={`/contact?type=USED&item=${item.slug}`}
          className="border-t border-hairline pt-3 text-sm font-medium text-ink-100 transition-colors hover:text-signal"
        >
          이 매물 문의하기 →
        </Link>
      )}
    </li>
  );
}
