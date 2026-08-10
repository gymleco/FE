import Link from "next/link";
import { ProductShowcase } from "@/components/home/product-showcase";

/**
 * 메인 — 스크롤 드리븐 쇼케이스 (기획서 §3)
 *
 * 이 페이지의 목표 행동은 "문의"다. 장바구니가 아니다.
 * 어떤 연출을 얹든 문의 진입로가 가려지면 실패다 (§3.4-4).
 *
 * 모든 텍스트는 서버에서 렌더된다. 애니메이션은 이미 존재하는 것을
 * 드러내는 방식이지, 없던 것을 만들어내는 방식이 아니다 (§3.4-5).
 */
export default function Home() {
  return (
    <>
      <main id="main" className="flex-1">
        {/* ── 0% 오프닝 ──────────────────────────────────────── */}
        <section className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-6 py-10 md:px-12 md:py-14">
          <header className="flex items-baseline justify-between">
            <span className="font-display text-lg font-black tracking-[0.18em] text-ink-100">
              GYMLECO
            </span>
            <nav aria-label="주요" className="flex gap-6 text-sm">
              <Link href="/products" className="text-ink-300 hover:text-ink-100">
                제품
              </Link>
              <Link href="/about" className="text-ink-300 hover:text-ink-100">
                브랜드
              </Link>
              <Link href="/contact" className="text-ink-300 hover:text-ink-100">
                문의
              </Link>
            </nav>
          </header>

          <div className="max-w-4xl">
            <p className="font-display text-[0.7rem] tracking-[0.4em] text-signal uppercase">
              Born in Sweden
            </p>

            <h1 className="mt-6 text-[clamp(2.25rem,7vw,5.5rem)] leading-[1.05] font-bold tracking-tight text-balance text-ink-100">
              스웨덴에서 온,
              <br />
              공간을 아는 기구
            </h1>

            <p className="mt-8 max-w-xl text-pretty text-ink-300 md:text-lg">
              본사 직영이라 중간 마진이 없습니다. 컴팩트 설계로 20~30평
              피티샵에도 들어가고, 유지보수는 최소한으로 줄였습니다.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-signal px-6 py-3 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
              >
                무료 시연 신청
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-ink-600 px-6 py-3 text-sm font-medium text-ink-100 transition-colors hover:border-ink-300"
              >
                제품 라인업 보기
              </Link>
            </div>
          </div>

          <p
            aria-hidden="true"
            className="font-display text-[0.7rem] tracking-[0.25em] text-ink-400 uppercase"
          >
            Scroll
          </p>
        </section>

        {/* ── 10% 브랜드 스테이트먼트 ─────────────────────────── */}
        <section className="border-t border-hairline px-6 py-28 md:px-12 md:py-40">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] leading-[1.25] font-semibold tracking-tight text-balance text-ink-100">
              좋은 기구는 조용합니다. 흔들리지 않고, 자주 고장 나지 않고,
              필요 이상으로 자리를 차지하지 않습니다.
            </h2>
            <p className="mt-10 max-w-2xl text-pretty text-ink-300 md:text-lg">
              짐레코는 1985년부터 스웨덴에서 상업용 헬스기구를 만들어
              왔습니다. 화려한 디스플레이 대신 프레임의 두께와 용접,
              베어링의 수명에 비용을 씁니다. 10년 뒤에도 처음과 같은
              운동감을 내는 것이 목표입니다.
            </p>
          </div>
        </section>

        {/* ── 20~70% 제품 라인업 시퀀스 ★ 핵심 ────────────────── */}
        <ProductShowcase />

        {/* ── 70% 신뢰 구간 ──────────────────────────────────── */}
        <section
          aria-labelledby="trust-heading"
          className="border-t border-hairline px-6 py-24 md:px-12 md:py-32"
        >
          <h2
            id="trust-heading"
            className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-tight text-ink-100"
          >
            왜 짐레코인가
          </h2>

          <dl className="mt-14 grid gap-12 md:grid-cols-3">
            <div>
              <dt className="font-display text-sm tracking-[0.2em] text-signal uppercase">
                Direct from Sweden
              </dt>
              <dd className="mt-4 text-pretty text-ink-300">
                스웨덴 본사 직영 총판입니다. 수입 대리점을 거치지 않아
                중간 마진이 붙지 않고, 부품 조달 경로도 짧습니다.
              </dd>
            </div>
            <div>
              <dt className="font-display text-sm tracking-[0.2em] text-signal uppercase">
                Space Efficient
              </dt>
              <dd className="mt-4 text-pretty text-ink-300">
                같은 운동을 더 좁은 면적에서. 20~30평 피티샵에서도 라인업을
                온전히 갖출 수 있도록 설계돼 있습니다.
              </dd>
            </div>
            <div>
              <dt className="font-display text-sm tracking-[0.2em] text-signal uppercase">
                Official Center
              </dt>
              <dd className="mt-4 text-pretty text-ink-300">
                오피셜 센터로 등록되면 브랜드 노출과 운영 지원을 함께
                받습니다. 조건은 문의 시 안내해 드립니다.
              </dd>
            </div>
          </dl>

          <div className="mt-16 border-t border-hairline pt-10">
            <p className="text-ink-400">
              기구를 직접 써보고 결정하시는 편이 빠릅니다.{" "}
              <Link
                href="/contact"
                className="border-b border-signal text-signal hover:text-signal-hover"
              >
                무료 시연을 신청
              </Link>
              하시면 담당자가 일정을 잡아 연락드립니다.
            </p>
          </div>
        </section>

        {/* ── 80% 소식 ───────────────────────────────────────── */}
        <section
          aria-labelledby="news-heading"
          className="border-t border-hairline px-6 py-24 md:px-12"
        >
          <div className="flex items-baseline justify-between">
            <h2
              id="news-heading"
              className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-tight text-ink-100"
            >
              짐레코 소식
            </h2>
            <Link
              href="/news"
              className="text-sm text-ink-300 hover:text-ink-100"
            >
              전체 보기 →
            </Link>
          </div>

          {/* CMS 연동 전. 실제 데이터는 API 에서 최근 3건을 가져온다. */}
          <p className="mt-10 text-ink-400">
            등록된 소식이 아직 없습니다.
          </p>
        </section>

        {/* ── 90% 문의 CTA ───────────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          className="border-t border-hairline px-6 py-28 md:px-12 md:py-40"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="cta-heading"
              className="text-[clamp(1.9rem,5vw,3.5rem)] leading-tight font-bold tracking-tight text-balance text-ink-100"
            >
              공간을 알려주시면
              <br />
              배치안을 함께 그려 드립니다
            </h2>
            <p className="mt-8 text-pretty text-ink-300 md:text-lg">
              평수와 천장 높이, 예상 회원 수만 알려주셔도 충분합니다.
              견적과 배치안을 같이 보내 드립니다.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-signal px-8 py-4 font-bold text-signal-ink transition-colors hover:bg-signal-hover"
              >
                견적 문의하기
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-ink-600 px-8 py-4 font-medium text-ink-100 transition-colors hover:border-ink-300"
              >
                무료 시연 신청
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/*
        플로팅 문의 버튼 — 연출 중에도 문의 진입로가 항상 열려 있어야 한다
        (§3.4-4). 이 사이트의 목표 행동은 장바구니가 아니라 문의다.
      */}
      <Link
        href="/contact"
        className="fixed right-5 bottom-5 z-40 rounded-full bg-signal px-5 py-3 text-sm font-bold text-signal-ink shadow-lg transition-colors hover:bg-signal-hover md:right-8 md:bottom-8"
      >
        견적 · 무료 시연 문의
      </Link>
    </>
  );
}
