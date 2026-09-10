import type { ReactNode } from "react";

/**
 * 법적 문서(개인정보처리방침·이용약관·쿠키 정책) 공통 조각.
 *
 * 세 문서가 서로 다른 모양이면 «급하게 갖다 붙인 문서» 로 읽힌다.
 * 조판을 한 곳에 모아 두면 문서를 하나 더 만들 때도 내용에만 집중하면 된다.
 */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-hairline pt-8">
      <h2 className="text-lg font-semibold tracking-tight text-ink-100">
        {title}
      </h2>
      <div className="mt-4 space-y-2 text-pretty text-ink-300">{children}</div>
    </section>
  );
}

/**
 * 초안 표시.
 *
 * ★ 이 문구를 임의로 지우지 않는다.
 *   사업자 정보와 시행일이 비어 있는 문서를 «확정된 약관» 처럼 보이게 두면,
 *   읽는 사람이 효력이 있다고 믿는다. 값이 채워지고 검토가 끝난 뒤에
 *   지우는 것이 순서다.
 */
export function LegalDraftNotice({ children }: { children: ReactNode }) {
  return (
    <p className="border border-accent/40 bg-signal/5 p-4 text-sm text-ink-300">
      {children}
    </p>
  );
}

/** 문서 본문 너비 — 세 문서가 같은 폭이어야 같은 문서군으로 읽힌다 */
export function LegalBody({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl px-6 py-12 md:px-12">{children}</div>
  );
}
