# CLAUDE.md — gymleco FE

공개 사이트(`web/`)와 관리자 CMS(`admin/`)를 담는 저장소.
백엔드는 별도 저장소(`gymleco-be`)에 있다.

---

## 이 저장소의 두 앱

| | `web/` | `admin/` |
|---|---|---|
| 스택 | Next.js 16 (App Router) + Tailwind v4 | Vite + React |
| 렌더링 | SSG / ISR | SPA |
| 배포 | `www.gymleco.co.kr` | `admin.gymleco.co.kr` |
| API 호출 | 서버에서만 (Route Handler 경유) | 상대 경로 `/api/*` (동일 오리진) |

**둘을 한 앱으로 합치지 않는다.** 오리진이 분리돼 있어야 CSP 를 따로 걸 수 있고,
관리자 번들이 공개 사이트에 실리지 않는다.

---

## 스택 주의

설치된 Next.js 는 **16.3.0** 이며 기획서(15 기준)와 규약이 다르다.
`middleware.ts` → **`proxy.ts`** 로 이름이 바뀌었다.
**코드를 쓰기 전에 `web/node_modules/next/dist/docs/` 의 해당 문서를 읽는다.**
기억에 의존해 15 문법으로 쓰지 않는다.

---

## 보안 규칙 (예외 없음)

1. **시크릿을 커밋하지 않는다.** `.env` 계열은 gitignore 에 있다.
   실수로 올라간 키는 삭제로 끝나지 않는다 — 반드시 재발급한다.
2. **`--no-verify` 로 pre-commit 훅을 우회하지 않는다.**
   오탐이면 `.gitleaks.toml` 의 allowlist 를 좁게 수정한다.
3. **보안 헤더는 `web/next.config.ts` 에 설정한다.**
   nginx 헤더는 API 응답에만 걸린다.
4. **공개 사이트에 nonce 기반 CSP 를 쓰지 않는다.** Next.js 가 모든 페이지를
   동적 렌더링으로 강제해 SSG/ISR 이 꺼진다. 관리자 앱에서만 nonce 를 쓴다.
5. **`admin/` 은 API 를 상대 경로로 호출한다.** 절대 URL 을 쓰면
   동일 오리진 구성이 깨지고 CORS·쿠키 문제가 되살아난다.
6. **토큰을 `localStorage` 에 두지 않는다.** 인증은 HttpOnly 쿠키로만.
7. **서버가 살균한 HTML 만 `dangerouslySetInnerHTML` 에 넣는다.**

---

## 연출 제약 (기획서 §3.4)

메인의 스크롤 드리븐 쇼케이스가 핵심 경험이지만, 다음을 어기면 실패다.

- 모바일은 가벼운 대체 연출로 분기 (인스타 유입 → 모바일이 주 트래픽)
- `prefers-reduced-motion` 존중
- 첫 화면 2.5초 이내
- 연출 중에도 문의 진입로 상시 노출
- **JS 없이도 텍스트가 DOM 에 존재해야 한다** (SEO·접근성)

**애니메이션은 이미 있는 것을 드러내는 방식이지, 없던 것을 만들어내는 방식이 아니다.**
`gsap.from` 처럼 "먼저 숨기고 트리거가 살려주기를 기다리는" 패턴을 쓰지 않는다 —
트리거가 발화하지 않으면 콘텐츠가 영영 보이지 않는다.
어디서 실패하든 최악의 결과가 **"애니메이션 없는 목록"이지 "빈 화면"이 아니어야** 한다.

---

## 문서

설계 문서는 org 의 [`.github`](https://github.com/GYMLECO-KOREA/.github) 저장소에 있다.

| 문서 | 언제 보는가 |
|---|---|
| `docs/OPEN-DECISIONS.md` | 구조를 정하기 전에 |
| `docs/SECURITY-CHECKLIST.md` | 배포 전, 보안 관련 코드를 건드릴 때 |
| `docs/04-screens.md` | 화면을 만들기 전에 |
