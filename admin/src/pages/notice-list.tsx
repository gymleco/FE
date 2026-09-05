import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { ApiError, api, type Notice } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { whenKo } from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { Button, Card, Empty, Pill, Spinner, useToast } from "@/components/ui";
import { Confirm } from "@/components/confirm";

/**
 * 공지사항 — 고객센터.
 *
 * 소식(브랜드 메뉴)과 다른 게시판이다. 소식은 «신제품 입고·행사»,
 * 공지는 «점검·배송 지연» 이다. 보는 사람도 찾는 자리도 달라서
 * 한 곳에 섞으면 둘 다 신뢰를 잃는다 (V7 마이그레이션 주석).
 *
 * ★ 발행일이 없으면 공개할 수 없다 — DB 가 막는다.
 *   목록에서 그 상태를 먼저 짚어 준다. 수정 화면에 들어가서야
 *   저장이 안 되는 이유를 알게 되면 늦다.
 */
export function NoticeList() {
  const nav = useNavigate();
  const toast = useToast();
  const [deleting, setDeleting] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, error, loading, reload } = useLoad<Notice[]>(
    () => api.get<Notice[]>("/admin/support/notice"),
    [],
  );

  async function remove(n: Notice) {
    setBusy(true);
    try {
      await api.del(`/admin/support/notice/${n.id}`);
      toast("공지를 지웠습니다.");
      setDeleting(null);
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "지우지 못했습니다.", "risk");
    } finally {
      setBusy(false);
    }
  }

  const items = data ?? [];

  return (
    <>
      <PageHead
        title="공지사항"
        desc="고객센터에 올라가는 알림입니다. 점검·배송 지연처럼 «지금 알아야 하는 일»을 적습니다."
        action={
          <Button tone="primary" onClick={() => nav("/notices/new")}>
            + 새 공지
          </Button>
        }
      />

      <Card>
        {loading && (
          <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-ink-3">
            <Spinner /> 불러오는 중
          </div>
        )}

        {!loading && error && (
          <Empty action={<Button onClick={reload}>다시 시도</Button>}>{error}</Empty>
        )}

        {!loading && !error && items.length === 0 && (
          <Empty
            action={
              <Button tone="primary" onClick={() => nav("/notices/new")}>
                첫 공지 쓰기
              </Button>
            }
          >
            아직 올린 공지가 없습니다.
          </Empty>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="divide-y divide-line-soft">
            {items.map((n) => {
              const cannotPublish = n.visible && !n.publishedAt;
              return (
                <li
                  key={n.id}
                  className={`flex flex-wrap items-center gap-3 p-4 ${
                    n.visible ? "" : "opacity-60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {n.pinned && <Pill tone="warn">고정</Pill>}
                      <Link
                        to={`/notices/${n.id}`}
                        className="text-sm font-semibold text-ink hover:text-accent"
                      >
                        {n.title}
                      </Link>
                    </div>
                    <p className="tabular mt-0.5 text-xs text-ink-3">
                      {n.publishedAt ? (
                        <>발행 {whenKo(n.publishedAt)}</>
                      ) : (
                        <span className="font-semibold text-warn">발행일 없음</span>
                      )}
                      {" · "}수정 {whenKo(n.updatedAt)}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {cannotPublish ? (
                      <Pill tone="risk">발행일이 없어 안 나감</Pill>
                    ) : n.visible ? (
                      <Pill tone="ok">보임</Pill>
                    ) : (
                      <Pill>감춤</Pill>
                    )}
                  </div>

                  <div className="shrink-0 whitespace-nowrap">
                    <Link
                      to={`/notices/${n.id}`}
                      className="mr-1.5 inline-flex items-center rounded-xs border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:bg-surface-2"
                    >
                      수정
                    </Link>
                    <Button tone="danger" disabled={busy} onClick={() => setDeleting(n)}>
                      삭제
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Confirm
        open={deleting !== null}
        busy={busy}
        title="이 공지를 지울까요?"
        body={
          <>
            <b>{deleting?.title}</b> 을(를) 완전히 지웁니다. 되돌릴 수 없습니다.
            잠시 내리는 것이라면 «수정» 에서 감추기를 쓰세요.
          </>
        }
        confirmText="삭제"
        onConfirm={() => deleting && void remove(deleting)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
