import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  robots: { index: true, follow: false },
};

/**
 * ⚠️ 법적 문서다. 아래는 골격이며 실제 게시 전에 반드시 확정해야 한다.
 *
 * 문의 폼에서 이름·연락처·이메일을 받는 순간 개인정보처리자가 된다.
 * 법적 책임 주체는 사이트를 운영하는 사업자(짐레코 코리아)이며,
 * 개인정보 보호책임자를 지정해 이 페이지에 명시해야 한다.
 *
 * 대표님께 받아야 할 것:
 *   - 상호 · 대표자 · 사업자등록번호 · 주소
 *   - 개인정보 보호책임자 이름 · 직위 · 연락처
 *   - 실제 보유기간 (현재 "처리 완료 후 1년" 으로 가정)
 *   - 처리 위탁 여부 (메일 발송 대행 등)
 *   - 시행일
 */
export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Privacy"
          title="개인정보처리방침"
          description="짐레코 코리아는 문의 응대를 위해 최소한의 개인정보만 수집하며, 목적 달성 후 지체 없이 파기합니다."
        />

        <div className="max-w-3xl px-6 py-12 md:px-12">
          <p className="border border-signal/40 bg-signal/5 p-4 text-sm text-ink-300">
            현재 문서는 초안입니다. 사업자 정보와 개인정보 보호책임자 지정 후
            정식 게시됩니다.
          </p>

          <Section title="1. 수집하는 개인정보 항목">
            <p>문의 접수 시 아래 항목을 수집합니다.</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-ink-100">필수</strong> — 이름, 연락처
              </li>
              <li>
                <strong className="text-ink-100">선택</strong> — 이메일, 업체명,
                지역, 문의 내용
              </li>
              <li>
                <strong className="text-ink-100">자동 수집</strong> — 접속 IP,
                브라우저 정보 (스팸 방지 목적)
              </li>
            </ul>
          </Section>

          <Section title="2. 수집 및 이용 목적">
            <ul className="list-disc space-y-1 pl-5">
              <li>견적·시연 문의에 대한 응대 및 안내</li>
              <li>스팸·자동 등록 방지</li>
              <li>
                (선택 동의 시) 신제품·행사 정보 안내
              </li>
            </ul>
            <p className="mt-3">
              마케팅 정보 수신은 별도 동의 항목이며, 동의하지 않으셔도 문의
              응대에는 영향이 없습니다.
            </p>
          </Section>

          <Section title="3. 보유 및 이용 기간">
            <p>
              문의 처리 완료 후 <strong className="text-ink-100">1년</strong>{" "}
              보관하며, 기간이 지나면 자동으로 파기합니다. 파기 예정일은
              접수 시점에 기록되며 별도 요청 없이도 시스템이 처리합니다.
            </p>
            <p className="mt-3">
              정보주체가 파기를 요청하시면 지체 없이 처리합니다.
            </p>
          </Section>

          <Section title="4. 파기 절차 및 방법">
            <p>
              보유기간이 지난 개인정보는 자동 파기 절차에 따라 데이터베이스에서
              삭제되며, 복구할 수 없습니다.
            </p>
          </Section>

          <Section title="5. 제3자 제공 및 처리 위탁">
            <p>
              수집한 개인정보를 제3자에게 제공하지 않습니다. 처리 위탁이
              발생하는 경우 이 항목에 위탁 대상과 업무 내용을 명시합니다.
            </p>
          </Section>

          <Section title="6. 개인정보의 안전성 확보 조치">
            <ul className="list-disc space-y-1 pl-5">
              <li>연락처는 암호화하여 저장합니다</li>
              <li>접근 권한을 관리자에게만 부여하고 조회 이력을 기록합니다</li>
              <li>전송 구간을 암호화합니다 (HTTPS)</li>
            </ul>
          </Section>

          <Section title="7. 정보주체의 권리">
            <p>
              정보주체는 언제든지 본인의 개인정보에 대한 열람, 정정, 삭제,
              처리정지를 요청하실 수 있습니다. 아래 연락처로 요청해 주시면
              지체 없이 처리합니다.
            </p>
          </Section>

          <Section title="8. 개인정보 보호책임자">
            <p className="text-ink-400">
              성명 —— · 직위 —— · 연락처 ——
            </p>
          </Section>

          <Section title="9. 시행일">
            <p className="text-ink-400">이 방침은 —— 부터 적용됩니다.</p>
          </Section>
        </div>
      </main>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
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
