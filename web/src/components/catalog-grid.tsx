"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CATEGORY_LABEL, type Product, type ProductCategory } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

/**
 * 카테고리 필터 + 카드 그리드.
 *
 * ── useSearchParams 를 쓰지 않는 이유 ──
 *
 * useSearchParams() 를 호출하면 Next.js 가 그 서브트리를 클라이언트
 * 전용으로 돌려버린다. 정적 HTML 에는 Suspense 폴백만 남고 제품 카드는
 * 하나도 들어가지 않는다. 실제로 그렇게 만들었다가 /products 의 본문이
 * 109단어짜리 빈 껍데기가 되는 것을 확인했다.
 *
 * 검색 유입이 핵심인 사이트에서 제품 목록에 제품이 없는 건 치명적이다.
 *
 * 그래서:
 *   1. 첫 렌더는 항상 전체 목록 — 서버 HTML 에 모든 제품이 들어간다
 *   2. 필터는 마운트 후 URL 에서 읽어 적용한다
 *   3. 칩을 누르면 navigation 없이 history 만 갱신한다
 *      (공유·뒤로가기는 되면서 페이지 전환은 일어나지 않는다)
 *
 * JS 가 없으면 필터가 동작하지 않지만 전체 목록은 그대로 읽힌다.
 * 실패의 방향이 "빈 화면"이 아니라 "필터 없는 목록"이다.
 */
export function CatalogGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: ProductCategory[];
}) {
  const [active, setActive] = useState<ProductCategory | null>(null);

  /*
   * 마운트 후에 URL 을 읽는다. 서버 렌더 결과에는 영향을 주지 않는다.
   *
   * react-hooks/set-state-in-effect 를 이 줄에서만 끈다.
   * 규칙의 취지("파생 상태를 렌더 중에 계산하라")는 맞지만, 여기서는
   * 렌더 중에 window 를 읽을 수 없다 — 서버는 URL 쿼리를 모른 채
   * 정적 HTML 을 만들고, 클라이언트가 다른 초기값을 쓰면 하이드레이션
   * 불일치가 난다. URL 은 React 밖의 외부 시스템이고, 마운트 후 1회
   * 동기화하는 것이 이 페이지에서 SSG 를 지키는 유일한 방법이다.
   */
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("category");
    if (param && categories.includes(param as ProductCategory)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(param as ProductCategory);
    }
  }, [categories]);

  function select(category: ProductCategory | null) {
    setActive(category);
    const url = new URL(window.location.href);
    if (category) {
      url.searchParams.set("category", category);
    } else {
      url.searchParams.delete("category");
    }
    // pushState 라 뒤로가기로 이전 필터 상태로 돌아갈 수 있다
    window.history.pushState({}, "", url);
  }

  // 브라우저 뒤로가기 대응
  useEffect(() => {
    function onPop() {
      const param = new URLSearchParams(window.location.search).get("category");
      setActive(
        param && categories.includes(param as ProductCategory)
          ? (param as ProductCategory)
          : null,
      );
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [categories]);

  const visible = active
    ? products.filter((p) => p.category === active)
    : products;

  return (
    <>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="카테고리 필터">
          <FilterChip
            label="전체"
            active={!active}
            onSelect={() => select(null)}
          />
          {categories.map((category) => (
            <FilterChip
              key={category}
              label={CATEGORY_LABEL[category]}
              active={active === category}
              onSelect={() => select(category)}
            />
          ))}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        /*
         * 빈 상태에서도 다음 행동을 제시한다.
         * "없음"만 두면 방문자가 막다른 길에 놓인다.
         */
        <div className="mt-14 border border-hairline p-10 text-center">
          <p className="text-ink-300">해당 카테고리 제품이 준비 중입니다.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => select(null)}
              className="rounded-full border border-ink-600 px-5 py-2.5 text-sm text-ink-100 transition-colors hover:border-ink-300"
            >
              전체 보기
            </button>
            <Link
              href="/contact"
              className="rounded-full bg-signal px-5 py-2.5 text-sm font-bold text-signal-ink transition-colors hover:bg-signal-hover"
            >
              찾는 제품 문의하기
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function FilterChip({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={
        active
          ? "rounded-full border border-ink-100 bg-ink-100 px-4 py-1.5 text-sm font-semibold text-ink-950"
          : "rounded-full border border-ink-700 px-4 py-1.5 text-sm text-ink-300 transition-colors hover:border-ink-400 hover:text-ink-100"
      }
    >
      {label}
    </button>
  );
}
