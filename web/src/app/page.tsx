import Link from "next/link";
import { FloatingCta } from "@/components/floating-cta";
import { SiteHeader } from "@/components/site-header";
import { HeroCopy } from "@/components/home/hero-copy";
import { LineupDisc } from "@/components/home/lineup-disc";
import { ProductShowcase } from "@/components/home/product-showcase";
import { getProducts } from "@/lib/products-source";

/**
 * 메인 — 스크롤 드리븐 쇼케이스 (기획서 §3)
 *
 * 이 페이지의 목표 행동은 "문의"다. 장바구니가 아니다.
 * 어떤 연출을 얹든 문의 진입로가 가려지면 실패다 (§3.4-4).
 *
 * 모든 텍스트는 서버에서 렌더된다. 애니메이션은 이미 존재하는 것을
 * 드러내는 방식이지, 없던 것을 만들어내는 방식이 아니다 (§3.4-5).
 */
export default async function Home() {
  const products = await getProducts("EQUIPMENT");

  return (
    <>
      {/*
        홈도 공통 헤더를 쓴다. 예전엔 자체 헤더에 제품·브랜드·문의 3개만
        있어서, 홈에서 시작한 사람은 중고·부품·공식 헬스장으로 가는 길이
        아예 보이지 않았다. 나머지 페이지에는 전체 메뉴가 있었으니
        홈에서만 길이 막혀 있던 셈이다.
      */}
      <SiteHeader />
      <main id="main" className="flex-1">
        {/*
          ── 0% 오프닝 ──────────────────────────────────────────

          히어로를 sticky 로 고정하고 다음 섹션들이 그 위를 덮으며
          올라오게 한다. 스크롤을 시작하는 순간 화면이 통째로 밀려나는
          대신, 뒤 내용이 히어로 위로 미끄러져 올라온다.

          ★ overflow-hidden 을 여기에 두면 안 된다.
            sticky 는 조상 중 하나라도 overflow 가 visible 이 아니면
            그 안에 갇혀 동작하지 않는다. 원판이 넘칠 일이 없으므로 뺐다.
        */}
        <section className="sticky top-0 z-0 flex h-[100svh] flex-col justify-between px-6 py-10 md:px-12 md:py-14">
          {/*
            글이 먼저, 원판이 뒤. DOM 순서를 이렇게 두어야 JS 없이도
            읽는 순서가 맞고, 스크린리더가 제목부터 만난다.
            원판은 aria-hidden 이라 보조기술에는 잡히지 않는다.
          */}
          {/*
            모바일은 제목 → 기구 → 설명 순서다.
            좁은 화면에서 글을 먼저 다 읽고 한참 내려가야 기구가 나오면
            "공간을 아는 기구" 라는 말과 실물이 따로 논다.
            데스크톱에서는 왼쪽 글 / 오른쪽 기구로 돌아간다.

            DOM 순서는 제목이 항상 먼저다 — 화면 배치만 grid-area 로 바꾼다.
          */}
          <div
            className="grid gap-8 [grid-template-areas:'head''disc''body'] lg:grid-cols-[minmax(0,1fr)_minmax(0,42rem)] lg:items-center lg:gap-x-12 lg:gap-y-0 lg:[grid-template-areas:'head_disc''body_disc']"
          >
            {/* head 와 body 두 칸을 채운다. 그 사이에 원판이 들어간다. */}
            <HeroCopy />

            <div className="[grid-area:disc]">
              <LineupDisc products={products} />
            </div>
          </div>

          <p
            aria-hidden="true"
            className="font-display text-[0.7rem] tracking-[0.25em] text-ink-400 uppercase"
          >
            Scroll
          </p>
        </section>

        {/*
          히어로 위를 덮으며 올라오는 부분.

          z-10 으로 히어로(z-0) 위에 올리고, 배경을 반드시 칠한다 —
          투명하면 sticky 로 남아 있는 히어로가 글자 사이로 비쳐 보인다.
        */}
        <div className="relative z-10 bg-ink-950">
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
        <ProductShowcase products={products} />

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
              <dt className="font-display text-sm tracking-[0.2em] text-accent uppercase">
                Direct from Sweden
              </dt>
              <dd className="mt-4 text-pretty text-ink-300">
                스웨덴 본사 직영 총판입니다. 수입 대리점을 거치지 않아
                중간 마진이 붙지 않고, 부품 조달 경로도 짧습니다.
              </dd>
            </div>
            <div>
              <dt className="font-display text-sm tracking-[0.2em] text-accent uppercase">
                Space Efficient
              </dt>
              <dd className="mt-4 text-pretty text-ink-300">
                같은 운동을 더 좁은 면적에서. 20~30평 피티샵에서도 라인업을
                온전히 갖출 수 있도록 설계돼 있습니다.
              </dd>
            </div>
            <div>
              <dt className="font-display text-sm tracking-[0.2em] text-accent uppercase">
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
                className="border-b border-accent text-accent hover:text-accent-hover"
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
        </div>
      </main>

      {/*
        플로팅 문의 버튼 — 연출 중에도 문의 진입로가 항상 열려 있어야 한다
        (§3.4-4). 이 사이트의 목표 행동은 장바구니가 아니라 문의다.
      */}
      <FloatingCta />
    </>
  );
}
