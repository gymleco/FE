import { useState } from "react";
import { Link } from "react-router";

import { ApiError, api, download, type InquiryListItem, type Paged } from "@/lib/api";
import { useLoad } from "@/lib/use-load";
import { INQUIRY_STATUS, dateInputDaysAgo, label, whenKo } from "@/lib/labels";
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
 * 문의 접수함.
 *
 * 이 사이트가 존재하는 이유가 여기 쌓인다. 제품 목록이 아무리 예뻐도
 * 들어온 문의를 못 보면 사이트는 아무 일도 하지 않은 것이다.
 *
 * ★ 목록에는 이름이 가려진 채로 온다 (서버가 maskedName 으로 준다).
 *   전화번호는 아예 오지 않는다. 목록을 열어 두고 자리를 비우는 일이
 *   가장 흔한 유출 경로라, 훑어보는 화면에는 개인정보를 두지 않는다.
 *   전체를 보려면 상세를 열어야 하고, 그 열람은 서버에 기록으로 남는다.
 *
 * ★ 상태는 목록에서 바로 바꾼다.
 *   «신규 → 연락중» 은 전화를 걸면서 누르는 동작이다. 상세로 들어갔다
 *   나오게 만들면 결국 아무도 안 바꾸고, 그러면 어디까지 연락했는지
 *   목록이 말해 주지 못한다.
 */

const TABS = [
  { value: "", text: "전체" },
  { value: "NEW", text: "신규" },
  { value: "CONTACTING", text: "연락중" },
  { value: "DONE", text: "완료" },
  { value: "SPAM", text: "스팸" },
] as const;

const PAGE_SIZE = 20;

/** 신규가 눈에 띄어야 한다 — 이 화면에서 «행동이 필요한 것» 은 그것뿐이다 */
function statusTone(s: string) {
  if (s === "NEW") return "warn" as const;
  if (s === "CONTACTING") return "ok" as const;
  if (s === "SPAM") return "risk" as const;
  return "mute" as const;
}

export function InquiryList() {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);

  const { data, error, loading, reload } = useLoad<Paged<InquiryListItem>>(
    () =>
      api.get<Paged<InquiryListItem>>(
        `/admin/inquiries?page=${page}&size=${PAGE_SIZE}${status ? `&status=${status}` : ""}`,
      ),
    [status, page],
  );

  async function changeStatus(row: InquiryListItem, next: string) {
    setBusy(true);
    try {
      await api.patch(`/admin/inquiries/${row.id}/status`, { status: next });
      toast(`${row.maskedName} 님 문의를 ${label(INQUIRY_STATUS, next)} 으로 옮겼습니다.`);
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "바꾸지 못했습니다.", "risk");
    } finally {
      setBusy(false);
    }
  }

  const rows = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <>
      <PageHead
        title="문의"
        desc="접수된 문의입니다. 목록에는 이름이 가려져 있고, 자세히 보기를 눌러야 연락처가 나옵니다."
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setStatus(t.value);
              setPage(0); // 탭을 바꿨는데 3쪽에 머물러 있으면 «비었네» 로 보인다
            }}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              status === t.value
                ? "border-ink bg-ink text-white"
                : "border-line bg-surface text-ink-2 hover:bg-surface-2"
            }`}
          >
            {t.text}
          </button>
        ))}
        {!loading && !error && (
          <span className="ml-1 text-sm text-ink-3">{total}건</span>
        )}
      </div>

      <Card>
        {loading && (
          <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-ink-3">
            <Spinner /> 불러오는 중
          </div>
        )}

        {!loading && error && (
          <Empty action={<Button onClick={reload}>다시 시도</Button>}>{error}</Empty>
        )}

        {!loading && !error && rows.length === 0 && (
          <Empty>
            {status
              ? `${label(INQUIRY_STATUS, status)} 상태인 문의가 없습니다.`
              : "아직 들어온 문의가 없습니다."}
          </Empty>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-3">
                  <th className="px-4 py-2.5 font-semibold">접수</th>
                  <th className="px-4 py-2.5 font-semibold">유형</th>
                  <th className="px-4 py-2.5 font-semibold">이름</th>
                  <th className="px-4 py-2.5 font-semibold">회사</th>
                  <th className="px-4 py-2.5 font-semibold">지역</th>
                  <th className="px-4 py-2.5 font-semibold">상태</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-line-soft last:border-0">
                    <td className="tabular px-4 py-2.5 whitespace-nowrap text-ink-2">
                      {whenKo(row.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      {/* 유형은 서버가 이미 한국어로 준다 */}
                      <Pill>{row.type}</Pill>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        to={`/inquiries/${row.id}`}
                        className="font-semibold text-ink hover:text-accent"
                      >
                        {row.maskedName}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-ink-2">{row.company || "—"}</td>
                    <td className="px-4 py-2.5 text-ink-2">{row.region || "—"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Pill tone={statusTone(row.status)}>
                          {label(INQUIRY_STATUS, row.status)}
                        </Pill>
                        <select
                          aria-label={`${row.maskedName} 님 문의 상태`}
                          value={row.status}
                          disabled={busy}
                          onChange={(e) => void changeStatus(row, e.target.value)}
                          className="rounded-xs border border-line bg-surface px-2 py-1 text-xs font-semibold"
                        >
                          {Object.entries(INQUIRY_STATUS).map(([v, t]) => (
                            <option key={v} value={v}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <Link
                        to={`/inquiries/${row.id}`}
                        className="inline-flex items-center rounded-xs border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:bg-surface-2"
                      >
                        자세히
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-line-soft px-4 py-3">
            <Button disabled={data?.first !== false} onClick={() => setPage((p) => p - 1)}>
              이전
            </Button>
            <span className="tabular text-sm text-ink-3">
              {page + 1} / {totalPages}
            </span>
            <Button disabled={data?.last !== false} onClick={() => setPage((p) => p + 1)}>
              다음
            </Button>
          </div>
        )}
      </Card>

      <ExportPanel />
    </>
  );
}

/**
 * CSV 내보내기.
 *
 * ★ 이 버튼이 컬럼 암호화를 무력화하는 유일한 통로다 (서버 주석 그대로).
 *   DB 안의 전화번호는 암호화돼 있지만, 여기서 나가는 파일은 평문이다.
 *   그래서 서버가 «기간»을 필수로 받고 5000건에서 자른다.
 *   화면도 같은 태도를 지킨다 — 기본값을 «전체»로 두지 않고, 무엇이
 *   파일에 담기는지 누르기 전에 적어 둔다.
 *
 * ★ 몇 건이 담겼는지 반드시 말한다.
 *   조건을 잘못 잡으면 0건짜리 파일이 조용히 내려온다. 그 파일을 열어
 *   보기 전까지는 «문의가 없었구나» 로 오해한다.
 */
function ExportPanel() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(() => dateInputDaysAgo(30));
  const [to, setTo] = useState(() => dateInputDaysAgo(0));
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const rangeError =
    from && to && from > to ? "시작일이 종료일보다 뒤입니다." : undefined;
  const blocked = !from || !to || Boolean(rangeError);

  async function run() {
    if (blocked) return;
    setBusy(true);
    setNotice(null);
    try {
      const query = new URLSearchParams({ from, to });
      if (status) query.set("status", status);
      const result = await download(`/admin/inquiries/export?${query}`);

      if (result.count === 0) {
        setNotice(
          "조건에 맞는 문의가 없어 빈 파일이 내려왔습니다. 기간을 다시 확인해 주세요.",
        );
        toast("0건입니다. 파일이 비어 있습니다.", "risk");
      } else {
        toast(
          `${result.count ?? "?"}건을 ${result.filename} 로 내려받았습니다.` +
            (result.truncated ? " 상한 5000건을 넘어 뒤쪽이 잘렸습니다." : ""),
        );
        if (result.truncated) {
          setNotice(
            "5000건 상한에 걸려 뒤쪽이 잘렸습니다. 기간을 나눠서 다시 받아 주세요.",
          );
        }
      }
    } catch (e) {
      setNotice(
        e instanceof ApiError ? e.message : "내려받지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      className="mt-4"
      title="엑셀로 내려받기"
      action={
        <Button onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? "접기" : "열기"}
        </Button>
      }
    >
      {!open ? (
        <p className="px-4 py-3 text-xs text-ink-3">
          기간을 정해 CSV 파일로 받습니다. 파일에는 전화번호가 <b>가려지지 않은 채</b>{" "}
          들어갑니다.
        </p>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          <p className="rounded-xs border border-warn/30 bg-warn-bg px-3.5 py-2.5 text-xs leading-relaxed font-semibold text-warn">
            내려받은 파일에는 이름 · 전화번호 · 이메일이 그대로 들어 있습니다.
            메신저로 주고받거나 공용 PC 에 두지 마시고, 쓰고 나면 지워 주세요.
            누가 언제 몇 건을 받았는지는 기록으로 남습니다.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="시작일" required error={rangeError}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  type="date"
                  value={from}
                  max={to || undefined}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => setFrom(e.target.value)}
                  className={inputClass(invalid, "tabular")}
                />
              )}
            </Field>

            <Field label="종료일" required help="이 날 접수분까지 포함합니다.">
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  type="date"
                  value={to}
                  min={from || undefined}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  onChange={(e) => setTo(e.target.value)}
                  className={inputClass(invalid, "tabular")}
                />
              )}
            </Field>

            <Field label="상태" showOptional={false} help="비우면 모든 상태를 담습니다.">
              {({ id, describedBy }) => (
                <select
                  id={id}
                  value={status}
                  aria-describedby={describedBy}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClass(false)}
                >
                  <option value="">전체</option>
                  {Object.entries(INQUIRY_STATUS).map(([v, t]) => (
                    <option key={v} value={v}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          {notice && (
            <p
              role="alert"
              className="rounded-xs border border-risk/30 bg-risk-bg px-3.5 py-2.5 text-sm font-semibold text-risk"
            >
              {notice}
            </p>
          )}

          <div className="flex justify-end">
            <Button tone="primary" busy={busy} disabled={blocked} onClick={() => void run()}>
              내려받기
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
