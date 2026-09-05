import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { ApiError, api, type Banner, type BannerPositionOption } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { whenKo } from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { previewUrl } from "@/components/image-picker";
import { Button, Card, Empty, Pill, Spinner, useToast } from "@/components/ui";
import { Confirm } from "@/components/confirm";

/**
 * 배너 — 각 페이지 맨 위에 깔리는 사진.
 *
 * ★ 위치별로 묶어서 보여 준다.
 *   한 목록에 죽 늘어놓으면 «메인에 지금 뭐가 걸려 있지» 를 눈으로 세야 한다.
 *   배너는 개수보다 «어느 자리에 무엇이» 가 중요하다.
 *
 * ★ 기간이 지난 배너를 화면이 먼저 말해 준다.
 *   서버는 기간을 넘긴 배너를 공개 API 에서 빼 버린다. 관리 화면에서는
 *   여전히 «보임» 으로 보이므로, 사이트에 안 나오는 이유를 알 수 없다.
 *   그 차이를 여기서 메운다.
 */

type Live = { live: boolean; why: string | null };

/** 지금 이 순간 공개 사이트에 나가는 배너인가 */
function liveState(b: Banner): Live {
  if (!b.visible) return { live: false, why: "감춤" };
  const now = Date.now();
  if (b.startsAt && new Date(b.startsAt).getTime() > now) {
    return { live: false, why: "시작 전" };
  }
  if (b.endsAt && new Date(b.endsAt).getTime() <= now) {
    return { live: false, why: "기간 지남" };
  }
  return { live: true, why: null };
}

function periodText(b: Banner): string {
  if (!b.startsAt && !b.endsAt) return "제한 없음";
  return `${b.startsAt ? whenKo(b.startsAt) : "언제부터든"} ~ ${b.endsAt ? whenKo(b.endsAt) : "계속"}`;
}

export function BannerList() {
  const nav = useNavigate();
  const toast = useToast();
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, error, loading, reload } = useLoad<{
    banners: Banner[];
    positions: BannerPositionOption[];
  }>(async () => {
    const [banners, positions] = await Promise.all([
      api.get<Banner[]>("/admin/banners"),
      api.get<BannerPositionOption[]>("/admin/banner-positions"),
    ]);
    return { banners, positions };
  }, []);

  async function remove(b: Banner) {
    setBusy(true);
    try {
      await api.del(`/admin/banners/${b.id}`);
      toast(`${b.positionLabel} 배너를 지웠습니다.`);
      setDeleting(null);
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "지우지 못했습니다.", "risk");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-3">
        <Spinner /> 불러오는 중
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <Empty action={<Button onClick={reload}>다시 시도</Button>}>
          {error ?? "불러오지 못했습니다."}
        </Empty>
      </Card>
    );
  }

  return (
    <>
      <PageHead
        title="배너"
        desc="각 페이지 맨 위에 깔리는 사진입니다. PC 와 모바일 사진을 따로 올립니다 — 한 장으로 양쪽을 덮으면 반드시 한쪽이 잘립니다."
        action={
          <Button tone="primary" onClick={() => nav("/banners/new")}>
            + 새 배너
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        {data.positions.map((pos) => {
          const rows = data.banners.filter((b) => b.position === pos.value);
          return (
            <Card
              key={pos.value}
              title={pos.label}
              action={
                <Button onClick={() => nav(`/banners/new?position=${pos.value}`)}>
                  이 자리에 추가
                </Button>
              }
            >
              {rows.length === 0 ? (
                <p className="px-4 py-5 text-sm text-ink-3">
                  걸린 배너가 없습니다. 이 페이지는 배너 없이 열립니다.
                </p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {rows.map((b) => {
                    const state = liveState(b);
                    const thumb = previewUrl(b.imagePcKey, 400);
                    return (
                      <li key={b.id} className="flex flex-wrap items-center gap-3 p-4">
                        <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xs border border-line bg-surface-2">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="size-full object-cover"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          ) : (
                            <span className="text-[0.6rem] text-ink-3">없음</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {b.title || <span className="text-ink-3">제목 없음 (사진만)</span>}
                          </p>
                          {b.subtitle && (
                            <p className="truncate text-xs text-ink-2">{b.subtitle}</p>
                          )}
                          <p className="tabular mt-0.5 text-xs text-ink-3">
                            {periodText(b)} · 순서 {b.sortOrder} · 수정 {whenKo(b.updatedAt)}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {state.live ? (
                            <Pill tone="ok">지금 나감</Pill>
                          ) : (
                            <Pill tone={b.visible ? "warn" : "mute"}>{state.why}</Pill>
                          )}
                        </div>

                        <div className="shrink-0 whitespace-nowrap">
                          <Link
                            to={`/banners/${b.id}`}
                            className="mr-1.5 inline-flex items-center rounded-xs border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:bg-surface-2"
                          >
                            수정
                          </Link>
                          <Button tone="danger" disabled={busy} onClick={() => setDeleting(b)}>
                            삭제
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <Confirm
        open={deleting !== null}
        busy={busy}
        title="배너를 지울까요?"
        body={
          <>
            <b>{deleting?.positionLabel}</b> 자리의{" "}
            <b>{deleting?.title || "제목 없는 배너"}</b> 가 사라집니다.
            되돌릴 수 없습니다 — 잠시 내리는 것이라면 «수정» 에서 감추기를 쓰세요.
          </>
        }
        confirmText="삭제"
        onConfirm={() => deleting && void remove(deleting)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
