import Link from "next/link";

/**
 * 푸터
 *
 * ⚠️ 사업자 정보는 자리표시자다. 대표님께 상호·대표자·사업자등록번호·
 *    주소·연락처를 받아 채워야 한다 (§18 운영 항목).
 *
 * 개인정보처리방침 링크는 문의 폼을 여는 시점에 반드시 살아 있어야 한다.
 * 이름·전화·이메일을 받는 순간 개인정보처리자가 되기 때문이다 (§14).
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-hairline px-6 py-16 md:px-12">
      <div className="flex flex-col gap-12 md:flex-row md:justify-between">
        <div>
          <p className="font-display text-lg font-black tracking-[0.18em] text-ink-100">
            GYMLECO
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink-400">
            스웨덴 본사 직영. 공간을 아는 헬스기구.
          </p>
        </div>

        <nav aria-label="푸터" className="flex gap-12 text-sm">
          <ul className="space-y-3">
            <li>
              <Link href="/about" className="text-ink-300 hover:text-ink-100">
                브랜드 소개
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="text-ink-300 hover:text-ink-100"
              >
                제품
              </Link>
            </li>
            <li>
              <Link href="/news" className="text-ink-300 hover:text-ink-100">
                소식
              </Link>
            </li>
          </ul>
          <ul className="space-y-3">
            <li>
              <Link href="/contact" className="text-ink-300 hover:text-ink-100">
                견적 문의
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-ink-300 hover:text-ink-100">
                무료 시연 신청
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-ink-300 hover:text-ink-100">
                개인정보처리방침
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* TODO: 대표님께 사업자 정보 수령 후 교체 */}
      <div className="mt-14 border-t border-hairline pt-8 text-xs leading-relaxed text-ink-400">
        <p>짐레코 코리아 · 대표자 —— · 사업자등록번호 ——</p>
        <p className="mt-1">주소 —— · 전화 —— · 이메일 ——</p>
        <p className="mt-4">© {new Date().getFullYear()} GYMLECO KOREA</p>
      </div>
    </footer>
  );
}
