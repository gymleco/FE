import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { ApiError, api, type Product, type UsedItem } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { USED_CONDITION, USED_STATUS, label, normalizeFieldErrors, won } from "@/lib/labels";
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
  inputClass,
  useToast,
} from "@/components/ui";

/**
 * 중고 매물 등록 · 수정.
 *
 * 새 제품과 다른 점은 «한 대씩 다르다» 는 것이다. 그래서 상태 등급과
 * 수량이 있고, 수량이 0이 되면 서버가 판매 상태를 자동으로 «판매완료» 로
 * 바꾼다. 그 동작을 화면에도 적어 둔다 — 저장하고 나서 상태가 저절로
 * 바뀌어 있으면 고장으로 보인다.
 */

type Draft = {
  slug: string;
  nameKo: string;
  modelName: string;
  conditionGrade: string;
  yearMade: string;
  priceKrw: string;
  description: string;
  thumbnailKey: string | null;
  quantity: string;
  productId: string;
};

const EMPTY: Draft = {
  slug: "",
  nameKo: "",
  modelName: "",
  conditionGrade: "A",
  yearMade: "",
  priceKrw: "",
  description: "",
  thumbnailKey: null,
  quantity: "1",
  productId: "",
};

function fromItem(u: UsedItem): Draft {
  return {
    slug: u.slug,
    nameKo: u.nameKo,
    modelName: u.modelName ?? "",
    conditionGrade: u.conditionGrade,
    yearMade: u.yearMade == null ? "" : String(u.yearMade),
    priceKrw: u.priceKrw == null ? "" : String(u.priceKrw),
    description: u.description ?? "",
    thumbnailKey: u.thumbnailKey,
    quantity: String(u.quantity),
    productId: u.productId == null ? "" : String(u.productId),
  };
}

const text = (v: string) => (v.trim() === "" ? null : v.trim());
const num = (v: string) => (v.trim() === "" ? null : Number(v));

export function UsedForm() {
  const { id } = useParams();
  const editing = id !== undefined;
  const nav = useNavigate();
  const toast = useToast();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [askRemove, setAskRemove] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { data, error, loading } = useLoad<UsedItem | null>(
    async () => (editing ? api.get<UsedItem>(`/admin/used/${id}`) : null),
    [id],
  );

  // 「원래 어떤 제품인가」를 고르는 목록. 없어도 등록은 되므로 실패해도 넘어간다.
  const { data: products } = useLoad<Product[]>(
    () => api.get<Product[]>("/admin/products?type=EQUIPMENT").catch(() => []),
    [],
  );

  if (editing && data && !loaded) {
    setDraft(fromItem(data));
    setLoaded(true);
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  function body() {
    return {
      nameKo: text(draft.nameKo),
      modelName: text(draft.modelName),
      conditionGrade: draft.conditionGrade,
      yearMade: num(draft.yearMade),
      priceKrw: num(draft.priceKrw),
      description: text(draft.description),
      thumbnailKey: draft.thumbnailKey,
      quantity: num(draft.quantity),
      productId: num(draft.productId),
    };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setNotice(null);
    try {
      if (editing) {
        await api.put(`/admin/used/${id}`, body());
        toast("저장했습니다.");
      } else {
        const res = await api.post<{ id: number }>("/admin/used", {
          slug: text(draft.slug),
          item: body(),
        });
        toast("등록했습니다. 아직 사이트에는 감춰져 있습니다.");
        nav(`/used/${res.id}`, { replace: true });
      }
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
      await api.del(`/admin/used/${id}`);
      toast("삭제했습니다.");
      nav("/used", { replace: true });
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
  if (editing && error) {
    return (
      <Card>
        <Empty action={<Button onClick={() => nav("/used")}>목록으로</Button>}>{error}</Empty>
      </Card>
    );
  }

  const zeroQuantity = draft.quantity.trim() === "0";

  return (
    <>
      <PageHead
        title={editing ? draft.nameKo || "매물 수정" : "새 중고 매물"}
        desc={
          editing
            ? "고친 내용은 저장하면 바로 반영됩니다."
            : "등록하면 감춘 상태로 시작합니다. 사진과 상태를 확인한 뒤 목록에서 보이게 해 주세요."
        }
        action={
          <div className="flex items-center gap-2">
            <Button onClick={() => nav("/used")}>목록</Button>
            {editing && data && (
              <>
                <Pill tone={data.status === "AVAILABLE" ? "ok" : "mute"}>
                  {label(USED_STATUS, data.status)}
                </Pill>
                {data.visible ? <Pill tone="ok">사이트에 보임</Pill> : <Pill>감춤</Pill>}
              </>
            )}
          </div>
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
        <Card title="매물 정보">
          <div className="grid gap-5 p-4 md:grid-cols-2">
            <Field
              label="사이트 주소"
              required
              help={
                editing
                  ? "등록한 뒤에는 바꿀 수 없습니다."
                  : "영문 소문자 · 숫자 · 하이픈만 씁니다. 예: power-rack-2019-a"
              }
              error={errors.slug}
            >
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.slug}
                  disabled={editing}
                  placeholder="power-rack-2019-a"
                  onChange={(e) => set("slug", e.target.value)}
                  className={inputClass(invalid, "font-mono")}
                />
              )}
            </Field>

            <Field label="매물명" required error={errors.nameKo}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.nameKo}
                  placeholder="파워 랙 (2019년식)"
                  onChange={(e) => set("nameKo", e.target.value)}
                  className={inputClass(invalid)}
                />
              )}
            </Field>

            <Field label="모델명" error={errors.modelName}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.modelName}
                  onChange={(e) => set("modelName", e.target.value)}
                  className={inputClass(invalid)}
                />
              )}
            </Field>

            <Field
              label="상태 등급"
              required
              help="문의 전에 판단이 서야 헛걸음이 줄어듭니다. 실제보다 좋게 적지 않는 편이 결국 이득입니다."
              error={errors.conditionGrade}
            >
              {({ id: fid, describedBy, invalid }) => (
                <select
                  id={fid}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.conditionGrade}
                  onChange={(e) => set("conditionGrade", e.target.value)}
                  className={inputClass(invalid)}
                >
                  {Object.entries(USED_CONDITION).map(([v, t]) => (
                    <option key={v} value={v}>
                      {v} — {t.split(" — ")[1]}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="연식" help="1980 ~ 2100 사이" error={errors.yearMade}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  type="number"
                  min="1980"
                  max="2100"
                  inputMode="numeric"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.yearMade}
                  placeholder="2019"
                  onChange={(e) => set("yearMade", e.target.value)}
                  className={inputClass(invalid, "tabular")}
                />
              )}
            </Field>

            <Field
              label="가격 (원)"
              help={draft.priceKrw ? won(Number(draft.priceKrw)) : "비워 두면 사이트에 «문의» 로 표시됩니다."}
              error={errors.priceKrw}
            >
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.priceKrw}
                  placeholder="1200000"
                  onChange={(e) => set("priceKrw", e.target.value)}
                  className={inputClass(invalid, "tabular")}
                />
              )}
            </Field>

            <Field
              label="수량"
              help={
                zeroQuantity
                  ? "수량을 0으로 저장하면 판매 상태가 «판매완료» 로 자동으로 바뀝니다."
                  : "같은 매물이 여러 대면 대수를 적습니다."
              }
              error={errors.quantity}
            >
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  type="number"
                  min="0"
                  max="999"
                  inputMode="numeric"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                  className={inputClass(invalid, "tabular")}
                />
              )}
            </Field>

            <Field
              label="원래 제품"
              help="같은 모델의 새 제품이 라인업에 있으면 이어 둡니다. 사양을 대조해 보여 줄 수 있습니다."
              error={errors.productId}
            >
              {({ id: fid, describedBy, invalid }) => (
                <select
                  id={fid}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.productId}
                  onChange={(e) => set("productId", e.target.value)}
                  className={inputClass(invalid)}
                >
                  <option value="">이어 두지 않음</option>
                  {(products ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameKo}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <div className="md:col-span-2">
              <Field
                label="상태 설명"
                help="흠집 위치, 정비 내역처럼 사진으로 보이지 않는 것을 적어 주세요."
                error={errors.description}
              >
                {({ id: fid, describedBy, invalid }) => (
                  <textarea
                    id={fid}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    rows={5}
                    value={draft.description}
                    onChange={(e) => set("description", e.target.value)}
                    className={inputClass(invalid, "resize-y leading-relaxed")}
                  />
                )}
              </Field>
            </div>
          </div>
        </Card>

        <Card title="사진">
          <div className="p-4">
            <ImagePicker
              label="대표 사진"
              value={draft.thumbnailKey}
              onChange={(k) => set("thumbnailKey", k)}
              help="중고는 사진이 곧 신뢰입니다. 실제 상태가 보이도록 찍어 주세요. 가로 1200px 이상 · 10MB 이하"
            />
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
              <Button onClick={() => nav("/used")} disabled={saving}>
                취소
              </Button>
              <Button type="submit" tone="primary" busy={saving}>
                {editing ? "저장" : "등록"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Confirm
        open={askRemove}
        busy={removing}
        title="매물을 지울까요?"
        body={
          <>
            <b>{draft.nameKo}</b> 을(를) 완전히 지웁니다. 되돌릴 수 없습니다.
            <br />
            팔린 매물이라면 삭제 대신 <b>판매완료</b>로 두는 편이 기록이 남습니다.
          </>
        }
        confirmText="삭제"
        onConfirm={() => void remove()}
        onCancel={() => setAskRemove(false)}
      />
    </>
  );
}
