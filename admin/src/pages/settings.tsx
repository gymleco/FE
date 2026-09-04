import { useState } from "react";

import { ApiError, api } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { PageHead } from "@/components/shell";
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
 * 사이트 설정.
 *
 * ★ 칸을 하드코딩하지 않는다
 *   /admin/settings/schema 가 키 · 라벨 · 값의 종류 · 길이 상한을 내려준다.
 *   화면에 적어 두면 서버에 항목을 하나 더할 때마다 두 곳을 고쳐야 하고,
 *   한쪽만 고친 상태가 반드시 생긴다.
 *
 * ★ 바뀐 칸만 보낸다
 *   전부 보내면 손대지도 않은 옛 값이 지금 규칙에 걸려 저장이 통째로
 *   막힐 수 있다. 그리고 감사 로그에 «무엇을 고쳤는지» 가 정확히 남는다.
 *
 * ★ 보내기 전에 한 번 본다
 *   서버가 진짜 관문이다. 여기서 보는 것은 사람이 빨리 알아채라고 있는 것이지
 *   방어선이 아니다. 그래서 서버가 거절하면 그 문장을 그대로 보여 준다.
 */

type SchemaItem = {
  key: string;
  label: string;
  type: "TEXT" | "URL" | "PHONE" | "EMAIL" | "SLUG_LIST" | "THEME";
  maxLength: number;
  publicValue: boolean;
};

/** 키 앞머리로 묶는다. 순서가 곧 화면 순서다. */
const GROUPS: { prefix: string; title: string; desc?: string }[] = [
  {
    prefix: "company.",
    title: "사업자 정보",
    desc: "사이트 맨 아래에 표시됩니다. 실제 판매를 시작하면 표시 의무가 생깁니다.",
  },
  { prefix: "contact.", title: "연락처" },
  {
    prefix: "sns.",
    title: "SNS",
    desc: "등록한 것만 사이트에 나옵니다. 주소는 https:// 로 시작해야 합니다.",
  },
  { prefix: "home.", title: "메인 화면" },
  { prefix: "support.", title: "고객센터" },
  { prefix: "privacy.", title: "개인정보" },
  { prefix: "theme.", title: "화면" },
];

const HELP: Record<string, string> = {
  "company.registration_no": "예: 123-45-67890",
  "contact.phone": "예: 02-1234-5678",
  "contact.business_hours": "예: 평일 09:00~18:00 (점심 12:00~13:00)",
  "home.hero_product_slugs":
    "첫 화면 원판에 올릴 제품을 쉼표로 잇습니다. 예: power-rack,smith-machine",
  "home.banner_link": "상단 띠를 눌렀을 때 갈 주소입니다.",
  "theme.default": "처음 방문한 사람이 보게 될 화면입니다. 방문자가 직접 바꿀 수 있습니다.",
};

/** 서버의 SettingType 과 같은 규칙. 사람이 빨리 알아채라고 미리 본다. */
function localError(item: SchemaItem, value: string): string | null {
  if (value.length > item.maxLength) {
    return `${item.maxLength}자까지 넣을 수 있습니다. (지금 ${value.length}자)`;
  }
  if (value.includes("<") || value.includes(">")) {
    return "< 나 > 는 넣을 수 없습니다.";
  }
  if (!value) return null; // 빈 값은 «아직 없음» 이다

  switch (item.type) {
    case "URL":
      return /^https?:\/\//i.test(value)
        ? null
        : "주소는 http:// 또는 https:// 로 시작해야 합니다.";
    case "PHONE":
      return /^[0-9+\-() ]+$/.test(value)
        ? null
        : "숫자와 - ( ) + 만 넣을 수 있습니다.";
    case "EMAIL": {
      const at = value.indexOf("@");
      const dot = value.indexOf(".", at);
      return at > 0 && dot > at && !value.endsWith(".")
        ? null
        : "이메일 형식이 올바르지 않습니다.";
    }
    case "SLUG_LIST":
      return value
        .split(",")
        .every((p) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.trim()))
        ? null
        : "영문 소문자 · 숫자 · 하이픈만, 쉼표로 이어 주세요.";
    case "THEME":
      return value === "dark" || value === "light"
        ? null
        : "dark 또는 light 만 됩니다.";
    default:
      return null;
  }
}

export function Settings() {
  const toast = useToast();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { data, error, loading, reload } = useLoad<{
    schema: SchemaItem[];
    values: Record<string, string>;
  }>(async () => {
    const [schema, values] = await Promise.all([
      api.get<SchemaItem[]>("/admin/settings/schema"),
      api.get<Record<string, string>>("/admin/settings"),
    ]);
    return { schema, values };
  }, []);

  if (data && !loaded) {
    setDraft(data.values);
    setSaved(data.values);
    setLoaded(true);
  }

  const set = (key: string, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setServerErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const schema = data?.schema ?? [];
  const changedKeys = schema
    .map((s) => s.key)
    .filter((k) => (draft[k] ?? "") !== (saved[k] ?? ""));

  const localErrors: Record<string, string> = {};
  for (const item of schema) {
    const e = localError(item, draft[item.key] ?? "");
    if (e) localErrors[item.key] = e;
  }
  const errorOf = (key: string) => localErrors[key] ?? serverErrors[key];
  const blocked = Object.keys(localErrors).length > 0;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (changedKeys.length === 0 || blocked) return;

    setSaving(true);
    setNotice(null);
    setServerErrors({});
    try {
      const payload: Record<string, string> = {};
      for (const k of changedKeys) payload[k] = draft[k] ?? "";

      await api.put("/admin/settings", payload);
      setSaved({ ...saved, ...payload });
      toast(`${changedKeys.length}개 항목을 저장했습니다. 사이트에 바로 반영됩니다.`);
    } catch (err) {
      if (err instanceof ApiError) {
        /*
         * 이 API 는 «어느 칸» 을 따로 내려주지 않고 문장 앞에 라벨을 붙여 준다
         * (예: "대표 이메일: 이메일 형식이 올바르지 않습니다."). 라벨로 칸을
         * 되짚어 붙여 준다. 못 찾으면 위쪽에 문장 그대로 띄운다 —
         * 어느 칸인지 모르더라도 무슨 일이 있었는지는 반드시 보여야 한다.
         */
        const head = err.message.split(":")[0]?.trim();
        const hit = schema.find((s) => s.label === head);
        if (hit) {
          setServerErrors({ [hit.key]: err.message.slice(head!.length + 1).trim() });
          toast("입력을 확인해 주세요.", "risk");
        } else {
          setNotice(err.message);
        }
      } else {
        setNotice("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <>
      <PageHead
        title="사이트 설정"
        desc="여기서 고치면 공개 사이트에 바로 반영됩니다. 비워 두면 그 항목은 사이트에 표시되지 않습니다."
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
        {GROUPS.map((group) => {
          const items = schema.filter((s) => s.key.startsWith(group.prefix));
          if (items.length === 0) return null;
          return (
            <Card key={group.prefix} title={group.title}>
              {group.desc && (
                <p className="border-b border-line-soft px-4 py-2.5 text-xs text-ink-3">
                  {group.desc}
                </p>
              )}
              <div className="grid gap-5 p-4 md:grid-cols-2">
                {items.map((item) => {
                  const value = draft[item.key] ?? "";
                  const long = item.maxLength >= 200 && item.type === "TEXT";
                  return (
                    <div key={item.key} className={long ? "md:col-span-2" : undefined}>
                      <Field
                        label={item.label}
                        showOptional={false}
                        help={
                          HELP[item.key] ??
                          (item.publicValue ? undefined : "사이트에는 나오지 않는 값입니다.")
                        }
                        error={errorOf(item.key)}
                      >
                        {({ id, describedBy, invalid }) =>
                          item.type === "THEME" ? (
                            <select
                              id={id}
                              aria-describedby={describedBy}
                              aria-invalid={invalid}
                              value={value || "dark"}
                              onChange={(e) => set(item.key, e.target.value)}
                              className={inputClass(invalid)}
                            >
                              <option value="dark">어두운 화면</option>
                              <option value="light">밝은 화면</option>
                            </select>
                          ) : long ? (
                            <textarea
                              id={id}
                              rows={3}
                              aria-describedby={describedBy}
                              aria-invalid={invalid}
                              value={value}
                              onChange={(e) => set(item.key, e.target.value)}
                              className={inputClass(invalid, "resize-y leading-relaxed")}
                            />
                          ) : (
                            <input
                              id={id}
                              aria-describedby={describedBy}
                              aria-invalid={invalid}
                              value={value}
                              inputMode={
                                item.type === "PHONE"
                                  ? "tel"
                                  : item.type === "EMAIL"
                                    ? "email"
                                    : undefined
                              }
                              placeholder={item.type === "URL" ? "https://" : undefined}
                              onChange={(e) => set(item.key, e.target.value)}
                              className={inputClass(
                                invalid,
                                item.type === "URL" || item.type === "SLUG_LIST"
                                  ? "font-mono text-[0.82rem]"
                                  : "",
                              )}
                            />
                          )
                        }
                      </Field>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:pl-60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-ink-2">
              {blocked ? (
                <Pill tone="risk">고칠 곳이 있습니다</Pill>
              ) : changedKeys.length > 0 ? (
                <Pill tone="warn">{changedKeys.length}개 항목 바뀜</Pill>
              ) : (
                <span className="text-ink-3">바뀐 것이 없습니다</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                disabled={saving || changedKeys.length === 0}
                onClick={() => {
                  setDraft(saved);
                  setServerErrors({});
                  setNotice(null);
                }}
              >
                되돌리기
              </Button>
              <Button
                type="submit"
                tone="primary"
                busy={saving}
                disabled={changedKeys.length === 0 || blocked}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
