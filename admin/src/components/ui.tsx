import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ══ 버튼 ═════════════════════════════════════════════════
   노랑(primary)은 화면당 한 자리만 쓴다. 전부 노랗게 하면
   어느 것이 지금 눌러야 할 버튼인지 알 수 없다.
   ════════════════════════════════════════════════════════ */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "plain" | "danger";
  busy?: boolean;
};

export function Button({
  tone = "plain",
  busy = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-xs px-3.5 py-2 " +
    "text-sm font-semibold transition-colors disabled:opacity-45 " +
    "disabled:cursor-not-allowed";
  const tones = {
    primary: "bg-signal text-signal-ink hover:bg-[#ffe14d]",
    plain: "border border-line bg-surface text-ink hover:bg-surface-2",
    danger: "border border-risk/40 bg-risk-bg text-risk hover:bg-risk/15",
  };
  return (
    <button
      type="button"
      disabled={disabled || busy}
      className={`${base} ${tones[tone]} ${className}`}
      {...rest}
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

/* ══ 상태 알약 ════════════════════════════════════════════ */

export function Pill({
  tone = "mute",
  children,
}: {
  tone?: "ok" | "warn" | "risk" | "mute";
  children: ReactNode;
}) {
  const tones = {
    ok: "bg-ok-bg text-ok",
    warn: "bg-warn-bg text-warn",
    risk: "bg-risk-bg text-risk",
    mute: "bg-mute-bg text-mute",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-xs px-1.5 py-0.5 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* ══ 폼 칸 ════════════════════════════════════════════════
   ★ 필수 · 선택을 눈으로 구분할 수 있어야 한다 (README).
     별표만 찍으면 못 알아채는 사람이 있어 «필수» 라고 적는다.
   ★ 오류는 칸 바로 아래에 붙인다. 위쪽 요약만 있으면 긴 폼에서
     어느 칸인지 찾으러 다녀야 한다.
   ════════════════════════════════════════════════════════ */

export function Field({
  label,
  required = false,
  help,
  error,
  /**
   * 필수 칸이 하나도 없는 화면에서는 «선택» 이 정보를 담지 않는다.
   * 열여덟 칸에 똑같은 꼬리표가 붙으면 읽는 눈만 늘어난다.
   */
  showOptional = true,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  showOptional?: boolean;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const errId = `${id}-err`;
  const describedBy =
    [error ? errId : null, help ? helpId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold">
        {label}
        {required ? (
          <span className="rounded-xs bg-accent/12 px-1 py-px text-[0.65rem] font-bold text-accent">
            필수
          </span>
        ) : showOptional ? (
          <span className="text-xs font-normal text-ink-3">선택</span>
        ) : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {/* 오류가 붙으면 도움말은 감춘다. 같은 말이 두 줄로 겹쳐 보이는 일이 잦다. */}
      {help && !error && (
        <p id={helpId} className="text-xs text-ink-3">
          {help}
        </p>
      )}
      {error && (
        <p id={errId} className="flex items-start gap-1 text-xs font-semibold text-risk">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  "w-full rounded-xs border bg-surface px-3 py-2 text-sm text-ink " +
  "placeholder:text-ink-3/70 disabled:bg-surface-2";

export function inputClass(invalid: boolean, extra = "") {
  return `${inputBase} ${invalid ? "border-risk" : "border-line"} ${extra}`;
}

/* ══ 토글 ═════════════════════════════════════════════════ */

export function Toggle({
  checked,
  onChange,
  onLabel,
  offLabel,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  onLabel: string;
  offLabel: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 disabled:opacity-45"
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-ok" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white transition-[left] ${
            checked ? "left-4.5" : "left-0.5"
          }`}
        />
      </span>
      <span className="text-sm font-semibold">{checked ? onLabel : offLabel}</span>
    </button>
  );
}

/* ══ 카드 · 빈 상태 ═══════════════════════════════════════ */

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  /* 문자열만 받다가 넓혔다 — 제목 옆에 상태 배지를 다는 화면이 생겼다 */
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xs border border-line bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-line-soft px-4 py-3">
          {title && <h2 className="text-sm font-bold">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <p className="text-sm text-ink-3">{children}</p>
      {action}
    </div>
  );
}

/* ══ 알림 ═════════════════════════════════════════════════
   저장·삭제가 끝났는지 화면 어딘가는 말해 줘야 한다.
   아무 변화가 없으면 사람은 버튼을 한 번 더 누른다.
   ════════════════════════════════════════════════════════ */

type Toast = { id: number; text: string; tone: "ok" | "risk" };
const ToastCtx = createContext<((text: string, tone?: "ok" | "risk") => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const seq = useRef(0);

  const push = useCallback((text: string, tone: "ok" | "risk" = "ok") => {
    const id = ++seq.current;
    setItems((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3600);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {/* 화면을 읽던 자리를 가리지 않도록 아래 오른쪽에 쌓는다 */}
      <div
        aria-live="polite"
        /* 폼 화면은 아래에 저장 줄이 붙어 있다. bottom-4 에 두면 알림이
           저장 버튼을 덮어 «저장했다» 고 말하면서 저장을 못 누르게 만든다. */
        className="pointer-events-none fixed right-4 bottom-[4.75rem] z-50 flex flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-xs border px-3.5 py-2.5 text-sm font-semibold shadow-lg ${
              t.tone === "ok"
                ? "border-ok/30 bg-ok-bg text-ok"
                : "border-risk/30 bg-risk-bg text-risk"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const v = useContext(ToastCtx);
  if (!v) throw new Error("ToastProvider 안에서만 쓸 수 있습니다.");
  return v;
}
