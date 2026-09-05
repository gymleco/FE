import { useState } from "react";

import { ApiError, api, type SectionMedia as Section } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { SECTION_MEDIA, whenKo } from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { ImagePicker } from "@/components/image-picker";
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
 * 구역 사진 — 메인 등의 고정 자리에 들어가는 사진.
 *
 * 배너와 다른 점은 «개수가 늘지 않는다» 는 것이다. 구역 자체는 코드에
 * 박혀 있고 사진만 바뀐다. 그래서 «추가» 버튼이 없고, 정해진 칸이
 * 처음부터 다 놓여 있다.
 *
 * ★ 구역 이름을 사람이 입력하게 두지 않는다.
 *   서버는 아무 문자열이나 받는다 (section_key 는 그냥 VARCHAR 다).
 *   오타 하나면 사진이 어디에도 안 뜨는데, 화면에는 «저장됨» 이라고
 *   찍혀 있어 알아챌 방법이 없다. 목록은 labels.ts 가 들고 있다.
 *
 * ★ 목록에 없는 키가 DB 에 있으면 그것도 함께 띄운다.
 *   모르는 값이라고 감추면, 이미 올려 둔 사진이 관리 화면에서 사라져
 *   지울 수도 바꿀 수도 없게 된다.
 */

export function SectionMediaPage() {
  const { data, error, loading, reload } = useLoad<Section[]>(
    () => api.get<Section[]>("/admin/section-media"),
    [],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-3">
        <Spinner /> 불러오는 중
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <Empty action={<Button onClick={reload}>다시 시도</Button>}>{error}</Empty>
      </Card>
    );
  }

  const saved = data ?? [];
  const knownKeys = new Set(SECTION_MEDIA.map((s) => s.key));
  const strays = saved.filter((s) => !knownKeys.has(s.sectionKey));

  return (
    <>
      <PageHead
        title="구역 사진"
        desc="메인처럼 자리가 정해진 곳에 들어가는 사진입니다. 배너와 달리 개수가 늘지 않고, 각 자리의 사진만 바뀝니다."
      />

      <div className="flex flex-col gap-4">
        {SECTION_MEDIA.map((slot) => (
          <SectionCard
            /*
             * 저장한 뒤 목록을 다시 받으면 그 칸만 새로 그린다.
             * 칸이 들고 있는 값은 처음 그릴 때 정해지므로, 열쇠에
             * 수정 시각을 섞지 않으면 다른 사람이 고친 사진이 화면에
             * 반영되지 않은 채 «바뀐 것이 없습니다» 로 남는다.
             */
            key={`${slot.key}:${saved.find((s) => s.sectionKey === slot.key)?.updatedAt ?? "none"}`}
            sectionKey={slot.key}
            label={slot.label}
            where={slot.where}
            current={saved.find((s) => s.sectionKey === slot.key) ?? null}
            onSaved={reload}
          />
        ))}

        {strays.length > 0 && (
          <>
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              아래는 화면 목록에 없는 자리입니다. 예전에 등록해 둔 것이거나
              공개 사이트에서 이미 쓰지 않는 자리일 수 있습니다.
            </p>
            {strays.map((s) => (
              <SectionCard
                key={`${s.sectionKey}:${s.updatedAt}`}
                sectionKey={s.sectionKey}
                label={s.sectionKey}
                where="화면 목록에 없는 자리"
                current={s}
                onSaved={reload}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
}

function SectionCard({
  sectionKey,
  label,
  where,
  current,
  onSaved,
}: {
  sectionKey: string;
  label: string;
  where: string;
  current: Section | null;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [pc, setPc] = useState<string | null>(current?.imagePcKey ?? null);
  const [mobile, setMobile] = useState<string | null>(current?.imageMobileKey ?? null);
  const [alt, setAlt] = useState(current?.altText ?? "");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const changed =
    pc !== (current?.imagePcKey ?? null) ||
    mobile !== (current?.imageMobileKey ?? null) ||
    alt !== (current?.altText ?? "");

  const missing = !pc || !mobile;

  async function save() {
    if (!changed || missing) return;
    setSaving(true);
    setNotice(null);
    try {
      await api.put(`/admin/section-media/${encodeURIComponent(sectionKey)}`, {
        imagePcKey: pc,
        imageMobileKey: mobile,
        altText: alt.trim(),
      });
      toast(`«${label}» 사진을 저장했습니다.`);
      onSaved();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title={label}
      action={
        current ? (
          <span className="text-xs text-ink-3">수정 {whenKo(current.updatedAt)}</span>
        ) : (
          <Pill>아직 비어 있음</Pill>
        )
      }
    >
      <p className="border-b border-line-soft px-4 py-2.5 text-xs text-ink-3">{where}</p>

      <div className="grid gap-6 p-4 md:grid-cols-2">
        <ImagePicker
          label="PC 사진"
          required
          value={pc}
          onChange={setPc}
          help="가로 1920px 이상 권장"
        />
        <ImagePicker
          label="모바일 사진"
          required
          value={mobile}
          onChange={setMobile}
          help="세로로 긴 사진 · 가로 800px 이상 권장"
        />
      </div>

      <div className="px-4 pb-4">
        <Field
          label="사진 설명"
          showOptional={false}
          help="사진이 안 뜨거나 눈으로 볼 수 없는 사람에게 대신 읽히는 글입니다. 예: 짐레코 파워랙이 놓인 헬스장 전경"
        >
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              value={alt}
              maxLength={200}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              onChange={(e) => setAlt(e.target.value)}
              className={inputClass(invalid)}
            />
          )}
        </Field>
      </div>

      {notice && (
        <p
          role="alert"
          className="mx-4 mb-4 rounded-xs border border-risk/30 bg-risk-bg px-3.5 py-2.5 text-sm font-semibold text-risk"
        >
          {notice}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-line-soft px-4 py-3">
        <span className="text-xs text-ink-3">
          {missing
            ? "PC · 모바일 사진이 둘 다 있어야 저장됩니다."
            : changed
              ? "바뀐 내용이 있습니다."
              : "바뀐 것이 없습니다."}
        </span>
        <div className="flex gap-2">
          <Button
            disabled={!changed || saving}
            onClick={() => {
              setPc(current?.imagePcKey ?? null);
              setMobile(current?.imageMobileKey ?? null);
              setAlt(current?.altText ?? "");
              setNotice(null);
            }}
          >
            되돌리기
          </Button>
          <Button
            tone="primary"
            busy={saving}
            disabled={!changed || missing}
            onClick={() => void save()}
          >
            저장
          </Button>
        </div>
      </div>
    </Card>
  );
}
