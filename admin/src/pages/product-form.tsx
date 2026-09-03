import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { ApiError, api, type Product } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import {
  PRODUCT_CATEGORY,
  PRODUCT_TYPE,
  label,
  normalizeFieldErrors,
  options,
  toPyeong,
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
  inputClass,
  useToast,
} from "@/components/ui";

/**
 * 제품 등록 · 수정.
 *
 * 서버가 강제하는 규칙 네 가지를 화면이 미리 알려 준다. 저장을 누른 뒤에야
 * 알게 되면, 쓰는 사람은 자기가 뭘 잘못했는지 모른 채 되돌아와야 한다.
 *
 *  1. 사이트 주소는 등록한 뒤 바꿀 수 없다
 *  2. 품목 종류도 등록한 뒤 바꿀 수 없다
 *  3. 부품 · 악세사리는 분류가 자동으로 정해진다
 *  4. 기구는 설치 면적이 반드시 있어야 한다
 */

type Draft = {
  slug: string;
  type: string;
  category: string;
  nameKo: string;
  nameEn: string;
  summary: string;
  description: string;
  footprintM2: string;
  widthMm: string;
  depthMm: string;
  heightMm: string;
  weightKg: string;
  thumbnailKey: string | null;
  cutoutKey: string | null;
};

const EMPTY: Draft = {
  slug: "",
  type: "EQUIPMENT",
  category: "STRENGTH",
  nameKo: "",
  nameEn: "",
  summary: "",
  description: "",
  footprintM2: "",
  widthMm: "",
  depthMm: "",
  heightMm: "",
  weightKg: "",
  thumbnailKey: null,
  cutoutKey: null,
};

function fromProduct(p: Product): Draft {
  return {
    slug: p.slug,
    type: p.type,
    category: p.category,
    nameKo: p.nameKo,
    nameEn: p.nameEn,
    summary: p.summary ?? "",
    description: p.description ?? "",
    footprintM2: p.footprintM2 == null ? "" : String(p.footprintM2),
    widthMm: p.widthMm == null ? "" : String(p.widthMm),
    depthMm: p.depthMm == null ? "" : String(p.depthMm),
    heightMm: p.heightMm == null ? "" : String(p.heightMm),
    weightKg: p.weightKg == null ? "" : String(p.weightKg),
    thumbnailKey: p.thumbnailKey,
    cutoutKey: p.cutoutKey,
  };
}

/** 빈 칸은 아예 보내지 않는다. ""를 보내면 서버가 «0 글자» 로 받는다. */
const text = (v: string) => (v.trim() === "" ? null : v.trim());
const num = (v: string) => (v.trim() === "" ? null : Number(v));

export function ProductForm() {
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

  const { data, error, loading } = useLoad<Product | null>(
    async () => {
      if (!editing) return null;
      const p = await api.get<Product>(`/admin/products/${id}`);
      return p;
    },
    [id],
  );

  // 불러온 값을 폼에 한 번만 옮긴다. 매번 덮으면 타이핑이 지워진다.
  if (editing && data && !loaded) {
    setDraft(fromProduct(data));
    setLoaded(true);
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const isEquipment = draft.type === "EQUIPMENT";

  function body() {
    return {
      type: draft.type,
      // 부품 · 악세사리는 서버가 분류를 고정한다. 화면도 같은 값을 보내 어긋남을 막는다.
      category: isEquipment ? draft.category : draft.type,
      nameKo: text(draft.nameKo),
      nameEn: text(draft.nameEn),
      summary: text(draft.summary),
      description: text(draft.description),
      footprintM2: num(draft.footprintM2),
      widthMm: num(draft.widthMm),
      depthMm: num(draft.depthMm),
      heightMm: num(draft.heightMm),
      weightKg: num(draft.weightKg),
      thumbnailKey: draft.thumbnailKey,
      cutoutKey: draft.cutoutKey,
    };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setNotice(null);
    try {
      if (editing) {
        await api.put(`/admin/products/${id}`, body());
        toast("저장했습니다.");
      } else {
        const res = await api.post<{ id: number }>("/admin/products", {
          slug: text(draft.slug),
          product: body(),
        });
        toast("등록했습니다. 아직 사이트에는 감춰져 있습니다.");
        nav(`/products/${res.id}`, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = normalizeFieldErrors(err.fields);
        setErrors(fields);
        // 칸을 짚어 주지 못한 오류(중복 주소, 종류 변경 금지 등)는 위에 띄운다
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
      await api.del(`/admin/products/${id}`);
      toast("삭제했습니다.");
      nav("/products", { replace: true });
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
        <Empty action={<Button onClick={() => nav("/products")}>목록으로</Button>}>
          {error}
        </Empty>
      </Card>
    );
  }

  return (
    <>
      <PageHead
        title={editing ? draft.nameKo || "제품 수정" : "새 제품"}
        desc={
          editing
            ? "고친 내용은 저장하면 바로 반영됩니다."
            : "등록하면 감춘 상태로 시작합니다. 내용을 확인한 뒤 목록에서 보이게 해 주세요."
        }
        action={
          <div className="flex gap-2">
            <Button onClick={() => nav("/products")}>목록</Button>
            {editing && data && (data.visible ? <Pill tone="ok">사이트에 보임</Pill> : <Pill>감춤</Pill>)}
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
        <Card title="기본">
          <div className="grid gap-5 p-4 md:grid-cols-2">
            <Field
              label="사이트 주소"
              required
              help={
                editing
                  ? "등록한 뒤에는 바꿀 수 없습니다. 이미 나간 링크가 끊기기 때문입니다."
                  : "사이트 주소 끝에 붙는 이름입니다. 영문 소문자 · 숫자 · 하이픈만 씁니다. 예: power-rack"
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
                  placeholder="power-rack"
                  onChange={(e) => set("slug", e.target.value)}
                  className={inputClass(invalid, "font-mono")}
                />
              )}
            </Field>

            <Field
              label="품목 종류"
              required
              help={
                editing
                  ? "등록한 뒤에는 바꿀 수 없습니다."
                  : "부품 · 악세사리를 고르면 분류는 자동으로 정해집니다."
              }
              error={errors.type}
            >
              {({ id: fid, describedBy, invalid }) =>
                editing ? (
                  <input
                    id={fid}
                    aria-describedby={describedBy}
                    value={label(PRODUCT_TYPE, draft.type)}
                    disabled
                    className={inputClass(false)}
                  />
                ) : (
                  <select
                    id={fid}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    value={draft.type}
                    onChange={(e) => set("type", e.target.value)}
                    className={inputClass(invalid)}
                  >
                    {options(PRODUCT_TYPE).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.text}
                      </option>
                    ))}
                  </select>
                )
              }
            </Field>

            {isEquipment && (
              <Field label="분류" required error={errors.category}>
                {({ id: fid, describedBy, invalid }) => (
                  <select
                    id={fid}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    value={draft.category}
                    onChange={(e) => set("category", e.target.value)}
                    className={inputClass(invalid)}
                  >
                    {options(PRODUCT_CATEGORY)
                      .filter((o) => !["PART", "ACCESSORY"].includes(o.value))
                      .map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.text}
                        </option>
                      ))}
                  </select>
                )}
              </Field>
            )}

            <div className="md:col-start-1">
            <Field label="제품명 (한글)" required error={errors.nameKo}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.nameKo}
                  placeholder="파워 랙"
                  onChange={(e) => set("nameKo", e.target.value)}
                  className={inputClass(invalid)}
                />
              )}
            </Field>
            </div>

            <Field label="제품명 (영문)" required error={errors.nameEn}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.nameEn}
                  placeholder="Power Rack"
                  onChange={(e) => set("nameEn", e.target.value)}
                  className={inputClass(invalid)}
                />
              )}
            </Field>

            <div className="md:col-span-2">
              <Field
                label="한 줄 소개"
                help="목록에서 제품명 아래 보이는 짧은 문장입니다."
                error={errors.summary}
              >
                {({ id: fid, describedBy, invalid }) => (
                  <input
                    id={fid}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    value={draft.summary}
                    placeholder="프리웨이트의 중심. 한 대로 스쿼트부터 풀업까지."
                    onChange={(e) => set("summary", e.target.value)}
                    className={inputClass(invalid)}
                  />
                )}
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="상세 설명" error={errors.description}>
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

        <Card title="크기와 무게">
          <div className="grid gap-5 p-4 md:grid-cols-2 lg:grid-cols-3">
            <Field
              label="설치 면적 (m²)"
              required={isEquipment}
              help={
                isEquipment
                  ? `기구는 반드시 필요합니다. ${
                      toPyeong(Number(draft.footprintM2)) || "숫자를 넣으면 평으로도 보여 드립니다."
                    }`
                  : toPyeong(Number(draft.footprintM2)) || undefined
              }
              error={errors.footprintM2}
            >
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.footprintM2}
                  placeholder="2.6"
                  onChange={(e) => set("footprintM2", e.target.value)}
                  className={inputClass(invalid, "tabular")}
                />
              )}
            </Field>

            {/*
              기구는 가로 · 세로 · 높이가 모두 있어야 한다. DB 제약(ck_product_dimensions)
              이 강제하는 규칙이라, 하나라도 비우면 저장이 아예 되지 않는다.
              그 사실을 저장 누르기 «전» 에 알려 준다.
            */}
            {(
              [
                ["widthMm", "가로 (mm)"],
                ["depthMm", "세로 (mm)"],
                ["heightMm", "높이 (mm)"],
              ] as const
            ).map(([key, text2]) => (
              <Field
                key={key}
                label={text2}
                required={isEquipment}
                help={isEquipment ? "기구는 세 치수가 모두 필요합니다." : undefined}
                error={errors[key]}
              >
                {({ id: fid, describedBy, invalid }) => (
                  <input
                    id={fid}
                    type="number"
                    min="0"
                    inputMode="numeric"
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    value={draft[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={inputClass(invalid, "tabular")}
                  />
                )}
              </Field>
            ))}

            <Field label="무게 (kg)" error={errors.weightKg}>
              {({ id: fid, describedBy, invalid }) => (
                <input
                  id={fid}
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={draft.weightKg}
                  onChange={(e) => set("weightKg", e.target.value)}
                  className={inputClass(invalid, "tabular")}
                />
              )}
            </Field>
          </div>
        </Card>

        <Card title="사진">
          <div className="grid gap-6 p-4 md:grid-cols-2">
            <ImagePicker
              label="대표 사진"
              value={draft.thumbnailKey}
              onChange={(k) => set("thumbnailKey", k)}
              help="목록과 상세에 쓰입니다. 가로 1200px 이상 권장 · JPG 또는 PNG · 10MB 이하"
            />
            <ImagePicker
              label="누끼 사진"
              transparent
              value={draft.cutoutKey}
              onChange={(k) => set("cutoutKey", k)}
              help="배경을 지운 사진입니다. 첫 화면의 회전 원판에 쓰입니다. 투명 PNG 로 올려 주세요."
            />
          </div>
        </Card>

        {/* 저장 줄은 화면 아래에 붙여 둔다. 폼이 길어 매번 끝까지 내려가야 하면 안 된다. */}
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
              <Button onClick={() => nav("/products")} disabled={saving}>
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
        title="제품을 지울까요?"
        body={
          <>
            <b>{draft.nameKo}</b> 을(를) 완전히 지웁니다. 되돌릴 수 없습니다.
            <br />
            잠시 내리는 것이라면 삭제 대신 <b>감추기</b>를 쓰세요.
          </>
        }
        confirmText="삭제"
        onConfirm={() => void remove()}
        onCancel={() => setAskRemove(false)}
      />
    </>
  );
}
