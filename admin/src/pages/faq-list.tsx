import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { ApiError, api, type Faq } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { whenKo } from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { Button, Card, Empty, Pill, Spinner, useToast } from "@/components/ui";
import { Confirm } from "@/components/confirm";

/**
 * 자주 묻는 질문.
 *
 * ★ 분류로 묶어서 보여 준다.
 *   공개 사이트가 분류별로 접었다 펴는 형태라, 관리 화면도 같은 모양이어야
 *   «배송 분류에 뭐가 들어 있더라» 를 눈으로 셀 일이 없다.
 *
 * ★ 감춘 항목도 목록에서 지우지 않는다.
 *   흐리게 남겨 둬야 «예전에 썼던 답변» 을 다시 찾을 수 있다.
 */
export function FaqList() {
  const nav = useNavigate();
  const toast = useToast();
  const [deleting, setDeleting] = useState<Faq | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, error, loading, reload } = useLoad<Faq[]>(
    () => api.get<Faq[]>("/admin/support/faq"),
    [],
  );

  async function remove(f: Faq) {
    setBusy(true);
    try {
      await api.del(`/admin/support/faq/${f.id}`);
      toast("질문을 지웠습니다.");
      setDeleting(null);
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "지우지 못했습니다.", "risk");
    } finally {
      setBusy(false);
    }
  }

  const items = data ?? [];
  // 서버가 분류 → 순서 → 번호로 정렬해 준다. 순서를 유지한 채 묶기만 한다.
  const groups: { category: string; items: Faq[] }[] = [];
  for (const f of items) {
    const name = f.category || "일반";
    const last = groups.at(-1);
    if (last && last.category === name) last.items.push(f);
    else groups.push({ category: name, items: [f] });
  }

  return (
    <>
      <PageHead
        title="자주 묻는 질문"
        desc="고객센터에 나가는 문답입니다. 문의로 같은 질문이 반복해서 들어오면 여기에 적어 두는 편이 서로 빠릅니다."
        action={
          <Button tone="primary" onClick={() => nav("/faq/new")}>
            + 새 질문
          </Button>
        }
      />

      {loading && (
        <Card>
          <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-ink-3">
            <Spinner /> 불러오는 중
          </div>
        </Card>
      )}

      {!loading && error && (
        <Card>
          <Empty action={<Button onClick={reload}>다시 시도</Button>}>{error}</Empty>
        </Card>
      )}

      {!loading && !error && items.length === 0 && (
        <Card>
          <Empty
            action={
              <Button tone="primary" onClick={() => nav("/faq/new")}>
                첫 질문 등록하기
              </Button>
            }
          >
            아직 등록된 질문이 없습니다. 고객센터의 자주 묻는 질문 자리가 비어 있습니다.
          </Empty>
        </Card>
      )}

      {!loading && !error && groups.length > 0 && (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <Card key={group.category} title={group.category}>
              <ul className="divide-y divide-line-soft">
                {group.items.map((f) => (
                  <li
                    key={f.id}
                    className={`flex flex-wrap items-center gap-3 p-4 ${
                      f.visible ? "" : "opacity-60"
                    }`}
                  >
                    <span className="tabular w-8 shrink-0 text-xs text-ink-3">
                      {f.sortOrder}
                    </span>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/faq/${f.id}`}
                        className="text-sm font-semibold text-ink hover:text-accent"
                      >
                        {f.question}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-ink-3">
                        {f.answer
                          ? stripTags(f.answer)
                          : "답변이 비어 있습니다 — 질문만 보입니다"}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-ink-3">{whenKo(f.updatedAt)}</span>

                    <div className="shrink-0">
                      {f.visible ? <Pill tone="ok">보임</Pill> : <Pill>감춤</Pill>}
                    </div>

                    <div className="shrink-0 whitespace-nowrap">
                      <Link
                        to={`/faq/${f.id}`}
                        className="mr-1.5 inline-flex items-center rounded-xs border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:bg-surface-2"
                      >
                        수정
                      </Link>
                      <Button tone="danger" disabled={busy} onClick={() => setDeleting(f)}>
                        삭제
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <Confirm
        open={deleting !== null}
        busy={busy}
        title="이 질문을 지울까요?"
        body={
          <>
            <b>{deleting?.question}</b> 을(를) 완전히 지웁니다. 되돌릴 수 없습니다.
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

/**
 * 미리보기용 — 답변에서 태그를 걷어 낸 글자만 남긴다.
 *
 * 서버가 이미 살균한 HTML 이지만, 목록 한 줄에 태그를 그려 넣을 이유가
 * 없다. 그리는 대신 텍스트로 만들어 붙인다 — 화면에 HTML 을 그리는
 * 자리를 늘리지 않는 편이 안전하다.
 */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
