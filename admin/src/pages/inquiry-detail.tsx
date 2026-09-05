import { useState } from "react";
import { Link, useParams } from "react-router";

import { ApiError, api, type InquiryDetail as Detail, type Product } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { INQUIRY_STATUS, label, phoneKo, whenKo } from "@/lib/labels";
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
 * 문의 한 건.
 *
 * ★ 이 화면을 여는 것 자체가 기록에 남는다.
 *   서버가 열람 시점에 감사 로그를 쓴다 (InquiryAdminService.detail).
 *   그 사실을 화면에도 적는다 — 뒤에서 조용히 기록하는 것보다
 *   «남습니다» 라고 말해 두는 편이 서로에게 낫다.
 *
 * ★ 문의 내용을 HTML 로 그리지 않는다.
 *   이 글은 바깥 사람이 쓴 것이고 살균을 거치지 않는다. 줄바꿈만
 *   살려서 글자 그대로 보여 준다.
 */

function statusTone(s: string) {
  if (s === "NEW") return "warn" as const;
  if (s === "CONTACTING") return "ok" as const;
  if (s === "SPAM") return "risk" as const;
  return "mute" as const;
}

/** 파기까지 며칠 남았는지. 지났으면 음수 */
function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Number.isNaN(ms) ? null : Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function InquiryDetail() {
  const { id } = useParams();
  const toast = useToast();

  const { data, error, loading, reload, setData } = useLoad<Detail>(
    () => api.get<Detail>(`/admin/inquiries/${id}`),
    [id],
  );

  /*
   * 관심 제품은 서버가 번호로만 준다. 번호만 적어 두면 그게 무슨 기구인지
   * 알 수 없어 전화를 걸기 전에 제품 목록을 따로 열어 봐야 한다.
   * 목록을 한 번 받아 이름으로 바꿔 준다. 실패해도 화면은 살아 있어야
   * 하므로 이름을 못 찾으면 번호를 그대로 적는다.
   */
  const { data: products } = useLoad<Product[]>(
    () => api.get<Product[]>("/admin/products").catch(() => []),
    [],
  );

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
        <Empty
          action={
            <div className="flex gap-2">
              <Button onClick={reload}>다시 시도</Button>
              <Link
                to="/inquiries"
                className="inline-flex items-center rounded-xs border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:bg-surface-2"
              >
                목록으로
              </Link>
            </div>
          }
        >
          {error ?? "문의를 찾을 수 없습니다."}
        </Empty>
      </Card>
    );
  }

  const purgeIn = daysUntil(data.purgeAt);
  const productNames = data.productIds.map((pid) => {
    const hit = (products ?? []).find((p) => p.id === pid);
    return hit ? hit.nameKo : `제품 #${pid}`;
  });

  return (
    <>
      <PageHead
        title={`${data.name} 님 문의`}
        desc={`${whenKo(data.createdAt)} 접수 · ${data.type}`}
        action={
          <Link
            to="/inquiries"
            className="inline-flex items-center rounded-xs border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:bg-surface-2"
          >
            목록으로
          </Link>
        }
      />

      <p className="mb-4 rounded-xs border border-line bg-surface-2 px-3.5 py-2.5 text-xs leading-relaxed text-ink-2">
        이 화면에는 연락처가 그대로 나옵니다. <b>누가 언제 열어 봤는지 기록에 남습니다.</b>{" "}
        화면을 켜 둔 채 자리를 비우지 마세요.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex flex-col gap-4">
          <Card title="연락처">
            <dl className="grid gap-x-6 gap-y-3.5 p-4 sm:grid-cols-2">
              <Row term="이름" value={data.name} />
              <Row
                term="전화"
                value={
                  data.phone ? (
                    // 휴대폰에서 그대로 눌러 걸 수 있게 한다
                    <a
                      href={`tel:${data.phone.replace(/[^0-9+]/g, "")}`}
                      className="font-semibold text-accent underline-offset-2 hover:underline"
                    >
                      {phoneKo(data.phone)}
                    </a>
                  ) : null
                }
              />
              <Row
                term="이메일"
                value={
                  data.email ? (
                    <a
                      href={`mailto:${data.email}`}
                      className="break-all text-accent underline-offset-2 hover:underline"
                    >
                      {data.email}
                    </a>
                  ) : null
                }
              />
              <Row term="회사" value={data.company} />
              <Row term="지역" value={data.region} />
            </dl>
          </Card>

          <Card title="문의 내용">
            <div className="flex flex-col gap-4 p-4">
              {data.spaceInfo && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-ink-3">공간 정보</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">
                    {data.spaceInfo}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-1 text-xs font-semibold text-ink-3">남긴 말</p>
                {data.message ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">
                    {data.message}
                  </p>
                ) : (
                  <p className="text-sm text-ink-3">따로 적은 내용이 없습니다.</p>
                )}
              </div>

              {productNames.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-ink-3">관심 제품</p>
                  <div className="flex flex-wrap gap-1.5">
                    {productNames.map((name) => (
                      <Pill key={name}>{name}</Pill>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Memo id={data.id} initial={data.memo} />
        </div>

        <div className="flex flex-col gap-4">
          <StatusCard
            id={data.id}
            status={data.status}
            onChanged={(next) => setData({ ...data, status: next })}
            toast={toast}
          />

          <Card title="동의와 보관">
            <dl className="grid gap-3.5 p-4">
              <Row term="개인정보 수집 동의" value={whenKo(data.consentAt)} />
              <Row
                term="마케팅 수신 동의"
                value={
                  data.marketingConsentAt ? (
                    whenKo(data.marketingConsentAt)
                  ) : (
                    <span className="text-ink-3">받지 않음 — 광고성 연락 금지</span>
                  )
                }
              />
              <Row
                term="자동 파기"
                value={
                  purgeIn === null ? null : purgeIn <= 0 ? (
                    <span className="font-semibold text-risk">
                      기한이 지났습니다 — 곧 지워집니다
                    </span>
                  ) : (
                    <span className={purgeIn <= 14 ? "font-semibold text-warn" : undefined}>
                      {whenKo(data.purgeAt)} ({purgeIn}일 남음)
                    </span>
                  )
                }
              />
            </dl>
            <p className="border-t border-line-soft px-4 py-2.5 text-xs leading-relaxed text-ink-3">
              보관 기한이 지나면 서버가 스스로 지웁니다. 남겨 둬야 하는 내용은
              그 전에 다른 곳에 옮겨 두세요.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ term, value }: { term: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-ink-3">{term}</dt>
      <dd className="mt-0.5 text-sm break-words text-ink">
        {value === null || value === undefined || value === "" ? (
          <span className="text-ink-3">—</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function StatusCard({
  id,
  status,
  onChanged,
  toast,
}: {
  id: number;
  status: string;
  onChanged: (next: string) => void;
  toast: (text: string, tone?: "ok" | "risk") => void;
}) {
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    if (next === status) return;
    setBusy(true);
    try {
      await api.patch(`/admin/inquiries/${id}/status`, { status: next });
      onChanged(next);
      toast(`${label(INQUIRY_STATUS, next)} 으로 옮겼습니다.`);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "바꾸지 못했습니다.", "risk");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="처리 상태" action={<Pill tone={statusTone(status)}>{label(INQUIRY_STATUS, status)}</Pill>}>
      <div className="flex flex-col gap-2 p-4">
        {Object.entries(INQUIRY_STATUS).map(([value, text]) => (
          <button
            key={value}
            type="button"
            disabled={busy}
            onClick={() => void change(value)}
            aria-pressed={value === status}
            className={`rounded-xs border px-3.5 py-2 text-left text-sm font-semibold transition-colors disabled:opacity-45 ${
              value === status
                ? "border-ink bg-ink text-white"
                : "border-line bg-surface text-ink-2 hover:bg-surface-2"
            }`}
          >
            {text}
            {value === "SPAM" && (
              <span className="ml-1.5 text-xs font-normal opacity-70">
                — 목록에서 걸러집니다
              </span>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}

/**
 * 통화 메모.
 *
 * 전화를 끊고 나서 적는 자리다. 저장 버튼이 눌린 적 있는지 화면이
 * 말해 주지 않으면 «적었는데 사라졌나» 싶어 같은 말을 두 번 쓰게 된다.
 */
function Memo({ id, initial }: { id: number; initial: string }) {
  const toast = useToast();
  const [value, setValue] = useState(initial ?? "");
  const [saved, setSaved] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = value !== saved;
  const tooLong = value.length > 2000;

  async function save() {
    if (!changed || tooLong) return;
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/inquiries/${id}/memo`, { memo: value });
      setSaved(value);
      toast("메모를 저장했습니다.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title="메모"
      action={
        changed ? <Pill tone="warn">저장 안 됨</Pill> : saved ? <Pill tone="ok">저장됨</Pill> : null
      }
    >
      <div className="flex flex-col gap-3 p-4">
        <Field
          label="통화·처리 내용"
          showOptional={false}
          help="사이트에는 나오지 않습니다. 언제 무슨 얘기를 했는지 남겨 두면 다음 통화가 빨라집니다."
          error={
            tooLong
              ? `2000자까지 넣을 수 있습니다. (지금 ${value.length}자)`
              : (error ?? undefined)
          }
        >
          {({ id: fieldId, describedBy, invalid }) => (
            <textarea
              id={fieldId}
              rows={5}
              value={value}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              onChange={(e) => setValue(e.target.value)}
              className={inputClass(invalid, "resize-y leading-relaxed")}
            />
          )}
        </Field>

        <div className="flex justify-end gap-2">
          <Button disabled={!changed || busy} onClick={() => setValue(saved)}>
            되돌리기
          </Button>
          <Button
            tone="primary"
            busy={busy}
            disabled={!changed || tooLong}
            onClick={() => void save()}
          >
            메모 저장
          </Button>
        </div>
      </div>
    </Card>
  );
}
