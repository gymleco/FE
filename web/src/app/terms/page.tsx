import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";
import { LegalBody, LegalDraftNotice, LegalSection } from "@/components/legal";

export const metadata: Metadata = {
  title: "이용약관",
  robots: { index: true, follow: false },
};

/**
 * ⚠️ 법적 문서다. 아래는 골격이며 게시 전에 반드시 검토받아야 한다.
 *
 * ── 이 사이트가 «무엇이 아닌가» 가 이 약관의 핵심이다 ──
 *
 * 이 사이트는 물건을 팔지 않는다. 장바구니도, 결제도, 회원가입도 없다.
 * 하는 일은 «정보를 보여 주고 문의를 받는 것» 뿐이고, 실제 거래는
 * 그 뒤 오프라인에서 별도 계약으로 이뤄진다.
 *
 * 그래서 전자상거래법의 청약철회·배송·환불 조항을 여기에 옮겨 적지 않는다.
 * 남의 약관에서 통째로 베껴 오면 딱 그 대목이 따라오는데, 사이트가 하지도
 * 않는 일을 약속하는 문서가 된다. 지키지 못할 약속을 적는 것이 안 적는
 * 것보다 위험하다.
 *
 * 판매·결제를 사이트에서 직접 하게 되는 날, 이 문서는 다시 써야 한다.
 *
 * 대표님께 받아야 할 것:
 *   - 상호 · 대표자 · 사업자등록번호 · 주소 (site_setting 에 넣으면 자동 반영)
 *   - 시행일
 *   - 관할 법원 (기본은 사업장 소재지 관할)
 */
export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Terms"
          title="이용약관"
          description="이 사이트는 제품 정보를 안내하고 문의를 접수하는 곳입니다. 구매 계약은 문의 이후 별도로 체결됩니다."
        />

        <LegalBody>
          <LegalDraftNotice>
            현재 문서는 초안입니다. 사업자 정보와 시행일이 확정되면 정식
            게시됩니다.
          </LegalDraftNotice>

          <LegalSection title="1. 목적">
            <p>
              이 약관은 짐레코 코리아(이하 &ldquo;회사&rdquo;)가 이 웹사이트를
              통해 제공하는 서비스의 이용 조건과 절차, 회사와 이용자의 권리·의무를
              정하는 것을 목적으로 합니다.
            </p>
          </LegalSection>

          <LegalSection title="2. 서비스의 범위">
            <p>이 사이트가 제공하는 것은 다음과 같습니다.</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>제품·부품·악세사리 정보 및 사양 안내</li>
              <li>견적 문의, 무료 시연 신청의 접수</li>
              <li>제품 일련번호를 통한 정품 여부 확인</li>
              <li>공지사항, 자주 묻는 질문, 소식 안내</li>
            </ul>
            <p className="mt-3">
              <strong className="text-ink-100">
                이 사이트에서는 물건을 판매하지 않습니다.
              </strong>{" "}
              회원가입·장바구니·온라인 결제 기능이 없으며, 문의 접수는 계약의
              청약이 아닙니다. 실제 매매·임대차 계약의 조건은 담당자와 협의한 뒤
              별도의 계약서로 정합니다.
            </p>
          </LegalSection>

          <LegalSection title="3. 게시 정보의 정확성">
            <p>
              회사는 제품 사양·치수·중량 등을 정확히 게시하기 위해 노력합니다.
              다만 제조사의 사양 변경, 표기 오류, 환율·재고 사정에 따라 실제와
              다를 수 있습니다.
            </p>
            <p className="mt-3">
              사이트에 표시된 정보는 안내를 위한 것이며 그 자체로 계약 조건이
              되지 않습니다. 계약 조건은 견적서와 계약서에 적힌 내용이
              기준입니다.
            </p>
          </LegalSection>

          <LegalSection title="4. 문의 시 이용자의 의무">
            <p>
              문의를 접수하실 때에는 정확한 정보를 입력해 주셔야 합니다. 타인의
              이름이나 연락처를 무단으로 입력하는 행위는 금지되며, 그로 인해
              발생한 책임은 입력한 분에게 있습니다.
            </p>
            <p className="mt-3">
              입력하신 개인정보의 처리에 관한 사항은{" "}
              <Link
                href="/privacy"
                className="border-b border-accent text-accent hover:text-accent-hover"
              >
                개인정보처리방침
              </Link>
              을 따릅니다.
            </p>
          </LegalSection>

          <LegalSection title="5. 지식재산권">
            <p>
              사이트에 실린 제품 사진, 도면, 설명 문구, 상표와 로고에 대한 권리는
              회사 또는 제조사(Gymleco AB)에 있습니다.
            </p>
            <p className="mt-3">
              사전 서면 동의 없이 복제·배포·전송·2차 가공하거나 상업적으로
              이용하실 수 없습니다. 다만 제품 소개를 위한 인용은 출처를 밝히는
              범위에서 허용합니다.
            </p>
          </LegalSection>

          <LegalSection title="6. 금지되는 이용 행위">
            <ul className="list-disc space-y-1 pl-5">
              <li>자동화된 수단으로 사이트를 과도하게 조회하거나 자료를 수집하는 행위</li>
              <li>사이트의 정상적인 운영을 방해하는 행위</li>
              <li>회사의 사전 동의 없이 상업적 목적으로 자료를 이용하는 행위</li>
              <li>
                정품 확인 기능을 이용해 타인의 제품 정보를 무단으로 조회하거나,
                조회 결과를 위조·변조하여 유통하는 행위
              </li>
            </ul>
            <p className="mt-3">
              위 행위가 확인되면 접속을 제한할 수 있으며, 위법한 경우 법적 조치를
              취할 수 있습니다.
            </p>
          </LegalSection>

          <LegalSection title="7. 정품 확인 기능에 관한 안내">
            <p>
              정품 확인은 입력하신 일련번호가 회사가 등록·관리하는 제품과
              일치하는지를 알려 드리는 <strong className="text-ink-100">참고 수단</strong>
              입니다.
            </p>
            <p className="mt-3">
              조회 결과만으로 제품의 진위가 최종적으로 확정되는 것은 아니며,
              번호가 일치하더라도 실물과 대조가 필요합니다. 의심스러운 점이
              있으시면 문의해 주시면 확인해 드립니다.
            </p>
          </LegalSection>

          <LegalSection title="8. 서비스의 변경과 중단">
            <p>
              회사는 서비스 내용을 변경하거나 중단할 수 있습니다. 시스템 점검,
              설비 장애, 천재지변 등 부득이한 사유가 있는 경우 사전 공지 없이
              일시 중단될 수 있습니다.
            </p>
          </LegalSection>

          <LegalSection title="9. 외부 링크">
            <p>
              사이트에 걸린 외부 링크로 접속한 곳의 자료와 서비스에 대해서는
              회사가 관리 책임을 지지 않습니다.
            </p>
          </LegalSection>

          <LegalSection title="10. 책임의 한계">
            <p>
              회사는 이용자가 사이트의 정보를 신뢰하여 내린 판단에 대해, 회사의
              고의 또는 과실이 없는 한 책임을 지지 않습니다. 이 조항이 관계
              법령에서 정한 회사의 책임을 부당하게 면제하는 것으로 해석되지는
              않습니다.
            </p>
          </LegalSection>

          <LegalSection title="11. 약관의 게시와 개정">
            <p>
              이 약관은 사이트에 게시하여 공지합니다. 회사는 관계 법령을 위반하지
              않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일과 개정 사유를
              밝혀 적용일 7일 전부터 공지합니다. 이용자에게 불리한 개정의 경우
              30일 전부터 공지합니다.
            </p>
          </LegalSection>

          <LegalSection title="12. 준거법과 관할">
            <p>
              이 약관은 대한민국 법령을 따릅니다. 서비스 이용과 관련하여 분쟁이
              생긴 경우 회사의 사업장 소재지를 관할하는 법원을 관할 법원으로
              합니다.
            </p>
          </LegalSection>

          <LegalSection title="13. 시행일">
            <p className="text-ink-400">이 약관은 —— 부터 적용됩니다.</p>
          </LegalSection>
        </LegalBody>
      </main>
    </>
  );
}
