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
/** 값이 있는 항목만 "라벨 값" 형태로 남긴다. 비면 배열에서 빠진다. */
function filled(pairs: [string, string | undefined][]): string[] {
  return pairs
    .filter(([, v]) => v && v.trim())
    .map(([label, v]) => (label ? `${label} ${v!.trim()}` : v!.trim()));
}

export function SiteFooter() {
  const businessLine = filled([
    ["", process.env.NEXT_PUBLIC_BIZ_NAME ?? "짐레코 코리아"],
    ["대표자", process.env.NEXT_PUBLIC_BIZ_OWNER],
    ["사업자등록번호", process.env.NEXT_PUBLIC_BIZ_NO],
  ]);
  const contactLine = filled([
    ["주소", process.env.NEXT_PUBLIC_BIZ_ADDRESS],
    ["전화", process.env.NEXT_PUBLIC_BIZ_TEL],
    ["이메일", process.env.NEXT_PUBLIC_BIZ_EMAIL],
  ]);

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

        <nav aria-label="푸터" className="flex flex-wrap gap-x-12 gap-y-8 text-sm">
          <ul className="space-y-3">
            <li className="text-xs tracking-wider text-ink-400">제품</li>
            <li>
              <Link href="/products" className="text-ink-300 hover:text-ink-100">
                제품 라인업
              </Link>
            </li>
            <li>
              <Link href="/used" className="text-ink-300 hover:text-ink-100">
                중고 기구
              </Link>
            </li>
            <li>
              <Link href="/parts" className="text-ink-300 hover:text-ink-100">
                부품
              </Link>
            </li>
            <li>
              <Link
                href="/accessories"
                className="text-ink-300 hover:text-ink-100"
              >
                악세사리
              </Link>
            </li>
          </ul>
          <ul className="space-y-3">
            <li className="text-xs tracking-wider text-ink-400">브랜드</li>
            <li>
              <Link href="/about" className="text-ink-300 hover:text-ink-100">
                About Gymleco
              </Link>
            </li>
            <li>
              <Link href="/centers" className="text-ink-300 hover:text-ink-100">
                공식 헬스장
              </Link>
            </li>
            <li>
              <Link href="/news" className="text-ink-300 hover:text-ink-100">
                소식
              </Link>
            </li>
          </ul>
          <ul className="space-y-3">
            <li className="text-xs tracking-wider text-ink-400">고객센터</li>
            <li>
              <Link
                href="/contact?type=QUOTE"
                className="text-ink-300 hover:text-ink-100"
              >
                견적 문의
              </Link>
            </li>
            <li>
              <Link
                href="/contact?type=DEMO"
                className="text-ink-300 hover:text-ink-100"
              >
                무료 시연 신청
              </Link>
            </li>
            <li>
              <Link
                href="/support/faq"
                className="text-ink-300 hover:text-ink-100"
              >
                자주 묻는 질문
              </Link>
            </li>
            <li>
              <Link
                href="/support/notice"
                className="text-ink-300 hover:text-ink-100"
              >
                공지사항
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

      {/*
        사업자 정보 — 대표님께 받는 대로 채운다.

        ★ 빈 값을 "——" 로 찍지 않는다.
          대시가 늘어선 줄은 "아직 안 만든 화면" 으로 읽힌다. 값이 없으면
          그 항목을 아예 내보내지 않고, 다 없으면 이 줄 자체가 사라진다.
          전자상거래법상 표시 의무는 실제 판매를 시작할 때 생기므로
          지금 비워 두는 것이 법적으로도 문제되지 않는다.

        ★ 환경변수로 뺀 이유
          사업자 정보는 코드가 아니라 운영 정보다. 나중에 site_setting
          테이블이 생기면 그쪽에서 읽어 오도록 이 함수만 바꾸면 된다.
      */}
      <div className="mt-14 border-t border-hairline pt-8 text-xs leading-relaxed text-ink-400">
        {businessLine.length > 0 && <p>{businessLine.join(" · ")}</p>}
        {contactLine.length > 0 && (
          <p className="mt-1">{contactLine.join(" · ")}</p>
        )}
        <p className="mt-4">© {new Date().getFullYear()} GYMLECO KOREA</p>
      </div>
    </footer>
  );
}
