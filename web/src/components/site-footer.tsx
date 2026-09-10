import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

import { getSiteInfo, safeHref } from "@/lib/settings-source";

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

export async function SiteFooter() {
  // 관리 화면에서 고친 값을 읽는다. API 가 없으면 환경변수로 물러선다.
  const info = await getSiteInfo();

  const businessLine = filled([
    ["", info.companyName || "짐레코 코리아"],
    ["대표자", info.ceo],
    ["사업자등록번호", info.registrationNo],
  ]);
  const contactLine = filled([
    ["주소", info.address],
    ["전화", info.phone],
    ["이메일", info.email],
    ["영업시간", info.businessHours],
  ]);

  // 등록된 것만 내보낸다. 빈 링크가 늘어선 줄은 없느니만 못하다.
  const sns: { label: string; href: string }[] = [
    ["Instagram", info.instagram],
    ["YouTube", info.youtube],
    ["Blog", info.blog],
  ].flatMap(([label, url]) => {
    const href = safeHref(url);
    return href ? [{ label, href }] : [];
  });

  return (
    <footer className="relative isolate overflow-hidden border-t border-hairline px-6 pt-16 pb-16 md:px-12">
      {/*
        푸터 바탕에 깔린 워드마크.

        ★ 장식이므로 화면을 읽어 주는 사람에게는 내보내지 않는다.
          아래 저작권 줄이 이미 «GYMLECO KOREA» 라고 말한다.

        ★ 따로 띠를 두지 않고 푸터 전체의 바탕으로 쓴다.
          아래에 한 줄 더 두었더니 푸터가 길어지고 로고만 덩그러니
          남았다. 글을 로고 위에 얹으면 한 덩어리로 읽힌다.

        ★ isolate + -z-10 이 짝이다.
          isolate 가 없으면 -z-10 이 페이지 배경 뒤까지 빠져 아예 안 보인다.
          히어로 띠에서 이미 한 번 겪은 일이다. isolate 로 푸터 안에
          층을 따로 만들면, 푸터 배경 위·글자 아래에 정확히 눕는다.

        ★ 높이를 푸터 안쪽으로 가둔다(max-h-full + object-contain).
          폭만 정하면 로고가 푸터보다 커져 위아래가 잘린다.

        ★ 흐리기는 낮게 유지한다.
          위에 글이 얹히므로 진해지면 글 읽기를 방해한다. 받은 로고가
          300px 뿐이라 확대하면 무른데, 바탕으로 쓰면 그게 덜 드러난다.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center px-6 select-none md:px-12"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-ink.png"
          alt=""
          className="logo-on-light max-h-full w-full max-w-[1100px] object-contain opacity-[0.10]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white.png"
          alt=""
          className="logo-on-dark max-h-full w-full max-w-[1100px] object-contain opacity-[0.13]"
        />
      </div>

      <div className="flex flex-col gap-12 md:flex-row md:justify-between">
        <div>
          <BrandLogo height={26} />
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
            <li>
              <Link href="/terms" className="text-ink-300 hover:text-ink-100">
                이용약관
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="text-ink-300 hover:text-ink-100">
                쿠키 정책
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

        ★ 이제 관리 화면에서 읽는다
          site_setting 테이블이 원본이고, 대표님이 관리 화면에서 고치면
          재검증 훅이 "settings" 태그를 끊어 즉시 반영된다.
          환경변수는 API 가 없을 때를 위한 폴백으로만 남아 있다.
      */}
      {sns.length > 0 && (
        <nav aria-label="소셜" className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {sns.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-300 transition-colors hover:text-ink-100"
            >
              {s.label}
            </a>
          ))}
        </nav>
      )}

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
