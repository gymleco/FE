import Link from "next/link";
import { FloatingCta } from "@/components/floating-cta";
import { SiteHeader } from "@/components/site-header";
import { HeroStage } from "@/components/home/hero-stage";
import { getSectionMedia } from "@/lib/section-media";
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
  const [products, whyMedia] = await Promise.all([
    getProducts("EQUIPMENT"),
    getSectionMedia("home.why"),
  ]);

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
        {/*
          맨 위에 있는지 알려 주는 표식.

          히어로 자체에 표시를 달 수 없다 — sticky 라 스크롤해도 뒤에 남아
          화면을 영영 벗어나지 않기 때문이다. 대신 «고정되지 않는» 이 한 줄을
          두면, 이게 보이는 동안이 곧 «첫 화면» 이다.
          첫 화면에는 이미 큰 버튼 두 개가 있으니 떠 있는 버튼은 비킨다.
        */}
        <div data-cta-anchor aria-hidden="true" className="h-px" />

        {/*
          히어로 — 기구 한 대를 크게, 옆 기구는 살짝 걸치게.

          sticky 로 두어 다음 구역이 그 위를 덮으며 올라온다. 스크롤을
          시작하는 순간 화면이 통째로 밀려나는 대신 뒤 내용이 미끄러져 온다.

          ★ overflow-hidden 을 여기에 두면 안 된다.
            sticky 는 조상 중 하나라도 overflow 가 visible 이 아니면
            그 안에 갇혀 동작하지 않는다.
        */}
        <section className="sticky top-0 z-0 flex h-[100svh] flex-col">
          {/*
            h-full 이 아니라 flex-1 이다. h-full 을 주면 히어로가 세로를
            다 먹어 아래 「Scroll」 이 화면 밖으로 밀려난다.
          */}
          <div className="min-h-0 flex-1">
            <HeroStage products={products} />
          </div>

          <p
            aria-hidden="true"
            className="font-display px-6 pb-6 text-[0.7rem] tracking-[0.25em] text-ink-400 uppercase md:px-12 md:pb-8"
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
        {/*
          구역마다 바탕을 갈라놓는다.
          10,000px 을 내려가는 동안 배경이 한 번도 안 바뀌면, 내용이 달라져도
          «같은 화면이 계속된다» 로 읽힌다. 한 단씩만 옮겨도 스크롤에 마디가 생긴다.
        */}
        <section className="border-t border-hairline bg-ink-900 px-6 py-28 md:px-12 md:py-40">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] leading-[1.25] font-semibold tracking-tight text-balance text-ink-100">
              좋은 기구는 조용합니다. 흔들리지 않고, 자주 고장 나지 않고,
              필요 이상으로 자리를 차지하지 않습니다.
            </h2>
            <p className="mt-10 max-w-2xl text-pretty text-ink-300 md:text-lg">
              {/*
                연도는 본사(gymleco.com)가 「Strength training equipment from
                Sweden — Since 1994」 라고 쓰는 값에 맞춘다. 예전에 1985 로
                적혀 있었는데 근거가 없는 숫자였다. 회사 연혁은 지어내면
                안 되는 종류의 사실이다.
              */}
              짐레코는 1994년부터 스웨덴에서 상업용 헬스기구를 만들어
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
          className="relative isolate overflow-hidden border-t border-hairline px-6 py-24 md:px-12 md:py-32"
        >
          {/*
            대표님이 관리 화면에서 올린 사진을 바닥에 깐다.
            아직 없으면 아무것도 걸지 않는다 — 깨진 그림보다 지금 모습이 낫다.
          */}
          {whyMedia && (
            <>
              <picture>
                <source media="(min-width: 768px)"
                        srcSet={whyMedia.pcSrcSet}
                        sizes="100vw" />
                <img
                  src={whyMedia.mobileUrl}
                  srcSet={whyMedia.mobileSrcSet}
                  sizes="100vw"
                  alt={whyMedia.alt}
                  loading="lazy"
                  className="absolute inset-0 -z-10 h-full w-full object-cover"
                />
              </picture>
              {/*
                사진 위에 글을 얹으므로 반드시 덮개를 둔다. 사진이 밝든 어둡든
                글이 읽혀야 하고, 그건 사진을 고른 사람이 아니라 이 코드가 보장해야 한다.
              */}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(var(--scrim-rgb))_0%,rgb(var(--scrim-rgb)_/_0.9)_55%,rgb(var(--scrim-rgb)_/_0.74)_100%)]"
              />
            </>
          )}
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
            {/* 떠 있는 문의 버튼이 여기서 비킨다 (FloatingCta) */}
            <div
              data-cta-anchor
              className="mt-12 flex flex-wrap justify-center gap-4"
            >
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
