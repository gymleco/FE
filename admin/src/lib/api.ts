/**
 * API 호출 한 곳.
 *
 * ── 왜 상대 경로만 쓰는가 ──
 *
 * 배포에서 관리자 앱과 API 는 같은 오리진(admin.gymleco.co.kr)에 있다.
 * 절대 URL 을 한 번이라도 쓰면 그 순간 교차 오리진이 되어 CORS 설정과
 * SameSite 쿠키 문제가 되살아난다. 로컬에서는 Vite dev server 가
 * nginx 역할을 대신한다(vite.config.ts).
 *
 * ── 토큰을 만지지 않는 이유 ──
 *
 * 인증은 HttpOnly 쿠키로만 이뤄진다. 자바스크립트가 토큰을 읽을 수 있으면
 * XSS 하나로 세션이 통째로 넘어간다. 그래서 여기에는 Authorization 헤더를
 * 붙이는 코드가 없고, 앞으로도 없어야 한다.
 */

const BASE = import.meta.env.VITE_API_BASE_PATH ?? "/api";

/** 서버가 내려준 검증 오류. 어느 칸이 틀렸는지까지 담고 있다. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** { "product.nameKo": "제품명을 입력해 주세요." } 형태 */
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** 세션이 끊겼을 때 앱이 로그인 화면으로 보내도록 걸어 두는 자리 */
let onSessionLost: (() => void) | null = null;
export function setSessionLostHandler(fn: (() => void) | null) {
  onSessionLost = fn;
}

/** 만료된 접근 토큰을 한 번만 조용히 갱신한다. 동시에 여러 요청이 401 을
 *  받아도 갱신은 한 번만 돌도록 진행 중인 약속을 공유한다. */
let refreshing: Promise<boolean> | null = null;

async function refreshOnce(): Promise<boolean> {
  refreshing ??= fetch(`${BASE}/admin/auth/refresh`, {
    method: "POST",
    credentials: "same-origin",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      // 다음 만료 때 다시 시도할 수 있도록 비운다
      setTimeout(() => (refreshing = null), 0);
    });
  return refreshing;
}

type Options = {
  method?: string;
  body?: unknown;
  /** 파일 업로드처럼 FormData 를 그대로 보낼 때 */
  form?: FormData;
  /** 401 재시도 루프를 막기 위한 내부 표시 */
  retried?: boolean;
};

async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const init: RequestInit = {
    method: opts.method ?? "GET",
    credentials: "same-origin",
  };

  if (opts.form) {
    init.body = opts.form; // Content-Type 은 브라우저가 boundary 와 함께 붙인다
  } else if (opts.body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(opts.body);
  }

  const res = await fetch(BASE + path, init);

  /*
   * 401 을 만나면 접근 토큰이 만료된 것으로 보고 한 번 갱신해 재시도한다.
   *
   * ★ 로그인 · 갱신 · 로그아웃 자체는 여기서 제외한다.
   *   비밀번호를 틀렸을 때도 401 이 오는데, 그것까지 갱신 대상으로 삼으면
   *   갱신이 실패하면서 서버가 준 "아이디 또는 비밀번호가 올바르지 않습니다"
   *   가 "로그인이 필요합니다" 로 덮여 버린다. 틀린 이유를 못 보게 된다.
   */
  const isAuthCall = path.startsWith("/admin/auth/");

  if (res.status === 401 && !opts.retried && !isAuthCall) {
    if (await refreshOnce()) {
      return request<T>(path, { ...opts, retried: true });
    }
    onSessionLost?.();
    throw new ApiError(401, "SESSION_EXPIRED", "로그인이 필요합니다.");
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (body?.code as string) ?? "UNKNOWN",
      (body?.message as string) ?? fallbackMessage(res.status),
      (body?.fields as Record<string, string>) ?? {},
    );
  }
  return body as T;
}

function safeJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** 서버가 본문 없이 실패했을 때라도 사람이 읽을 문장을 준다 */
function fallbackMessage(status: number): string {
  if (status === 403) return "권한이 없습니다.";
  if (status === 404) return "대상을 찾을 수 없습니다.";
  if (status === 409) return "이미 같은 값이 등록돼 있습니다.";
  if (status === 413) return "파일이 너무 큽니다.";
  if (status >= 500) return "서버에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
  return "요청을 처리하지 못했습니다.";
}

export const api = {
  get: <T,>(p: string) => request<T>(p),
  post: <T,>(p: string, body?: unknown) => request<T>(p, { method: "POST", body }),
  put: <T,>(p: string, body?: unknown) => request<T>(p, { method: "PUT", body }),
  patch: <T,>(p: string, body?: unknown) => request<T>(p, { method: "PATCH", body }),
  del: <T,>(p: string) => request<T>(p, { method: "DELETE" }),
  upload: <T,>(p: string, form: FormData) => request<T>(p, { method: "POST", form }),
};

/* ── 서버 응답 모양 ──────────────────────────────────────── */

export type Product = {
  id: number;
  slug: string;
  type: string;
  category: string;
  nameKo: string;
  nameEn: string;
  summary: string | null;
  description: string | null;
  footprintM2: string | number | null;
  widthMm: number | null;
  depthMm: number | null;
  heightMm: number | null;
  weightKg: string | number | null;
  thumbnailKey: string | null;
  cutoutKey: string | null;
  sortOrder: number;
  visible: boolean;
  imageKeys: string[];
  updatedAt: string;
};

export type UsedItem = {
  id: number;
  slug: string;
  nameKo: string;
  modelName: string | null;
  conditionGrade: string;
  yearMade: number | null;
  priceKrw: number | null;
  description: string | null;
  thumbnailKey: string | null;
  status: string;
  quantity: number;
  sortOrder: number;
  visible: boolean;
  productId: number | null;
  imageKeys: string[];
  updatedAt: string;
};

export type UploadResult = { key: string; urls: Record<string, string> };
export type Me = { username: string; role: string };
