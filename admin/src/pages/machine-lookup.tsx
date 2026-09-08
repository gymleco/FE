import { useState } from "react";

import { ApiError, api } from "@/lib/api";
import { whenKo } from "@/lib/labels";
import { PageHead } from "@/components/shell";
import { Button, Card, Empty, Pill, Spinner } from "@/components/ui";

/**
 * 일련번호로 기구 한 대 찾기.
 *
 * ── 이 화면이 답하는 질문 ──
 *
 * 「이 번호 뭐예요?」 하나다. 전화를 받으면서, 창고에서, 회수 현장에서
 * 번호를 읽어 넣고 곧바로 답이 나와야 한다. 그래서 목록·필터·페이지를
 * 두지 않았다 — 대장을 «훑는» 화면이 아니라 «찍어서 여는» 화면이다.
 *
 * ── 무엇을 보여 주는가 ──
 *
 * 공개 확인(/verify)과 달리 여기서는 판매처 · 보증 · 사후 관리 이력까지
 * 본다. 다만 연락처는 가려서 보여 준다 — 목록 한 번 열었다고 전화번호가
 * 화면에 뜨면 안 된다. 문의함과 같은 규칙이다.
 */

type ServiceLine = {
  id: number;
  kind: string;
  happenedOn: string;
  summary: string;
  costKrw: number | null;
};

type Detail = {
  id: number;
  serial: string;
  modelCode: string | null;
  productNameKo: string;
  madeYear: number | null;
  status: string;

  ownerId: number | null;
  ownerName: string | null;
  ownerRegion: string | null;
  phoneMasked: string | null;

  soldAt: string | null;
  installedAt: string | null;
  warrantyUntil: string | null;
  note: string;

  history: ServiceLine[];
  lookupCount: number;
};

/*
 * 서버가 주는 enum 을 사람 말로 옮긴다.
 *
 * ★ 화면에 영문 상수를 그대로 두지 않는다.
 *   이 화면을 쓰는 사람은 개발자가 아니다. REGISTERED 가 무슨 뜻인지
 *   묻게 만들면 그 자체가 결함이다.
 */
const STATUS: Record<string, { label: string; tone: "ok" | "warn" | "risk" | "mute" }> = {
  REGISTERED: { label: "입고 · 미판매", tone: "mute" },
  SOLD: { label: "판매됨", tone: "ok" },
  SHIPPED: { label: "출고", tone: "ok" },
  INSTALLED: { label: "설치 완료", tone: "ok" },
  RECOVERED: { label: "회수", tone: "warn" },
  SCRAPPED: { label: "폐기", tone: "mute" },
  FLAGGED: { label: "확인 필요", tone: "risk" },
};

const SERVICE_KIND: Record<string, string> = {
  INSPECTION: "정기 점검",
  REPAIR: "수리",
  PART: "부품 교체",
  MOVE: "이전 설치",
  CLAIM: "보증 청구",
};

export function MachineLookup() {
  const [serial, setSerial] = useState("");
  const [busy, setBusy] = useState(false);
  /** null = 아직 안 찾아봄, "none" = 찾았는데 없음 */
  const [found, setFound] = useState<Detail | "none" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!serial.trim()) return;
    setBusy(true);
    setError(null);
    setFound(null);
    try {
      const d = await api.get<Detail>(
        `/admin/machine-units/by-serial?serial=${encodeURIComponent(serial.trim())}`,
      );
      setFound(d);
    } catch (e) {
      /*
       * 404 는 오류가 아니다 — 「그런 번호는 없다」 는 답이다.
       * 빨간 오류 상자로 띄우면 시스템이 고장 난 것처럼 읽힌다.
       */
      if (e instanceof ApiError && e.status === 404) {
        setFound("none");
      } else {
        setError(e instanceof ApiError ? e.message : "찾지 못했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="일련번호 조회"
        desc="기구 명판의 일련번호를 넣으면 어느 제품인지, 어디에 팔렸는지, 그동안 무슨 일이 있었는지 봅니다."
      />

      <Card>
        <form onSubmit={search} className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="serial" className="text-sm font-semibold">
              일련번호
            </label>
            <input
              id="serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="017-2024-0117"
              /* 명판을 보고 옮겨 적는 값이다. 자동 수정이 글자를 바꾸면 안 된다 */
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              className="tabular w-full rounded-xs border border-line bg-surface px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <p className="text-xs text-ink-3">
              하이픈·공백·대소문자는 맞춰서 찾습니다.
            </p>
          </div>
          <Button tone="primary" busy={busy} type="submit">
            찾기
          </Button>
        </form>
      </Card>

      {error && (
        <Card className="mt-4">
          <p className="px-4 py-3 text-sm text-risk">{error}</p>
        </Card>
      )}

      {busy && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-3">
          <Spinner /> 찾는 중
        </div>
      )}

      {!busy && found === "none" && (
        <Card className="mt-4">
          <Empty>
            <b>{serial}</b> — 등록되지 않은 번호입니다. 명판을 다시 확인해 주세요.
          </Empty>
        </Card>
      )}

      {!busy && found && found !== "none" && <Result unit={found} />}
    </>
  );
}

function Result({ unit }: { unit: Detail }) {
  const status = STATUS[unit.status] ?? { label: unit.status, tone: "mute" as const };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <Card
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="tabular">{unit.serial}</span>
            <Pill tone={status.tone}>{status.label}</Pill>
          </span>
        }
      >
        <dl className="grid gap-x-6 gap-y-3 p-4 text-sm sm:grid-cols-[8rem_1fr]">
          <Row label="기구">
            {unit.productNameKo}
            {unit.modelCode && (
              <span className="tabular ml-2 text-ink-3">모델 {unit.modelCode}</span>
            )}
          </Row>
          {unit.madeYear && <Row label="제조">{unit.madeYear}년</Row>}

          <Row label="판매처">
            {unit.ownerName ? (
              <>
                {unit.ownerName}
                {unit.ownerRegion && (
                  <span className="ml-2 text-ink-3">{unit.ownerRegion}</span>
                )}
              </>
            ) : (
              <span className="text-ink-3">아직 없음 — 재고입니다</span>
            )}
          </Row>

          {unit.phoneMasked && (
            <Row label="연락처">
              <span className="tabular">{unit.phoneMasked}</span>
              {/*
                전체 번호를 여기서 바로 보여 주지 않는다.
                누르면 조회 이력이 남는 별도 요청으로 가져온다 — 아직 그
                버튼을 만들지 않았으므로 그 사실을 화면에 적어 둔다.
                「없는 기능처럼 보이는 빈자리」 보다 낫다.
              */}
              <span className="ml-2 text-xs text-ink-3">
                전체 번호는 열람 기록이 남습니다 (준비 중)
              </span>
            </Row>
          )}

          {unit.soldAt && <Row label="판매일">{unit.soldAt}</Row>}
          {unit.installedAt && <Row label="설치일">{unit.installedAt}</Row>}
          {unit.warrantyUntil && (
            <Row label="보증">
              <span className="tabular">{unit.warrantyUntil}</span>
              <Warranty until={unit.warrantyUntil} />
            </Row>
          )}
          {unit.note && <Row label="비고">{unit.note}</Row>}
        </dl>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="사후 관리 이력">
          {unit.history.length === 0 ? (
            <Empty>아직 기록이 없습니다.</Empty>
          ) : (
            <ul>
              {unit.history.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line-soft px-4 py-3 text-sm last:border-0"
                >
                  <span className="tabular w-24 shrink-0 text-xs text-ink-3">
                    {h.happenedOn}
                  </span>
                  <Pill>{SERVICE_KIND[h.kind] ?? h.kind}</Pill>
                  <span className="min-w-0 flex-1">{h.summary}</span>
                  {h.costKrw != null && (
                    <span className="tabular shrink-0 text-xs text-ink-2">
                      {h.costKrw.toLocaleString("ko-KR")}원
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="바깥에서 조회된 횟수">
          <div className="px-4 py-4">
            <p className="tabular text-3xl font-bold">{unit.lookupCount}</p>
            {/*
              ★ 이 숫자가 이 시스템의 도난·위조 신호다.
                같은 번호가 서로 다른 곳에서 반복 조회되면 복제이거나,
                기구가 시장에 나왔다는 뜻이다. 그래서 「조회 0회」 도
                정보다 — 아무도 이 기구를 의심한 적이 없다는 뜻이다.
            */}
            <p className="mt-2 text-xs text-ink-2">
              공개 정품 확인 화면에서 이 번호를 조회한 횟수입니다.
              {unit.lookupCount >= 5 && (
                <b className="text-warn"> 조회가 잦습니다 — 확인이 필요할 수 있습니다.</b>
              )}
            </p>
            <p className="mt-3 text-xs text-ink-3">
              관리자 조회는 세지 않습니다. 우리 조회가 섞이면 신호가 흐려집니다.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-ink-3">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </>
  );
}

/**
 * 보증이 살아 있는지 한눈에.
 *
 * 날짜만 적어 두면 오늘 날짜와 머릿속으로 빼야 한다. 전화를 받으면서
 * 할 일이 아니다.
 */
function Warranty({ until }: { until: string }) {
  const end = new Date(`${until}T00:00:00`);
  const days = Math.ceil((end.getTime() - Date.now()) / 86_400_000);

  if (days < 0) {
    return (
      <span className="ml-2">
        <Pill tone="mute">지남</Pill>
        <span className="ml-1.5 text-xs text-ink-3">{whenKo(end.toISOString())}</span>
      </span>
    );
  }
  return (
    <span className="ml-2">
      <Pill tone={days <= 60 ? "warn" : "ok"}>
        {days <= 60 ? `${days}일 남음` : "유효"}
      </Pill>
    </span>
  );
}
