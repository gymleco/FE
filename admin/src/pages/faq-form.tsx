import { useId, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { ApiError, api, type Faq } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { normalizeFieldErrors, whenKo } from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { Confirm } from "@/components/confirm";
import {
  Button,
  Card,
  Empty,
  Field,
  Spinner,
  Toggle,
  inputClass,
  useToast,
} from "@/components/ui";

/**
 * 자주 묻는 질문 — 등록 · 수정.
 *
 * ★ 답변은 저장할 때 서버가 걸러낸다.
 *   허용되는 것은 굵게 · 줄바꿈 · 목록 · 표 · 링크 정도이고, 그 밖의
 *   태그는 저장하는 순간 사라진다. 그 사실을 화면에 적어 둔다 —
 *   안 적으면 «분명히 넣었는데 없어졌다» 가 된다.
 *
 * ★ 태그를 몰라도 쓸 수 있어야 한다.
 *   그냥 줄바꿈해서 쓰면 그대로 보이도록, 저장 전에 빈 줄을 문단으로
 *   바꿔 준다. HTML 을 아는 사람이 <p> 를 직접 써도 그대로 통과한다.
 */

type Draft = {
  category: string;
  question: string;
  answer: string;
  sortOrder: string;
  visible: boolean;
};

const EMPTY: Draft = {
  category: "일반",
  question: "",
  answer: "",
  sortOrder: "0",
  visible: true,
};

/**
 * 사람이 쓴 줄바꿈을 문단으로 바꾼다.
 *
 * 태그가 이미 들어 있으면 손대지 않는다 — 아는 사람이 직접 쓴 것을
 * 두 번 감싸면 문단 안에 문단이 생겨 간격이 이상해진다.
 */
function toHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${block.trim().replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

/** 위의 역방향 — 폼에 되돌려 놓을 때 태그를 걷어 낸다 */
function toPlain(html: string): string {
  if (!html) return "";
  // 서버가 <p>…</p> 로 감싼 것만 되돌린다. 그 외 서식은 태그째 보여 준다.
  if (!/^(\s*<p>[\s\S]*<\/p>\s*)+$/i.test(html)) return html;
  return html
    .split(/<\/p>/i)
    .map((part) => part.replace(/<p>/i, "").replace(/<br\s*\/?>/gi, "\n").trim())
    .filter(Boolean)
    .join("\n\n");
}

export function FaqForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const editing = Boolean(id);
  const listId = useId();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [askRemove, setAskRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  /* 목록에서 골라 온다 — 서버에 «FAQ 한 건» 엔드포인트가 없다 */
  const { data: all, error, loading } = useLoad<Faq[]>(
    () => api.get<Faq[]>("/admin/support/faq"),
    [id],
  );

  const current = editing ? ((all ?? []).find((f) => String(f.id) === id) ?? null) : null;

  if (editing && current && !loaded) {
    setDraft({
      category: current.category ?? "일반",
      question: current.question,
      answer: toPlain(current.answer ?? ""),
      sortOrder: String(current.sortOrder ?? 0),
      visible: current.visible,
    });
    setLoaded(true);
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  /** 이미 쓰고 있는 분류를 골라 쓸 수 있게 — 새로 치면 새 분류가 된다 */
  const categories = [...new Set((all ?? []).map((f) => f.category).filter(Boolean))];

  const localErrors: Record<string, string> = {};
  if (!draft.question.trim()) localErrors.question = "질문을 입력해 주세요.";
  if (draft.question.length > 200) {
    localErrors.question = `200자까지 넣을 수 있습니다. (지금 ${draft.question.length}자)`;
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
      category: draft.category.trim() || "일반",
      question: draft.question.trim(),
      answer: toHtml(draft.answer),
      sortOrder: Number(draft.sortOrder) || 0,
      visible: draft.visible,
    };
    try {
      if (editing) {
        await api.put(`/admin/support/faq/${id}`, body);
        toast("저장했습니다.");
      } else {
        await api.post<{ id: number }>("/admin/support/faq", body);
        toast(draft.visible ? "등록했습니다." : "등록했습니다. 아직 감춰져 있습니다.");
      }
      nav("/faq", { replace: true });
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
      await api.del(`/admin/support/faq/${id}`);
      toast("삭제했습니다.");
      nav("/faq", { replace: true });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "삭제하지 못했습니다.", "risk");
      setRemoving(false);
      setAskRemove(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-3">
        <Spinner /> 불러오는 중
      </div>
    );
  }
  if (editing && !current) {
    return (
      <Card>
        <Empty action={<Button onClick={() => nav("/faq")}>목록으로</Button>}>
          {error ?? "이 질문을 찾을 수 없습니다. 이미 지워졌을 수 있습니다."}
        </Empty>
      </Card>
    );
  }

  return (
    <>
      <PageHead
        title={editing ? "질문 수정" : "새 질문"}
        desc={
          editing
            ? `마지막 수정 ${whenKo(current?.updatedAt)}`
            : "고객센터의 자주 묻는 질문에 한 항목이 늘어납니다."
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
        <Card title="문답">
          <div className="grid gap-5 p-4">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_8rem]">
              <Field
                label="분류"
                showOptional={false}
                help="같은 분류끼리 묶여 나옵니다. 새로 적으면 새 분류가 생깁니다."
                error={errorOf("category")}
              >
                {({ id: fid, describedBy, invalid }) => (
                  <>
                    <input
                      id={fid}
                      list={listId}
                      value={draft.category}
                      maxLength={40}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      onChange={(e) => set("category", e.target.value)}
                      className={inputClass(invalid)}
                    />
                    <datalist id={listId}>
                      {categories.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </>
                )}
              </Field>

              <Field
                label="순서"
                showOptional={false}
                help="작을수록 위"
                error={errorOf("sortOrder")}
              >
                {({ id: fid, describedBy, invalid }) => (
                  <input
                    id={fid}
                    type="number"
                    value={draft.sortOrder}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    onChange={(e) => set("sortOrder", e.target.value)}
                    className={inputClass(invalid, "tabular")}
                  />
                )}
              </Field>
            </div>

            <Field label="질문" required error={errorOf("question")}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  value={draft.question}
                  maxLength={200}
                  placeholder="예: 설치는 어떻게 진행되나요?"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("question", e.target.value)}
                  className={inputClass(invalid)}
                />
              )}
            </Field>

            <Field
              label="답변"
              showOptional={false}
              help="그냥 줄바꿈해서 쓰시면 됩니다. 굵게 · 목록 · 표 · 링크는 그대로 남고, 그 밖의 태그는 저장할 때 서버가 걷어냅니다."
              error={errorOf("answer")}
            >
              {({ id: fid, describedBy, invalid }) => (
                <textarea
                  id={fid}
                  rows={10}
                  value={draft.answer}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("answer", e.target.value)}
                  className={inputClass(invalid, "resize-y leading-relaxed")}
                />
              )}
            </Field>

            <div>
              <p className="mb-2 text-sm font-semibold">사이트 노출</p>
              <Toggle
                checked={draft.visible}
                onChange={(v) => set("visible", v)}
                onLabel="보임"
                offLabel="감춤"
              />
            </div>
          </div>
        </Card>

        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:pl-60">
          <div className="flex items-center justify-between gap-3">
            <div>
              {editing && (
                <Button tone="danger" onClick={() => setAskRemove(true)} disabled={saving}>
                  삭제
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => nav("/faq")} disabled={saving}>
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
        title="이 질문을 지울까요?"
        body={
          <>
            <b>{draft.question || "제목 없는 질문"}</b> 을(를) 완전히 지웁니다.
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
