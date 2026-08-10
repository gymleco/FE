# FE

GYMLECO KOREA 프론트엔드. 공개 사이트와 관리자 CMS 두 앱이 들어 있습니다.

```
FE/
├─ web/     Next.js 16 — 공개 사이트 (www.gymleco.co.kr)
└─ admin/   Vite + React — 관리자 CMS (admin.gymleco.co.kr)   [Phase 2]
```

API 서버는 별도 저장소 **BE** 에 있습니다.

---

## 시작하기

### 1. git 훅 활성화 (필수 — 코드보다 먼저)

```bash
git config core.hooksPath .githooks
```

커밋마다 스테이징된 변경을 gitleaks 로 스캔합니다.
**gitleaks 가 없으면 커밋이 차단됩니다** — 의도된 동작입니다.
스캐너 없이 조용히 통과하는 훅은 없는 것보다 나쁩니다.

설치: <https://github.com/gitleaks/gitleaks/releases/latest> 에서 바이너리를 받아
PATH 에 넣거나, Docker 로 대신 실행합니다.

```bash
GITLEAKS_DOCKER=1 git commit -m "..."
```

### 2. 공개 사이트 실행

```bash
cp web/.env.example web/.env.local
npm --prefix web install
npm --prefix web run dev
```

---

## 두 앱이 나뉘어 있는 이유

한 앱에 합치면 공개 페이지와 관리자 화면이 **같은 설정 파일에서 상반된 CSP 정책**을
요구합니다. 공개 페이지는 SSG 를 지키려면 `script-src 'unsafe-inline'` 이 필요하고,
관리자는 강한 CSP 가 필요합니다.

오리진을 나누면:

- CSP 를 각각 걸 수 있다
- 관리자 번들이 공개 사이트에 실리지 않는다
- 관리자는 API 와 **동일 오리진**이라 CORS 가 없고 쿠키가 host-only 가 된다

자세한 배경은 org `.github` 저장소의 `docs/OPEN-DECISIONS.md` D-2.

---

## 알아둘 것

**Next.js 16.3.0 입니다.** `middleware.ts` 가 `proxy.ts` 로 바뀌는 등 15 와 규약이
다릅니다. 코드를 쓰기 전에 `web/node_modules/next/dist/docs/` 를 확인하세요.

**공개 사이트에 nonce CSP 를 쓰지 않습니다.** Next.js 가 모든 페이지를 동적 렌더링으로
강제해 SSG/ISR 이 꺼집니다. SEO 가 핵심인 B2B 사이트에서는 받아들일 수 없습니다.

**한글 웹폰트를 쓰지 않습니다.** `next/font/google` 의 한글 폰트는 subsets 에
`korean` 이 없어 글리프가 내려오지 않습니다(확인 완료). 시스템 스택을 씁니다.

**연출은 실패해도 콘텐츠를 가리지 않아야 합니다.** JS 없음 / reduced-motion /
모바일 어느 경로로 빠지든 최악의 결과가 "애니메이션 없는 목록"이지 "빈 화면"이
되어서는 안 됩니다. CI 가 프리렌더 HTML 에 제품명이 들어 있는지 검사합니다.
# FE
