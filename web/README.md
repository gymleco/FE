# web — 프론트엔드 (Next.js 15 / TypeScript)

Phase 1 에서 여기에 Next.js 앱을 스캐폴딩한다. 현재는 비어 있다.

## 담당 범위

| | |
|---|---|
| 공개 사이트 | `/`, `/about`, `/products`, `/products/[slug]`, `/contact`, `/news` |
| 렌더링 | SSG + ISR (on-demand revalidation) |
| 애니메이션 | GSAP ScrollTrigger + Lenis |
| 스타일 | Tailwind CSS |
| 배포 | Vercel |

## 설정 전에 알아둘 것

**보안 헤더는 여기서 설정한다.** 방문자가 보는 HTML 은 Vercel 이 서빙하므로
EC2 의 nginx 설정은 이 페이지들에 적용되지 않는다.
CSP·HSTS·X-Frame-Options 는 `next.config.ts` 의 `headers()` 또는
`middleware.ts` 에 둬야 한다.

**CSP 는 `script-src 'self'` 로 시작하면 앱이 뜨지 않는다.**
App Router 는 하이드레이션 데이터를 인라인 스크립트로 넣는다.
`middleware.ts` 에서 nonce 를 생성해 `'strict-dynamic'` 과 함께 쓰거나,
최소한 `Content-Security-Policy-Report-Only` 로 충분히 관찰한 뒤 적용한다.

**ISR 재검증 엔드포인트가 필요하다.**
`/api/revalidate` 를 만들어 `REVALIDATE_TOKEN` 을 검증하고
`revalidatePath()` 를 호출한다. 이게 없으면 CMS 에 제품을 등록해도
정적 페이지가 갱신되지 않는다.

## 시작

```bash
cp .env.example .env.local
```
