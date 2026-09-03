import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { ApiError, api, type UsedItem } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { USED_CONDITION_SHORT, USED_STATUS, label, whenKo, won } from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { previewUrl } from "@/components/image-picker";
import { Button, Card, Empty, Pill, Spinner, useToast } from "@/components/ui";
import { Confirm } from "@/components/confirm";

const TABS = [
  { value: "", text: "전체" },
  { value: "AVAILABLE", text: "판매중" },
  { value: "RESERVED", text: "예약중" },
  { value: "SOLD", text: "판매완료" },
] as const;

function statusTone(s: string) {
  if (s === "AVAILABLE") return "ok" as const;
  if (s === "RESERVED") return "warn" as const;
  return "mute" as const;
}

export function UsedList() {
  const nav = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [hiding, setHiding] = useState<UsedItem | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, error, loading, reload } = useLoad<UsedItem[]>(
    () => api.get<UsedItem[]>(`/admin/used${status ? `?status=${status}` : ""}`),
    [status],
  );

  async function setVisible(u: UsedItem, visible: boolean) {
    setBusy(true);
    try {
      await api.patch(`/admin/used/${u.id}/visibility`, { visible });
      toast(visible ? `‘${u.nameKo}’ 을(를) 사이트에 보이게 했습니다.` : `‘${u.nameKo}’ 을(를) 감췄습니다.`);
      setHiding(null);
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "바꾸지 못했습니다.", "risk");
    } finally {
      setBusy(false);
    }
  }

  async function setStatusOf(u: UsedItem, next: string) {
    setBusy(true);
    try {
      await api.patch(`/admin/used/${u.id}/status`, { status: next });
      toast(`‘${u.nameKo}’ 을(를) ${label(USED_STATUS, next)} 으로 바꿨습니다.`);
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
        title="중고"
        desc="매물은 한 대씩 다릅니다. 상태 등급과 사진을 꼭 채워 주세요 — 문의 전에 판단이 서야 헛걸음이 줄어듭니다."
        action={
          <Button tone="primary" onClick={() => nav("/used/new")}>
            + 새 매물
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setStatus(t.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              status === t.value
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
          <Empty action={<Button tone="primary" onClick={() => nav("/used/new")}>첫 매물 등록하기</Button>}>
            {status ? "이 상태의 매물이 없습니다." : "아직 등록된 중고 매물이 없습니다."}
          </Empty>
        )}

        {!loading && !error && data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[50rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-3">
                  <th className="w-16 px-4 py-2.5 font-semibold">사진</th>
                  <th className="px-4 py-2.5 font-semibold">매물</th>
                  <th className="px-4 py-2.5 font-semibold">등급</th>
                  <th className="px-4 py-2.5 font-semibold">가격</th>
                  <th className="px-4 py-2.5 font-semibold">수량</th>
                  <th className="px-4 py-2.5 font-semibold">판매 상태</th>
                  <th className="px-4 py-2.5 font-semibold">노출</th>
                  <th className="px-4 py-2.5 font-semibold">수정</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {data.map((u) => {
                  const thumb = previewUrl(u.thumbnailKey, 400);
                  return (
                    <tr key={u.id} className="border-b border-line-soft last:border-0">
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
                          to={`/used/${u.id}`}
                          className="font-semibold text-ink hover:text-accent"
                        >
                          {u.nameKo}
                        </Link>
                        <p className="text-xs text-ink-3">
                          {u.modelName || "모델명 없음"}
                          {u.yearMade ? ` · ${u.yearMade}년` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-ink-2">
                        {label(USED_CONDITION_SHORT, u.conditionGrade)}
                      </td>
                      <td className="tabular px-4 py-2.5 text-ink-2">{won(u.priceKrw)}</td>
                      <td className="tabular px-4 py-2.5 text-ink-2">{u.quantity}</td>
                      <td className="px-4 py-2.5">
                        {/* 상태는 자주 바꾸는 값이라 목록에서 바로 바꾼다 */}
                        <select
                          aria-label={`${u.nameKo} 판매 상태`}
                          value={u.status}
                          disabled={busy}
                          onChange={(e) => void setStatusOf(u, e.target.value)}
                          className="rounded-xs border border-line bg-surface px-2 py-1 text-xs font-semibold"
                        >
                          {Object.entries(USED_STATUS).map(([v, t]) => (
                            <option key={v} value={v}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        {u.visible ? (
                          <Pill tone={statusTone(u.status)}>보임</Pill>
                        ) : (
                          <Pill>감춤</Pill>
                        )}
                      </td>
                      <td className="tabular px-4 py-2.5 text-xs text-ink-3">
                        {whenKo(u.updatedAt)}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <Button
                          className="mr-1.5"
                          disabled={busy}
                          onClick={() => (u.visible ? setHiding(u) : void setVisible(u, true))}
                        >
                          {u.visible ? "감추기" : "보이기"}
                        </Button>
                        <Button onClick={() => nav(`/used/${u.id}`)}>수정</Button>
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
            자료는 지워지지 않습니다.
          </>
        }
        confirmText="감추기"
        onConfirm={() => hiding && void setVisible(hiding, false)}
        onCancel={() => setHiding(null)}
      />
    </>
  );
}
