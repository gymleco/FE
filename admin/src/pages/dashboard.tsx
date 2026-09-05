import { useNavigate } from "react-router";

import {
  api,
  type InquiryListItem,
  type Paged,
  type Product,
  type UsedItem,
} from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { whenKo } from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { Button, Card, Empty, Pill, Spinner } from "@/components/ui";

/**
 * 첫 화면.
 *
 * 지표를 늘어놓지 않는다. 관리 화면에 들어온 사람이 알고 싶은 것은
 * «지금 손봐야 할 게 있나» 이지 «전체 몇 개인가» 가 아니다.
 * 그래서 숨어 있는 항목처럼 행동이 필요한 것을 먼저 보여 준다.
 */
export function Dashboard() {
  const nav = useNavigate();

  const { data: products, loading: pl } = useLoad<Product[]>(
    () => api.get<Product[]>("/admin/products"),
    [],
  );
  const { data: used, loading: ul } = useLoad<UsedItem[]>(
    () => api.get<UsedItem[]>("/admin/used"),
    [],
  );

  const loading = pl || ul;
  const hiddenProducts = (products ?? []).filter((p) => !p.visible);
  const hiddenUsed = (used ?? []).filter((u) => !u.visible);
  const shownProducts = (products ?? []).length - hiddenProducts.length;
  const shownUsed = (used ?? []).length - hiddenUsed.length;

  const recent = [
    ...(products ?? []).map((p) => ({
      id: `p${p.id}`,
      name: p.nameKo,
      kind: "제품",
      to: `/products/${p.id}`,
      at: p.updatedAt,
      visible: p.visible,
    })),
    ...(used ?? []).map((u) => ({
      id: `u${u.id}`,
      name: u.nameKo,
      kind: "중고",
      to: `/used/${u.id}`,
      at: u.updatedAt,
      visible: u.visible,
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-3">
        <Spinner /> 불러오는 중
      </div>
    );
  }

  return (
    <>
      <PageHead title="대시보드" desc="사이트에 무엇이 올라가 있는지, 무엇이 아직 숨어 있는지 봅니다." />

      {/*
        답을 기다리는 사람이 제일 위에 온다.
        보이지 않는 제품은 하루 늦어도 아무 일도 안 일어나지만,
        답 없는 문의는 하루 늦으면 그 사람이 다른 데로 간다.
      */}
      <NewInquiries />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          title="제품"
          action={<Button onClick={() => nav("/products")}>관리</Button>}
        >
          <div className="flex items-baseline gap-6 px-4 py-4">
            <div>
              <p className="text-xs text-ink-3">사이트에 보임</p>
              <p className="tabular text-2xl font-bold">{shownProducts}</p>
            </div>
            <div>
              <p className="text-xs text-ink-3">감춤</p>
              <p className="tabular text-2xl font-bold text-ink-3">
                {hiddenProducts.length}
              </p>
            </div>
          </div>
          {hiddenProducts.length > 0 && (
            <p className="border-t border-line-soft px-4 py-3 text-xs text-ink-2">
              등록만 하고 아직 보이지 않는 제품이 {hiddenProducts.length}개 있습니다 —{" "}
              {hiddenProducts.slice(0, 3).map((p) => p.nameKo).join(", ")}
              {hiddenProducts.length > 3 ? " 외" : ""}
            </p>
          )}
        </Card>

        <Card title="중고" action={<Button onClick={() => nav("/used")}>관리</Button>}>
          <div className="flex items-baseline gap-6 px-4 py-4">
            <div>
              <p className="text-xs text-ink-3">사이트에 보임</p>
              <p className="tabular text-2xl font-bold">{shownUsed}</p>
            </div>
            <div>
              <p className="text-xs text-ink-3">감춤</p>
              <p className="tabular text-2xl font-bold text-ink-3">{hiddenUsed.length}</p>
            </div>
          </div>
          {hiddenUsed.length > 0 && (
            <p className="border-t border-line-soft px-4 py-3 text-xs text-ink-2">
              아직 보이지 않는 매물이 {hiddenUsed.length}개 있습니다.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-4">
        <Card title="최근에 손댄 것">
          {recent.length === 0 ? (
            <Empty>아직 등록된 것이 없습니다.</Empty>
          ) : (
            <ul>
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 border-b border-line-soft px-4 py-2.5 text-sm last:border-0"
                >
                  <span className="w-9 shrink-0 text-xs text-ink-3">{r.kind}</span>
                  <button
                    type="button"
                    onClick={() => nav(r.to)}
                    className="min-w-0 flex-1 truncate text-left font-semibold hover:text-accent"
                  >
                    {r.name}
                  </button>
                  {r.visible ? <Pill tone="ok">보임</Pill> : <Pill>감춤</Pill>}
                  <span className="tabular w-28 shrink-0 text-right text-xs text-ink-3">
                    {whenKo(r.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

/**
 * 아직 답하지 않은 문의.
 *
 * 대시보드에 «전체 몇 건» 을 적지 않는다. 알고 싶은 것은 «지금 손봐야
 * 할 게 있나» 이고, 여기서는 그것이 신규 문의다. 없으면 조용히 한 줄만
 * 남긴다 — 없는 것을 크게 알릴 이유가 없다.
 */
function NewInquiries() {
  const nav = useNavigate();

  const { data, error, loading } = useLoad<Paged<InquiryListItem>>(
    () => api.get<Paged<InquiryListItem>>("/admin/inquiries?status=NEW&page=0&size=5"),
    [],
  );

  if (loading) return null;

  // 문의를 못 불러왔다고 대시보드 전체를 막지 않는다. 다만 조용히 넘기지도 않는다.
  if (error) {
    return (
      <Card className="mb-4">
        <p className="px-4 py-3 text-sm text-risk">
          새 문의를 불러오지 못했습니다. <b>{error}</b>
        </p>
      </Card>
    );
  }

  const rows = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  if (total === 0) {
    return (
      <Card className="mb-4">
        <p className="px-4 py-3 text-sm text-ink-3">
          답을 기다리는 문의가 없습니다.{" "}
          <button
            type="button"
            onClick={() => nav("/inquiries")}
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            지난 문의 보기
          </button>
        </p>
      </Card>
    );
  }

  return (
    <Card
      className="mb-4 border-warn/40"
      title={`답을 기다리는 문의 ${total}건`}
      action={<Button tone="primary" onClick={() => nav("/inquiries")}>문의함 열기</Button>}
    >
      <ul>
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center gap-3 border-b border-line-soft px-4 py-2.5 text-sm last:border-0"
          >
            <Pill tone="warn">{row.type}</Pill>
            <button
              type="button"
              onClick={() => nav(`/inquiries/${row.id}`)}
              className="min-w-0 flex-1 truncate text-left font-semibold hover:text-accent"
            >
              {row.maskedName}
              {row.company ? <span className="font-normal text-ink-3"> · {row.company}</span> : null}
            </button>
            <span className="tabular w-28 shrink-0 text-right text-xs text-ink-3">
              {whenKo(row.createdAt)}
            </span>
          </li>
        ))}
      </ul>
      {total > rows.length && (
        <p className="border-t border-line-soft px-4 py-2.5 text-xs text-ink-3">
          외 {total - rows.length}건이 더 있습니다.
        </p>
      )}
    </Card>
  );
}
