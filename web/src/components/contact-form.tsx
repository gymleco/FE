"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

import { equipment } from "@/lib/catalog";

const TYPES = [
  { value: "QUOTE", label: "견적 문의" },
  { value: "DEMO", label: "무료 시연" },
  { value: "OFFICIAL", label: "오피셜 센터" },
  { value: "USED", label: "중고" },
  { value: "PART", label: "부품" },
] as const;

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주",
  "대전", "울산", "강원", "충청", "전라", "경상", "제주",
] as const;

/** 대표 전화 — 대표님께 받아 교체한다. 전송 실패 시 대체 경로로 노출된다. */
const FALLBACK_PHONE = "02-0000-0000";

type Status = "idle" | "sending" | "error" | "rateLimited";

/**
 * 문의 폼.
 *
 * 이 사이트의 모든 화면이 향하는 종착지다. 여기서 이탈하면
 * 앞의 모든 연출이 의미를 잃는다.
 *
 * 설계 규칙
 *  - 필수는 이름·연락처·동의 셋뿐. 필수가 늘수록 문의가 줄고,
 *    법적으로도 최소 수집이 원칙이다.
 *  - 동의 체크박스는 기본 해제. 미리 체크해 두면 동의로 인정되지 않는다.
 *  - 마케팅 동의는 반드시 별도 항목. 필수 동의에 묶으면 위법이다.
 *  - 전송 실패 시 전화번호를 함께 안내한다. 폼이 죽었다고 문의를
 *    놓칠 수는 없다.
 */
export function ContactForm() {
  const router = useRouter();

  /*
   * ── useSearchParams 를 쓰지 않는 이유 ──
   *
   * useSearchParams() 를 호출하면 Next.js 가 이 폼 전체를 클라이언트
   * 전용으로 돌린다. 정적 HTML 에는 스켈레톤만 남고 폼도, 동의 문구도
   * 들어가지 않는다. 실제로 그렇게 만들었다가 /contact 의 본문에
   * "개인정보 수집" 문구조차 없는 것을 확인했다.
   *
   * 동의 고지는 법적 의미가 있는 문구다. JS 가 늦거나 실패해도
   * 화면에 남아 있어야 한다.
   *
   * 그래서 폼은 기본값으로 즉시 렌더하고, URL 프리필은 마운트 후에 얹는다.
   */
  const [type, setType] = useState<string>("QUOTE");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presetType = params.get("type");
    if (presetType && TYPES.some((t) => t.value === presetType)) {
      setType(presetType);
    }
    const presetProduct = params.get("product");
    if (presetProduct) {
      setSelected([presetProduct]);
    }
  }, []);

  function toggleProduct(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const nextErrors: Record<string, string> = {};
    if (!String(data.get("name") ?? "").trim()) {
      nextErrors.name = "이름을 입력해 주세요.";
    }
    const phone = String(data.get("phone") ?? "").replace(/\D/g, "");
    if (phone.length < 9) {
      nextErrors.phone = "연락처를 정확히 입력해 주세요.";
    }
    if (!data.get("privacyConsent")) {
      nextErrors.privacyConsent = "개인정보 수집·이용에 동의해 주세요.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // 첫 오류 필드로 포커스를 옮긴다. 긴 폼에서 어디가 틀렸는지
      // 찾아 헤매게 두지 않는다.
      const first = Object.keys(nextErrors)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.get("type"),
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email") || null,
          company: data.get("company") || null,
          region: data.get("region") || null,
          spaceInfo: data.get("spaceInfo") || null,
          productSlugs: data.getAll("productSlugs"),
          message: data.get("message") || "",
          privacyConsent: true,
          marketingConsent: Boolean(data.get("marketingConsent")),
          // honeypot — 사람은 보지 못하는 칸이다
          website: data.get("website") || "",
        }),
      });

      if (response.status === 429) {
        setStatus("rateLimited");
        return;
      }
      if (!response.ok) {
        setStatus("error");
        return;
      }

      router.push("/contact/done");
    } catch {
      setStatus("error");
    }
  }

  const sending = status === "sending";

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      {/* ── 문의 유형 ── */}
      <fieldset className="border-none p-0">
        <legend className="text-sm text-ink-400">문의 유형</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPES.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={type === option.value}
                onChange={() => setType(option.value)}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-ink-700 px-4 py-1.5 text-sm text-ink-300 transition-colors peer-checked:border-signal peer-checked:bg-signal peer-checked:font-semibold peer-checked:text-signal-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── 연락처 ── */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Field
          name="name"
          label="이름"
          required
          error={errors.name}
          autoComplete="name"
        />
        <Field
          name="phone"
          label="연락처"
          required
          error={errors.phone}
          type="tel"
          inputMode="tel"
          placeholder="010-0000-0000"
          autoComplete="tel"
        />
        <Field name="email" label="이메일" type="email" autoComplete="email" />
        <Field name="company" label="업체명" autoComplete="organization" />

        <div className="flex flex-col gap-2">
          <label htmlFor="region" className="text-sm text-ink-400">
            지역
          </label>
          <select
            id="region"
            name="region"
            defaultValue=""
            className="border border-ink-700 bg-transparent px-3 py-2.5 text-ink-100 transition-colors focus:border-signal"
          >
            <option value="">선택</option>
            {REGIONS.map((region) => (
              <option key={region} value={region} className="bg-ink-900">
                {region}
              </option>
            ))}
          </select>
        </div>

        <Field
          name="spaceInfo"
          label="평수 · 천장 높이"
          placeholder="예) 30평 / 2.6m"
        />
      </div>

      {/* ── 관심 제품 ── */}
      <fieldset className="mt-8 border-none p-0">
        <legend className="text-sm text-ink-400">관심 제품</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {equipment.map((product) => (
            <label key={product.slug} className="cursor-pointer">
              <input
                type="checkbox"
                name="productSlugs"
                value={product.slug}
                checked={selected.includes(product.slug)}
                onChange={() => toggleProduct(product.slug)}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-ink-700 px-3.5 py-1.5 text-sm text-ink-300 transition-colors peer-checked:border-ink-100 peer-checked:text-ink-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal">
                {product.nameKo}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── 내용 ── */}
      <div className="mt-8 flex flex-col gap-2">
        <label htmlFor="message" className="text-sm text-ink-400">
          문의 내용
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="border border-ink-700 bg-transparent px-3 py-2.5 text-ink-100 transition-colors focus:border-signal"
          placeholder="공간 상황이나 예산, 오픈 예정일 등을 적어주시면 더 정확히 안내드릴 수 있습니다."
        />
      </div>

      {/* ── honeypot — 사람에게는 보이지 않는다 ── */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="website">이 칸은 비워두세요</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* ── 동의 ── */}
      <fieldset className="mt-10 border border-hairline p-5">
        <legend className="px-2 text-sm font-semibold text-ink-100">
          개인정보 수집 · 이용 동의
        </legend>

        <label className="flex cursor-pointer gap-3">
          <input
            type="checkbox"
            name="privacyConsent"
            className="mt-1 size-4 shrink-0 accent-[var(--color-signal)]"
          />
          <span className="text-sm text-ink-300">
            <strong className="text-ink-100">(필수)</strong> 수집·이용에
            동의합니다.
            <span className="mt-2 block text-ink-400">
              항목: 이름, 연락처, 이메일, 업체명 · 목적: 문의 응대 및 견적
              안내 · 보유: 문의 처리 완료 후 1년
            </span>
          </span>
        </label>
        {errors.privacyConsent && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {errors.privacyConsent}
          </p>
        )}

        <label className="mt-5 flex cursor-pointer gap-3">
          <input
            type="checkbox"
            name="marketingConsent"
            className="mt-1 size-4 shrink-0 accent-[var(--color-signal)]"
          />
          <span className="text-sm text-ink-300">
            (선택) 신제품·행사 정보 수신에 동의합니다.
          </span>
        </label>

        <p className="mt-5 text-xs text-ink-400">
          동의를 거부하실 수 있으나, 필수 항목에 동의하지 않으시면 문의
          응대가 어렵습니다. 자세한 내용은{" "}
          <Link href="/privacy" className="underline hover:text-ink-100">
            개인정보처리방침
          </Link>
          을 확인해 주세요.
        </p>
      </fieldset>

      {/* ── 전송 ── */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-signal px-8 py-3.5 font-bold text-signal-ink transition-colors hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "보내는 중…" : "문의 보내기"}
        </button>

        {status === "error" && (
          <p role="alert" className="mt-5 border border-danger p-4 text-sm text-ink-100">
            전송에 실패했습니다. 잠시 후 다시 시도해 주시거나, 급하시면
            전화로 문의해 주세요 —{" "}
            <a href={`tel:${FALLBACK_PHONE}`} className="font-semibold underline">
              {FALLBACK_PHONE}
            </a>
          </p>
        )}
        {status === "rateLimited" && (
          <p role="alert" className="mt-5 border border-hairline p-4 text-sm text-ink-300">
            잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  error,
  ...rest
}: {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-ink-400">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-signal">
            *
          </span>
        )}
        {required && <span className="sr-only">(필수)</span>}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={
          error
            ? "border border-danger bg-transparent px-3 py-2.5 text-ink-100"
            : "border border-ink-700 bg-transparent px-3 py-2.5 text-ink-100 transition-colors focus:border-signal"
        }
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
