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

/**
 * CSRF 토큰을 쿠키에서 꺼낸다.
 *
 * 서버는 `/api/admin/**` 에 CSRF 를 걸어 두고 토큰을 `XSRF-TOKEN` 쿠키로
 * 내려준다 (SecurityConfig, CookieCsrfTokenRepository.withHttpOnlyFalse).
 * 이 쿠키 하나만 HttpOnly 가 아니다 — 브라우저가 읽어 헤더로 되돌려
 * 보내는 것이 이 방식의 전부이기 때문이다.
 *
 * ★ 인증 토큰과 혼동하지 않는다.
 *   접근·갱신 토큰은 HttpOnly 라 여기서 읽을 수 없고, 읽을 필요도 없다.
 *   자바스크립트가 읽을 수 있는 것은 «위조 방지용 난수» 뿐이다.
 */
function readCsrfToken(): string | null {
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith("XSRF-TOKEN=")) {
      return decodeURIComponent(part.slice("XSRF-TOKEN=".length));
    }
  }
  return null;
}

type Options = {
  method?: string;
  body?: unknown;
  /** 파일 업로드처럼 FormData 를 그대로 보낼 때 */
  form?: FormData;
  /** 401 재시도 루프를 막기 위한 내부 표시 */
  retried?: boolean;
  /** CSRF 재시도를 한 번으로 묶기 위한 내부 표시 */
  csrfRetried?: boolean;
};

async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const method = opts.method ?? "GET";
  // 서버가 CSRF 를 요구하는 것과 같은 기준이다 (읽기는 제외)
  const mutating = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

  const init: RequestInit = { method, credentials: "same-origin" };
  const headers: Record<string, string> = {};

  if (opts.form) {
    // Content-Type 은 브라우저가 boundary 와 함께 붙인다 — 직접 넣지 않는다
    init.body = opts.form;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }

  const sentCsrf = mutating ? readCsrfToken() : null;
  if (sentCsrf) headers["X-XSRF-TOKEN"] = sentCsrf;
  if (Object.keys(headers).length > 0) init.headers = headers;

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

  /*
   * 첫 쓰기 요청이 403 으로 돌아올 수 있다.
   *
   * 서버는 CSRF 토큰을 «누가 실제로 꺼내 볼 때» 만 만들어 쿠키로 내려준다.
   * 읽기만 하다가 처음 저장을 누르면 아직 쿠키가 없어 한 번 거절당하는데,
   * 그 거절 응답에 쿠키가 실려 온다. 토큰이 새로 생겼을 때만 한 번 더 보낸다.
   *
   * ★ 조건 없이 재시도하지 않는다. 진짜 «권한 없음» 도 403 이라,
   *   무조건 다시 보내면 막혀 있다는 사실이 화면에 영영 안 나온다.
   */
  if (res.status === 403 && mutating && !opts.csrfRetried) {
    const fresh = readCsrfToken();
    if (fresh && fresh !== sentCsrf) {
      return request<T>(path, { ...opts, csrfRetried: true });
    }
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

/* ── 파일 내려받기 ───────────────────────────────────────── */

export type DownloadResult = {
  filename: string;
  /** 서버가 몇 줄을 담았는지. 헤더가 없으면 null */
  count: number | null;
  /** 상한(5000건)에 걸려 잘렸는가 */
  truncated: boolean;
};

/**
 * 내려받기는 request() 를 쓸 수 없다.
 * 저쪽은 응답을 텍스트로 읽어 JSON 으로 푸는데, 여기서 받는 것은 파일이다.
 *
 * ★ 몇 건이 담겼는지 반드시 돌려준다.
 *   0건짜리 빈 파일도 «내려받아졌다» 로 보인다. 조건을 잘못 잡아
 *   아무것도 안 들어간 파일을 받아 놓고 «문의가 없었구나» 라고
 *   오해하는 것이 이 화면에서 가장 흔한 실수다.
 */
export async function download(path: string, retried = false): Promise<DownloadResult> {
  const res = await fetch(BASE + path, { credentials: "same-origin" });

  if (res.status === 401 && !retried) {
    if (await refreshOnce()) return download(path, true);
    onSessionLost?.();
    throw new ApiError(401, "SESSION_EXPIRED", "로그인이 필요합니다.");
  }

  if (!res.ok) {
    const text = await res.text();
    const body = text ? safeJson(text) : null;
    throw new ApiError(
      res.status,
      (body?.code as string) ?? "UNKNOWN",
      (body?.message as string) ?? fallbackMessage(res.status),
      (body?.fields as Record<string, string>) ?? {},
    );
  }

  const filename = filenameFrom(res.headers.get("Content-Disposition")) ?? "download.csv";
  const url = URL.createObjectURL(await res.blob());
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // 곧바로 지우면 브라우저가 아직 읽는 중일 수 있다
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  const count = Number(res.headers.get("X-Export-Count"));
  return {
    filename,
    count: Number.isFinite(count) ? count : null,
    truncated: res.headers.get("X-Export-Truncated") === "true",
  };
}

/** Content-Disposition 에서 파일 이름을 꺼낸다. 한글 이름은 filename* 쪽에 있다. */
function filenameFrom(header: string | null): string | null {
  if (!header) return null;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      // 잘못 인코딩된 값이면 아래의 평범한 filename 으로 물러선다
    }
  }
  return /filename="?([^";]+)"?/i.exec(header)?.[1] ?? null;
}

/* ── 서버 응답 모양 ──────────────────────────────────────── */

/** Spring 의 Page 응답. 화면이 쓰는 것만 적는다. */
export type Paged<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  /** 0부터 센다 */
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

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

/* ── 문의 ────────────────────────────────────────────────
   목록에는 이름이 가려진 채로 온다. 상세를 열어야 전체가 보이고,
   그 열람은 서버에 기록으로 남는다.
   ──────────────────────────────────────────────────────── */

export type InquiryListItem = {
  id: number;
  /** 서버가 이미 한국어로 준다 ("견적" · "무료 시연" …) */
  type: string;
  maskedName: string;
  company: string | null;
  region: string | null;
  /** NEW · CONTACTING · DONE · SPAM */
  status: string;
  createdAt: string;
};

export type InquiryDetail = {
  id: number;
  type: string;
  name: string;
  /** 복호화된 전화번호. 화면 밖으로 내보내지 않는다 */
  phone: string | null;
  email: string | null;
  company: string | null;
  region: string | null;
  spaceInfo: string | null;
  message: string;
  productIds: number[];
  status: string;
  memo: string;
  consentAt: string;
  marketingConsentAt: string | null;
  purgeAt: string | null;
  createdAt: string;
};

/* ── 배너 · 섹션 이미지 ──────────────────────────────────── */

export type Banner = {
  id: number;
  /** MAIN · PRODUCT · USED · PART · ACCESSORY · CENTER */
  position: string;
  positionLabel: string;
  imagePcKey: string;
  imageMobileKey: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  visible: boolean;
  updatedAt: string;
};

/** 드롭다운 값은 서버가 준다 — 화면에 적어 두면 값이 어긋나도 알 수 없다 */
export type BannerPositionOption = { value: string; label: string };

export type SectionMedia = {
  sectionKey: string;
  imagePcKey: string;
  imageMobileKey: string;
  altText: string;
  updatedAt: string;
};

/* ── 고객센터 ────────────────────────────────────────────── */

export type Faq = {
  id: number;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  visible: boolean;
  updatedAt: string;
};

export type Notice = {
  id: number;
  title: string;
  /** 목록에서는 오지 않는다 — 상세를 불러야 채워진다 */
  body: string | null;
  pinned: boolean;
  publishedAt: string | null;
  visible: boolean;
  updatedAt: string;
};
