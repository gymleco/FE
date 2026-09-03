import "server-only";

import { fetchSettings } from "@/lib/api";

/**
 * 사이트 설정 — 대표님이 관리 화면에서 고치는 값.
 *
 * ── 환경변수를 폴백으로 남겨 두는 이유 ──
 *
 * API 가 잠깐 죽어 있거나, API 없이 프론트만 띄워 볼 때가 있다. 그때 푸터가
 * 통째로 비면 "만들다 만 화면" 으로 보인다. 관리 화면 값이 있으면 그것을
 * 쓰고, 없을 때만 환경변수로 물러선다.
 *
 * ── 빈 값을 «——» 로 찍지 않는다 ──
 *
 * 대표님께 아직 못 받은 항목이 많다. 대시가 늘어선 줄은 "아직 안 만든 화면"
 * 으로 읽히므로, 값이 없으면 그 항목을 아예 내보내지 않는다.
 */

export type SiteInfo = {
  companyName: string;
  ceo: string;
  registrationNo: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  instagram: string;
  youtube: string;
  blog: string;
  retentionNotice: string;
};

/** 앞뒤 공백만 있는 값은 없는 것으로 본다 */
function pick(
  values: Record<string, string> | null,
  key: string,
  fallback?: string,
): string {
  const fromApi = values?.[key]?.trim();
  if (fromApi) return fromApi;
  return fallback?.trim() ?? "";
}

export async function getSiteInfo(): Promise<SiteInfo> {
  const v = await fetchSettings();

  return {
    companyName: pick(v, "company.name", process.env.NEXT_PUBLIC_BIZ_NAME),
    ceo: pick(v, "company.ceo", process.env.NEXT_PUBLIC_BIZ_OWNER),
    registrationNo: pick(v, "company.registration_no", process.env.NEXT_PUBLIC_BIZ_NO),
    address: pick(v, "contact.address", process.env.NEXT_PUBLIC_BIZ_ADDRESS),
    phone: pick(v, "contact.phone", process.env.NEXT_PUBLIC_BIZ_TEL),
    email: pick(v, "contact.email", process.env.NEXT_PUBLIC_BIZ_EMAIL),
    businessHours: pick(v, "contact.business_hours"),
    instagram: pick(v, "sns.instagram"),
    youtube: pick(v, "sns.youtube"),
    blog: pick(v, "sns.blog"),
    retentionNotice: pick(v, "privacy.retention_notice"),
  };
}

/**
 * 주소가 http/https 인지 다시 본다.
 *
 * 서버가 저장 시점에 이미 막고 있지만, 예전에 들어간 값이나 폴백 경로로
 * 온 값이 있을 수 있다. `javascript:` 로 시작하는 주소를 href 에 그대로
 * 넣으면 클릭 한 번에 실행된다 — 방어선을 두 곳에 두는 것이 아니라,
 * **DOM 에 넣기 직전이 마지막 관문**이라서 여기서 한 번 더 본다.
 */
export function safeHref(url: string): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : null;
}
