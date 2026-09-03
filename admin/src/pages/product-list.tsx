import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { ApiError, api, type Product } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import {
  PRODUCT_CATEGORY,
  PRODUCT_TYPE,
  label,
  toPyeong,
  whenKo,
} from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { previewUrl } from "@/components/image-picker";
import { Button, Card, Empty, Pill, Spinner, useToast } from "@/components/ui";
import { Confirm } from "@/components/confirm";

const TABS = [
  { value: "", text: "전체" },
  { value: "EQUIPMENT", text: "기구" },
  { value: "PART", text: "부품" },
  { value: "ACCESSORY", text: "악세사리" },
] as const;

export function ProductList() {
  const nav = useNavigate();
  const toast = useToast();
  const [type, setType] = useState("");
  const [hiding, setHiding] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, error, loading, reload } = useLoad<Product[]>(
    () => api.get<Product[]>(`/admin/products${type ? `?type=${type}` : ""}`),
    [type],
  );

  /** 감추기는 사이트에서 사라지는 일이라 한 번 묻는다. 다시 보이게 하는 것은 묻지 않는다. */
  async function setVisible(p: Product, visible: boolean) {
    setBusy(true);
    try {
      await api.patch(`/admin/products/${p.id}/visibility`, { visible });
      toast(visible ? `‘${p.nameKo}’ 을(를) 사이트에 보이게 했습니다.` : `‘${p.nameKo}’ 을(를) 감췄습니다.`);
      setHiding(null);
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "바꾸지 못했습니다.", "risk");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="제품"
        desc="사이트의 제품 라인업입니다. 새로 등록하면 감춘 상태로 시작하니, 확인 후 보이게 해 주세요."
        action={
          <Button tone="primary" onClick={() => nav("/products/new")}>
            + 새 제품
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              type === t.value
                ? "border-ink bg-ink text-white"
                : "border-line bg-surface text-ink-2 hover:bg-surface-2"
            }`}
          >
            {t.text}
          </button>
        ))}
      </div>

      <Card>
        {loading && (
          <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-ink-3">
            <Spinner /> 불러오는 중
          </div>
        )}

        {!loading && error && (
          <Empty action={<Button onClick={reload}>다시 시도</Button>}>{error}</Empty>
        )}

        {!loading && !error && data?.length === 0 && (
          <Empty action={<Button tone="primary" onClick={() => nav("/products/new")}>첫 제품 등록하기</Button>}>
            아직 등록된 제품이 없습니다.
          </Empty>
        )}

        {!loading && !error && data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-3">
                  <th className="w-16 px-4 py-2.5 font-semibold">사진</th>
                  <th className="px-4 py-2.5 font-semibold">제품명</th>
                  <th className="px-4 py-2.5 font-semibold">분류</th>
                  <th className="px-4 py-2.5 font-semibold">설치 면적</th>
                  <th className="px-4 py-2.5 font-semibold">사이트 노출</th>
                  <th className="px-4 py-2.5 font-semibold">수정</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {data.map((p) => {
                  const thumb = previewUrl(p.thumbnailKey, 400);
                  const m2 = p.footprintM2 == null ? null : Number(p.footprintM2);
                  return (
                    <tr key={p.id} className="border-b border-line-soft last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex size-11 items-center justify-center overflow-hidden rounded-xs border border-line bg-surface-2">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="size-full object-contain"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          ) : (
                            <span className="text-[0.6rem] text-ink-3">없음</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          to={`/products/${p.id}`}
                          className="font-semibold text-ink hover:text-accent"
                        >
                          {p.nameKo}
                        </Link>
                        <p className="text-xs text-ink-3">{p.nameEn}</p>
                      </td>
                      <td className="px-4 py-2.5 text-ink-2">
                        {/* 부품 · 악세사리는 분류가 종류와 같아서, 그대로 두면
                            «부품 · 부품» 처럼 같은 말이 두 번 찍힌다. */}
                        {label(PRODUCT_TYPE, p.type)}
                        {p.category !== p.type && (
                          <span className="text-ink-3">
                            {" · "}
                            {label(PRODUCT_CATEGORY, p.category)}
                          </span>
                        )}
                      </td>
                      <td className="tabular px-4 py-2.5 text-ink-2">
                        {m2 ? (
                          <>
                            {m2}m² <span className="text-ink-3">{toPyeong(m2)}</span>
                          </>
                        ) : (
                          <span className="text-ink-3">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {p.visible ? <Pill tone="ok">보임</Pill> : <Pill>감춤</Pill>}
                      </td>
                      <td className="tabular px-4 py-2.5 text-xs text-ink-3">
                        {whenKo(p.updatedAt)}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <Button
                          className="mr-1.5"
                          disabled={busy}
                          onClick={() =>
                            p.visible ? setHiding(p) : void setVisible(p, true)
                          }
                        >
                          {p.visible ? "감추기" : "보이기"}
                        </Button>
                        <Button onClick={() => nav(`/products/${p.id}`)}>수정</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Confirm
        open={hiding !== null}
        busy={busy}
        title="사이트에서 감출까요?"
        body={
          <>
            <b>{hiding?.nameKo}</b> 이(가) 공개 사이트에서 보이지 않게 됩니다.
            자료는 지워지지 않고, 언제든 다시 보이게 할 수 있습니다.
          </>
        }
        confirmText="감추기"
        onConfirm={() => hiding && void setVisible(hiding, false)}
        onCancel={() => setHiding(null)}
      />
    </>
  );
}
