import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { getProducts } from "@/lib/products-source";
import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "견적 · 무료 시연 문의",
  description:
    "평수와 천장 높이만 알려주시면 배치안과 견적을 함께 보내 드립니다. 무료 시연도 신청하실 수 있습니다.",
  // 문의 페이지는 색인해도 무방하지만, 완료 페이지는 색인하지 않는다
  robots: { index: true, follow: true },
};

export default async function ContactPage() {
  const products = await getProducts("EQUIPMENT");

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader
          eyebrow="Contact"
          title="공간을 알려주시면 배치안을 함께 그려 드립니다"
          description="평수와 천장 높이, 예상 회원 수만 알려주셔도 충분합니다. 어떤 기구를 몇 대 넣을 수 있는지부터 같이 보시죠."
        />

        <section className="px-6 py-12 md:px-12">
          <ContactForm
            products={products.map((p) => ({ slug: p.slug, nameKo: p.nameKo }))}
          />
        </section>

        <section className="border-t border-hairline px-6 py-12 md:px-12">
          <dl className="grid gap-8 md:grid-cols-3">
            <div>
              <dt className="font-display text-[0.68rem] tracking-[0.22em] text-signal uppercase">
                응대 시간
              </dt>
              <dd className="mt-3 text-sm text-ink-300">
                영업일 기준 1일 이내에 담당자가 연락드립니다.
              </dd>
            </div>
            <div>
              <dt className="font-display text-[0.68rem] tracking-[0.22em] text-signal uppercase">
                무료 시연
              </dt>
              <dd className="mt-3 text-sm text-ink-300">
                가까운 공식 헬스장 방문 또는 현장 시연 중 선택하실 수 있습니다.
              </dd>
            </div>
            <div>
              <dt className="font-display text-[0.68rem] tracking-[0.22em] text-signal uppercase">
                개인정보
              </dt>
              <dd className="mt-3 text-sm text-ink-300">
                문의 응대 목적으로만 사용하며, 처리 완료 후 1년이 지나면
                자동 파기됩니다.
              </dd>
            </div>
          </dl>
        </section>
      </main>
      {/* 이미 문의 화면이므로 플로팅 버튼을 띄우지 않는다 */}
    </>
  );
}
