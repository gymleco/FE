import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * 이미지 CDN 오리진 (예: https://cdn.gymleco.co.kr)
 * CSP 의 img-src 와 next/image 의 remotePatterns 양쪽에 쓰인다.
 */
const cdnOrigin = process.env.NEXT_PUBLIC_CDN_ORIGIN?.trim() || "";
const apiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";

function toUrl(value: string): URL | null {
  try {
    return value ? new URL(value) : null;
  } catch {
    return null;
  }
}

const cdnUrl = toUrl(cdnOrigin);

/**
 * ── CSP 방침 ────────────────────────────────────────────────
 *
 * 공개 페이지는 SSG/ISR 로 서빙된다. nonce 기반 CSP 를 쓰면
 * Next.js 가 모든 페이지를 동적 렌더링으로 강제하고 ISR·CDN 캐싱이
 * 꺼진다. SEO 가 핵심인 B2B 사이트에서는 받아들일 수 없는 대가다.
 *
 * 그래서 여기서는 script-src 에 'unsafe-inline' 을 허용한다
 * (App Router 는 하이드레이션 데이터를 인라인 스크립트로 넣는다).
 *
 * 이 타협이 받아들일 만한 이유:
 *   1. 관리자 화면은 이 앱에 없다. admin.gymleco.co.kr 로 분리돼 있고
 *      거기서 강한 CSP 를 따로 건다 (docs/OPEN-DECISIONS.md D-2).
 *      이 앱에 남은 민감한 입력은 문의 폼 하나뿐이다.
 *   2. 저장형 XSS 의 1차 방어선은 서버측 HTML 살균이다. CSP 가 아니다.
 *   3. object-src 'none', base-uri 'self', frame-ancestors 'none' 로
 *      인젝션의 파급 경로를 좁힌다.
 *
 * 검토 대기: experimental.sri (해시 기반) 를 쓰면 정적 생성을 유지한 채
 * 'unsafe-inline' 을 뺄 수 있다. 실험 기능이라 실측 후 판단한다.
 * → docs/OPEN-DECISIONS.md D-8
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src ${["'self'", "blob:", "data:", cdnUrl?.origin].filter(Boolean).join(" ")}`,
  // next/font 는 폰트를 빌드 시점에 셀프호스팅한다. 외부 폰트 도메인이 필요 없다.
  `font-src 'self'`,
  `connect-src ${["'self'", apiOrigin].filter(Boolean).join(" ")}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/**
 * CSP_ENFORCE=true 로 바꾸기 전에 Report-Only 로 충분히 관찰한다.
 * 위반 없이 사이트가 정상 동작하는 것을 확인한 뒤 강제한다.
 */
const cspHeaderName =
  process.env.CSP_ENFORCE === "true"
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";

const securityHeaders = [
  { key: cspHeaderName, value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HSTS 는 HTTPS 에서만 의미가 있다. 로컬 http 개발을 깨뜨리지 않도록 운영에서만 건다.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]),
];

const nextConfig: NextConfig = {
  // 서버 종류를 광고하지 않는다 (nginx 의 server_tokens off 와 같은 취지)
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    /*
     * ★ port 를 반드시 넣는다.
     *
     * 로컬 MinIO 는 127.0.0.1:19000 인데 port 를 비우면 Next 가
     * 기본 포트(80/443)만 허용해 이미지가 400 으로 막힌다.
     * URL 에서 그대로 뽑아 쓰면 운영(포트 없음)에서도 자동으로 맞는다.
     */
    remotePatterns: cdnUrl
      ? [
          {
            protocol: cdnUrl.protocol.replace(":", "") as "https" | "http",
            hostname: cdnUrl.hostname,
            port: cdnUrl.port,
            pathname: "/**",
          },
        ]
      : [],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
