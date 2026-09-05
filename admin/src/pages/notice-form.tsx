import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { ApiError, api, type Notice } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import {
  fromDatetimeInput,
  normalizeFieldErrors,
  toDatetimeInput,
  whenKo,
} from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { Confirm } from "@/components/confirm";
import {
  Button,
  Card,
  Empty,
  Field,
  Pill,
  Spinner,
  Toggle,
  inputClass,
  useToast,
} from "@/components/ui";

/**
 * 공지 등록 · 수정.
 *
 * ★ 발행일 없이 공개할 수 없다.
 *   DB 의 CHECK 제약이다 (`NOT visible OR published_at IS NOT NULL`).
 *   서버까지 갔다가 500 으로 돌아오면 쓰는 사람은 무슨 일이 났는지
 *   알 수 없다. 화면에서 먼저 막고, 왜 막혔는지와 «지금으로 넣기»를
 *   같이 준다.
 *
 * ★ 본문은 저장할 때 서버가 걸러낸다.
 *   FAQ 답변과 같은 규칙이다.
 */

type Draft = {
  title: string;
  body: string;
  pinned: boolean;
  publishedAt: string;
  visible: boolean;
};

const EMPTY: Draft = {
  title: "",
  body: "",
  pinned: false,
  publishedAt: "",
  visible: false,
};

function toHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${block.trim().replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function toPlain(html: string): string {
  if (!html) return "";
  if (!/^(\s*<p>[\s\S]*<\/p>\s*)+$/i.test(html)) return html;
  return html
    .split(/<\/p>/i)
    .map((part) => part.replace(/<p>/i, "").replace(/<br\s*\/?>/gi, "\n").trim())
    .filter(Boolean)
    .join("\n\n");
}

/** 지금 시각을 datetime-local 칸이 읽는 모양으로 */
function nowForInput(): string {
  return toDatetimeInput(new Date().toISOString());
}

export function NoticeForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const editing = Boolean(id);

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [askRemove, setAskRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  // 목록과 달리 상세는 본문까지 준다
  const { data, error, loading } = useLoad<Notice | null>(
    () => (editing ? api.get<Notice>(`/admin/support/notice/${id}`) : Promise.resolve(null)),
    [id],
  );

  if (editing && data && !loaded) {
    setDraft({
      title: data.title,
      body: toPlain(data.body ?? ""),
      pinned: data.pinned,
      publishedAt: toDatetimeInput(data.publishedAt),
      visible: data.visible,
    });
    setLoaded(true);
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const localErrors: Record<string, string> = {};
  if (!draft.title.trim()) localErrors.title = "제목을 입력해 주세요.";
  if (draft.title.length > 200) {
    localErrors.title = `200자까지 넣을 수 있습니다. (지금 ${draft.title.length}자)`;
  }
  if (draft.visible && !draft.publishedAt) {
    localErrors.publishedAt =
      "공개하려면 발행일이 있어야 합니다. 옆의 «지금으로 넣기» 를 누르거나 날짜를 골라 주세요.";
  }
  const blocked = Object.keys(localErrors).length > 0;
  const errorOf = (k: string) => localErrors[k] ?? errors[k];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (blocked) return;
    setSaving(true);
    setErrors({});
    setNotice(null);
    const body = {
      title: draft.title.trim(),
      body: toHtml(draft.body),
      pinned: draft.pinned,
      publishedAt: fromDatetimeInput(draft.publishedAt),
      visible: draft.visible,
    };
    try {
      if (editing) {
        await api.put(`/admin/support/notice/${id}`, body);
        toast("저장했습니다.");
      } else {
        await api.post<{ id: number }>("/admin/support/notice", body);
        toast(draft.visible ? "올렸습니다." : "저장했습니다. 아직 감춰져 있습니다.");
      }
      nav("/notices", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = normalizeFieldErrors(err.fields);
        setErrors(fields);
        if (Object.keys(fields).length === 0) setNotice(err.message);
        else toast("입력을 확인해 주세요.", "risk");
      } else {
        setNotice("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setRemoving(true);
    try {
      await api.del(`/admin/support/notice/${id}`);
      toast("삭제했습니다.");
      nav("/notices", { replace: true });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "삭제하지 못했습니다.", "risk");
      setRemoving(false);
      setAskRemove(false);
    }
  }

  if (editing && loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-3">
        <Spinner /> 불러오는 중
      </div>
    );
  }
  if (editing && (error || !data)) {
    return (
      <Card>
        <Empty action={<Button onClick={() => nav("/notices")}>목록으로</Button>}>
          {error ?? "이 공지를 찾을 수 없습니다. 이미 지워졌을 수 있습니다."}
        </Empty>
      </Card>
    );
  }

  return (
    <>
      <PageHead
        title={editing ? "공지 수정" : "새 공지"}
        desc={
          editing
            ? `마지막 수정 ${whenKo(data?.updatedAt)}`
            : "고객센터 공지사항에 한 건이 올라갑니다."
        }
      />

      {notice && (
        <p
          role="alert"
          className="mb-4 rounded-xs border border-risk/30 bg-risk-bg px-3.5 py-2.5 text-sm font-semibold text-risk"
        >
          {notice}
        </p>
      )}

      <form onSubmit={(e) => void save(e)} className="flex flex-col gap-4 pb-24">
        <Card title="내용">
          <div className="grid gap-5 p-4">
            <Field label="제목" required error={errorOf("title")}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  value={draft.title}
                  maxLength={200}
                  placeholder="예: 설 연휴 배송 일정 안내"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("title", e.target.value)}
                  className={inputClass(invalid)}
                />
              )}
            </Field>

            <Field
              label="본문"
              showOptional={false}
              help="그냥 줄바꿈해서 쓰시면 됩니다. 굵게 · 목록 · 표 · 링크는 그대로 남고, 그 밖의 태그는 저장할 때 서버가 걷어냅니다."
              error={errorOf("body")}
            >
              {({ id: fid, describedBy, invalid }) => (
                <textarea
                  id={fid}
                  rows={14}
                  value={draft.body}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("body", e.target.value)}
                  className={inputClass(invalid, "resize-y leading-relaxed")}
                />
              )}
            </Field>
          </div>
        </Card>

        <Card title="발행">
          <div className="grid gap-5 p-4 md:grid-cols-2">
            <Field
              label="발행일"
              required={draft.visible}
              showOptional={false}
              help="목록에 찍히는 날짜입니다. 공개하려면 반드시 있어야 합니다."
              error={errorOf("publishedAt")}
            >
              {({ id: fid, describedBy, invalid }) => (
                <div className="flex gap-2">
                  <input
                    id={fid}
                    type="datetime-local"
                    value={draft.publishedAt}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    onChange={(e) => set("publishedAt", e.target.value)}
                    className={inputClass(invalid, "tabular")}
                  />
                  <Button className="shrink-0" onClick={() => set("publishedAt", nowForInput())}>
                    지금으로 넣기
                  </Button>
                </div>
              )}
            </Field>

            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold">사이트 노출</p>
                <Toggle
                  checked={draft.visible}
                  onChange={(v) => set("visible", v)}
                  onLabel="보임"
                  offLabel="감춤"
                />
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  맨 위 고정
                  <span className="text-xs font-normal text-ink-3">선택</span>
                </p>
                <Toggle
                  checked={draft.pinned}
                  onChange={(v) => set("pinned", v)}
                  onLabel="고정"
                  offLabel="고정 안 함"
                />
                <p className="mt-1.5 text-xs text-ink-3">
                  점검 공지처럼 기간 내내 맨 위에 있어야 하는 글에 씁니다.
                  여러 건을 고정하면 고정의 의미가 없어집니다.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:pl-60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {editing && (
                <Button tone="danger" onClick={() => setAskRemove(true)} disabled={saving}>
                  삭제
                </Button>
              )}
              {localErrors.publishedAt && <Pill tone="risk">발행일이 필요합니다</Pill>}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => nav("/notices")} disabled={saving}>
                취소
              </Button>
              <Button type="submit" tone="primary" busy={saving} disabled={blocked}>
                {editing ? "저장" : "등록"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Confirm
        open={askRemove}
        busy={removing}
        title="이 공지를 지울까요?"
        body={
          <>
            <b>{draft.title || "제목 없는 공지"}</b> 을(를) 완전히 지웁니다.
            되돌릴 수 없습니다.
          </>
        }
        confirmText="삭제"
        onConfirm={() => void remove()}
        onCancel={() => setAskRemove(false)}
      />
    </>
  );
}
