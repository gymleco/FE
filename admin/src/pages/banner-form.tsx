import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import { ApiError, api, type Banner, type BannerPositionOption } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import {
  fromDatetimeInput,
  normalizeFieldErrors,
  toDatetimeInput,
  whenKo,
} from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { ImagePicker } from "@/components/image-picker";
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
 * 배너 등록 · 수정.
 *
 * 서버가 막는 것을 화면이 먼저 말해 준다.
 *
 *  1. PC · 모바일 사진 둘 다 필수다 (DB NOT NULL).
 *     한 장으로 양쪽을 덮으면 반드시 한쪽이 잘린다.
 *  2. 종료일은 시작일보다 뒤여야 한다 (CHECK 제약).
 *  3. 기간을 넘긴 배너는 «보임» 이어도 사이트에 안 나간다.
 *     이건 오류가 아니라 설계인데, 화면이 말해 주지 않으면
 *     «보임으로 해 뒀는데 왜 안 나오지» 가 된다.
 */

type Draft = {
  position: string;
  imagePcKey: string | null;
  imageMobileKey: string | null;
  title: string;
  subtitle: string;
  linkUrl: string;
  startsAt: string;
  endsAt: string;
  sortOrder: string;
  visible: boolean;
};

const EMPTY: Draft = {
  position: "MAIN",
  imagePcKey: null,
  imageMobileKey: null,
  title: "",
  subtitle: "",
  linkUrl: "",
  startsAt: "",
  endsAt: "",
  sortOrder: "0",
  visible: false,
};

function fromBanner(b: Banner): Draft {
  return {
    position: b.position,
    imagePcKey: b.imagePcKey || null,
    imageMobileKey: b.imageMobileKey || null,
    title: b.title ?? "",
    subtitle: b.subtitle ?? "",
    linkUrl: b.linkUrl ?? "",
    startsAt: toDatetimeInput(b.startsAt),
    endsAt: toDatetimeInput(b.endsAt),
    sortOrder: String(b.sortOrder ?? 0),
    visible: b.visible,
  };
}

export function BannerForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const editing = Boolean(id);

  const [draft, setDraft] = useState<Draft>(() => ({
    ...EMPTY,
    // 목록에서 «이 자리에 추가» 로 들어오면 그 위치를 미리 골라 둔다
    position: params.get("position") ?? EMPTY.position,
  }));
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [askRemove, setAskRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const { data: positions } = useLoad<BannerPositionOption[]>(
    () => api.get<BannerPositionOption[]>("/admin/banner-positions"),
    [],
  );

  /*
   * 서버에 «배너 한 건» 엔드포인트가 없다 — 목록에서 골라 온다.
   * 배너는 페이지마다 한두 개뿐이라 목록이 짧다. 없는 API 를 기다리느니
   * 있는 것으로 화면을 완성한다.
   */
  const { data: all, error, loading } = useLoad<Banner[]>(
    () => (editing ? api.get<Banner[]>("/admin/banners") : Promise.resolve([])),
    [id],
  );

  const current = (all ?? []).find((b) => String(b.id) === id) ?? null;

  if (editing && current && !loaded) {
    setDraft(fromBanner(current));
    setLoaded(true);
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  /* ── 저장 전에 화면이 잡아 주는 것 ─────────────────────── */

  const localErrors: Record<string, string> = {};
  if (!draft.imagePcKey) localErrors.imagePcKey = "PC 사진을 올려 주세요.";
  if (!draft.imageMobileKey) localErrors.imageMobileKey = "모바일 사진을 올려 주세요.";
  if (draft.startsAt && draft.endsAt && draft.endsAt <= draft.startsAt) {
    localErrors.endsAt = "종료 시각이 시작 시각보다 뒤여야 합니다.";
  }
  if (draft.linkUrl && !/^(https?:\/\/|\/)/i.test(draft.linkUrl)) {
    localErrors.linkUrl = "https:// 로 시작하거나, 사이트 안의 주소면 / 로 시작해야 합니다.";
  }
  const blocked = Object.keys(localErrors).length > 0;
  const errorOf = (k: string) => localErrors[k] ?? errors[k];

  /** 지금 저장하면 사이트에 실제로 나가는가 */
  const willShow =
    draft.visible &&
    !(draft.startsAt && new Date(`${draft.startsAt}:00+09:00`).getTime() > Date.now()) &&
    !(draft.endsAt && new Date(`${draft.endsAt}:00+09:00`).getTime() <= Date.now());

  function body() {
    return {
      position: draft.position,
      imagePcKey: draft.imagePcKey,
      imageMobileKey: draft.imageMobileKey,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      linkUrl: draft.linkUrl.trim(),
      startsAt: fromDatetimeInput(draft.startsAt),
      endsAt: fromDatetimeInput(draft.endsAt),
      sortOrder: Number(draft.sortOrder) || 0,
      visible: draft.visible,
    };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (blocked) return;
    setSaving(true);
    setErrors({});
    setNotice(null);
    try {
      if (editing) {
        await api.put(`/admin/banners/${id}`, body());
        toast("저장했습니다.");
      } else {
        await api.post<{ id: number }>("/admin/banners", body());
        toast(
          draft.visible ? "등록했습니다." : "등록했습니다. 아직 사이트에는 감춰져 있습니다.",
        );
      }
      nav("/banners", { replace: true });
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
      await api.del(`/admin/banners/${id}`);
      toast("삭제했습니다.");
      nav("/banners", { replace: true });
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
  if (editing && !current) {
    return (
      <Card>
        <Empty action={<Button onClick={() => nav("/banners")}>목록으로</Button>}>
          {error ?? "이 배너를 찾을 수 없습니다. 이미 지워졌을 수 있습니다."}
        </Empty>
      </Card>
    );
  }

  return (
    <>
      <PageHead
        title={editing ? "배너 수정" : "새 배너"}
        desc={
          editing
            ? `마지막 수정 ${whenKo(current?.updatedAt)}`
            : "사진을 올리고 어느 페이지에 걸지 고릅니다."
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
        <Card title="어디에 걸까요">
          <div className="grid gap-5 p-4 md:grid-cols-2">
            <Field label="위치" required error={errorOf("position")}>
              {({ id: fid, describedBy, invalid }) => (
                <select
                  id={fid}
                  value={draft.position}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("position", e.target.value)}
                  className={inputClass(invalid)}
                >
                  {(positions ?? []).map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field
              label="순서"
              showOptional={false}
              help="같은 자리에 여러 장이면 작은 숫자가 먼저 나옵니다."
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
        </Card>

        <Card title="사진">
          <div className="grid gap-6 p-4 md:grid-cols-2">
            <ImagePicker
              label="PC 사진"
              required
              value={draft.imagePcKey}
              onChange={(k) => set("imagePcKey", k)}
              help="가로로 넓은 사진 · 가로 1920px 이상 권장"
              error={errorOf("imagePcKey")}
            />
            <ImagePicker
              label="모바일 사진"
              required
              value={draft.imageMobileKey}
              onChange={(k) => set("imageMobileKey", k)}
              help="세로로 긴 사진 · 가로 800px 이상 권장"
              error={errorOf("imageMobileKey")}
            />
          </div>
          <p className="border-t border-line-soft px-4 py-2.5 text-xs leading-relaxed text-ink-3">
            두 장을 따로 받는 이유는, 가로 사진을 휴대폰 화면에 넣으면 좌우가 잘려
            기구가 프레임 밖으로 나가기 때문입니다. 세로 사진을 PC 로 늘리면 흐려집니다.
          </p>
        </Card>

        <Card title="사진 위에 얹을 글" >
          <p className="border-b border-line-soft px-4 py-2.5 text-xs text-ink-3">
            비워 두면 사진만 나옵니다.
          </p>
          <div className="grid gap-5 p-4">
            <Field label="제목" showOptional={false} error={errorOf("title")}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  value={draft.title}
                  maxLength={120}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("title", e.target.value)}
                  className={inputClass(invalid)}
                />
              )}
            </Field>

            <Field label="한 줄 설명" showOptional={false} error={errorOf("subtitle")}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  value={draft.subtitle}
                  maxLength={200}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("subtitle", e.target.value)}
                  className={inputClass(invalid)}
                />
              )}
            </Field>

            <Field
              label="누르면 갈 주소"
              showOptional={false}
              help="사이트 안이면 /products 처럼, 바깥이면 https:// 로 시작하는 전체 주소를 넣습니다."
              error={errorOf("linkUrl")}
            >
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  value={draft.linkUrl}
                  maxLength={255}
                  placeholder="/products"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("linkUrl", e.target.value)}
                  className={inputClass(invalid, "font-mono text-[0.82rem]")}
                />
              )}
            </Field>
          </div>
        </Card>

        <Card title="언제 보일까요">
          <div className="grid gap-5 p-4 md:grid-cols-2">
            <Field
              label="시작"
              showOptional={false}
              help="비우면 저장하는 즉시부터입니다."
              error={errorOf("startsAt")}
            >
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  type="datetime-local"
                  value={draft.startsAt}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("startsAt", e.target.value)}
                  className={inputClass(invalid, "tabular")}
                />
              )}
            </Field>

            <Field
              label="종료"
              showOptional={false}
              help="비우면 내릴 때까지 계속 나갑니다."
              error={errorOf("endsAt")}
            >
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  type="datetime-local"
                  value={draft.endsAt}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => set("endsAt", e.target.value)}
                  className={inputClass(invalid, "tabular")}
                />
              )}
            </Field>

            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-semibold">사이트 노출</p>
              <Toggle
                checked={draft.visible}
                onChange={(v) => set("visible", v)}
                onLabel="보임"
                offLabel="감춤"
              />
              {/*
                «보임» 인데 기간 때문에 안 나가는 상태가 가장 헷갈린다.
                저장하기 전에 결과를 미리 말해 준다.
              */}
              <p className="mt-2 text-xs">
                {willShow ? (
                  <span className="font-semibold text-ok">
                    저장하면 사이트에 바로 나갑니다.
                  </span>
                ) : draft.visible ? (
                  <span className="font-semibold text-warn">
                    «보임» 이지만 설정한 기간 밖이라 지금은 나가지 않습니다.
                  </span>
                ) : (
                  <span className="text-ink-3">감춰 둔 상태입니다. 사이트에 나오지 않습니다.</span>
                )}
              </p>
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
              {/*
                무엇 때문에 막혔는지 알려 준다. «고칠 곳이 있습니다» 만
                띄우면 긴 폼에서 어디를 봐야 하는지 찾으러 다녀야 한다.
              */}
              {blocked && (
                <Pill tone="risk">
                  {localErrors.imagePcKey || localErrors.imageMobileKey
                    ? "사진을 올려 주세요"
                    : "고칠 곳이 있습니다"}
                </Pill>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => nav("/banners")} disabled={saving}>
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
        title="배너를 지울까요?"
        body={
          <>
            <b>{draft.title || "제목 없는 배너"}</b> 를 완전히 지웁니다. 되돌릴 수 없습니다.
            잠시 내리는 것이라면 «감춤» 으로 바꿔 저장하세요.
          </>
        }
        confirmText="삭제"
        onConfirm={() => void remove()}
        onCancel={() => setAskRemove(false)}
      />
    </>
  );
}
