"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * 정품 확인 창구.
 *
 * ── 무엇을 답하고, 무엇을 답하지 않는가 ──
 *
 * 「번호가 등록돼 있습니다」 로 끝내지 않는다. 위조범은 진짜 기구의 명판을
 * 찍어 같은 번호를 여러 대에 붙인다. 존재 여부만 답하면 우리가 가짜를
 * 인증해 주는 꼴이 된다.
 *
 * 그래서 «이 번호의 기구는 무엇인가» 를 돌려주고, 화면이 대놓고 시킨다 —
 * **눈앞의 기구와 같은지 대조하세요.** 레그 프레스에 로우 머신 번호가
 * 붙어 있으면 그 자리에서 걸린다.
 *
 * ── 판정을 여기서 하지 않는다 ──
 *
 * 이 파일에는 «맞다/틀리다» 를 정하는 코드가 없다. 서버가 준 outcome 을
 * 사람이 읽을 말로 옮기기만 한다. 판정이 두 곳에 있으면 반드시 갈라진다.
 */

type Outcome = "GENUINE" | "MODEL_MISMATCH" | "UNKNOWN" | "NEEDS_CHECK";

type Result =
  | {
      outcome: Outcome;
      serial: string | null;
      modelCode: string | null;
      productNameKo: string | null;
      madeYear: number | null;
    }
  | { error: string };

export function VerifyForm() {
  const [serial, setSerial] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial, modelCode }),
      });
      const data = await res.json();
      setResult(
        res.ok
          ? data
          : { error: data?.message ?? "확인하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      );
    } catch {
      setResult({ error: "확인하지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <Field
          id="serial"
          label="일련번호"
          hint="기구에 붙은 명판에서 읽어 주세요"
          value={serial}
          onChange={setSerial}
          placeholder="017-2024-0117"
          autoFocus
        />
        <Field
          id="modelCode"
          label="모델번호"
          hint="같은 명판에 함께 적혀 있습니다"
          value={modelCode}
          onChange={setModelCode}
          placeholder="017"
        />

        <button
          type="submit"
          disabled={sending || !serial.trim() || !modelCode.trim()}
          className="mt-1 rounded-full bg-signal px-8 py-3.5 font-bold text-signal-ink transition-colors hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "확인하는 중…" : "정품 확인"}
        </button>
      </form>

      {result && (
        <div aria-live="polite" className="mt-8">
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}

function Field({
  id, label, hint, value, onChange, placeholder, autoFocus,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-100">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        /*
         * 명판을 보고 옮겨 적는 값이다. 자동 대문자·자동 수정이 켜져 있으면
         * 폰에서 「Gi-020」 이 「GI-020」 이나 「기020」 이 된다.
         * 서버가 정규화하지만, 눈앞에서 글자가 바뀌면 사람이 먼저 당황한다.
         */
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        maxLength={60}
        className="tabular rounded-xs border border-hairline bg-ink-900 px-4 py-3.5 text-base text-ink-100 placeholder:text-ink-400 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      />
      <p className="text-xs text-ink-400">{hint}</p>
    </div>
  );
}

function ResultCard({ result }: { result: Result }) {
  if ("error" in result) {
    return (
      <Card tone="mute" title={result.error}>
        <Ask />
      </Card>
    );
  }

  if (result.outcome === "GENUINE") {
    return (
      <Card tone="ok" title="짐레코가 발급한 번호입니다">
        <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-hairline pt-4 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-ink-400">기구</dt>
          <dd className="font-semibold text-ink-100">
            {result.productNameKo}
            {result.modelCode ? (
              <span className="tabular ml-2 font-normal text-ink-300">
                모델 {result.modelCode}
              </span>
            ) : null}
          </dd>
          <dt className="text-ink-400">일련번호</dt>
          <dd className="tabular text-ink-100">{result.serial}</dd>
          {result.madeYear ? (
            <>
              <dt className="text-ink-400">제조</dt>
              <dd className="tabular text-ink-100">{result.madeYear}년</dd>
            </>
          ) : null}
        </dl>

        {/*
          ★ 이 문장이 이 화면의 핵심이다.
            번호가 맞다는 것만으로는 정품이 증명되지 않는다. 진짜 명판을
            베껴 붙인 가짜는 번호도 맞다. 눈앞의 기구와 대조하는 순간
            그 복제가 드러난다 — 그 일을 사람에게 시켜야 한다.
        */}
        <p className="mt-5 rounded-xs border-l-2 border-accent bg-ink-900 px-4 py-3 text-sm text-ink-100">
          <b className="font-semibold">위 기구가 눈앞의 기구와 같은지 확인해 주세요.</b>{" "}
          모델이 다르다면 번호만 옮겨 붙인 것일 수 있습니다.
        </p>
      </Card>
    );
  }

  if (result.outcome === "MODEL_MISMATCH") {
    return (
      <Card tone="risk" title="번호와 모델이 맞지 않습니다">
        <p className="text-sm text-ink-300">
          이 일련번호는 등록돼 있지만, 함께 입력하신 모델번호와 다른 기구의
          번호입니다. 명판을 다시 확인해 주시고, 그래도 같다면 알려 주세요.
        </p>
        <Ask emphasis />
      </Card>
    );
  }

  if (result.outcome === "NEEDS_CHECK") {
    /*
     * ★ 「도난품입니다」 라고 말하지 않는다.
     *   훔친 사람이 조회해 보고 처분 경로를 바꾼다. 연락을 유도하고,
     *   판단은 관리 화면에서 사람이 한다.
     */
    return (
      <Card tone="warn" title="확인이 필요한 기구입니다">
        <p className="text-sm text-ink-300">
          이 번호는 별도 확인이 필요합니다. 문의로 알려 주시면 담당자가
          바로 안내해 드립니다.
        </p>
        <Ask emphasis />
      </Card>
    );
  }

  return (
    <Card tone="mute" title="등록되지 않은 번호입니다">
      <p className="text-sm text-ink-300">
        번호를 다시 확인해 주세요. 명판의 숫자와 글자를 그대로 옮겨 적으시면
        됩니다 — 띄어쓰기나 하이픈은 달라도 괜찮습니다.
      </p>
      <p className="mt-2 text-sm text-ink-300">
        오래된 기구는 아직 등록 전일 수 있습니다. 문의로 알려 주시면
        확인해 드립니다.
      </p>
      <Ask />
    </Card>
  );
}

function Ask({ emphasis = false }: { emphasis?: boolean }) {
  return (
    <Link
      href="/contact"
      className={`mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
        emphasis
          ? "bg-signal text-signal-ink hover:bg-signal-hover"
          : "border border-hairline text-ink-100 hover:border-ink-300"
      }`}
    >
      문의하기
    </Link>
  );
}

function Card({
  tone, title, children,
}: {
  tone: "ok" | "risk" | "warn" | "mute";
  title: string;
  children?: React.ReactNode;
}) {
  /* 색만으로 결과를 전달하지 않는다 — 제목 문장이 결과를 그대로 말한다 */
  const edge = {
    ok: "border-accent",
    risk: "border-danger",
    warn: "border-steel",
    mute: "border-hairline",
  }[tone];

  return (
    <section className={`rounded-xs border-2 ${edge} bg-ink-900/60 p-5 sm:p-6`}>
      <h2 className="text-lg font-bold tracking-tight text-ink-100">{title}</h2>
      {children}
    </section>
  );
}
