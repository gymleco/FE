import { useNavigate } from "react-router";

import { api, type Product, type UsedItem } from "@/lib/api";
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
