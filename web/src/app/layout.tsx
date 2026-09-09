import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteFooter } from "@/components/site-footer";

/**
 * 라틴 디스플레이 서체. "BORN IN SWEDEN" 같은 영문 헤드라인과
 * 제품 모델명·수치에 쓴다.
 *
 * 한글은 웹폰트를 쓰지 않는다 — next/font/google 의 한글 폰트는
 * subsets 에 "korean" 이 없어 글리프가 내려오지 않는다.
 * 자세한 배경은 docs/OPEN-DECISIONS.md D-9.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GYMLECO KOREA — 스웨덴에서 온, 공간을 아는 헬스기구",
    template: "%s | GYMLECO KOREA",
  },
  description:
    "스웨덴 본사 직영 헬스기구 브랜드 짐레코. 공간 절약형 컴팩트 설계로 20~30평 피티샵에도 들어갑니다. 무료 시연 신청 가능.",
  keywords: [
    "짐레코",
    "GYMLECO",
    "헬스장 기구",
    "피트니스 장비",
    "헬스장 창업",
    "PT샵 기구",
    "스웨덴 헬스기구",
    "상업용 헬스기구",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "GYMLECO KOREA",
    title: "GYMLECO KOREA — 스웨덴에서 온, 공간을 아는 헬스기구",
    description:
      "스웨덴 본사 직영. 공간 절약형 설계, 최소한의 유지보수, 긴 수명. 무료 시연 신청 가능합니다.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f7f5",
  width: "device-width",
  initialScale: 1,
  // 확대를 막지 않는다 — 접근성 요구사항이다.
  maximumScale: 5,
};

/*
 * 첫 페인트 전에 테마를 정한다.
 *
 * React 가 돌기 전에 실행돼야 한다. 컴포넌트에서 읽어 붙이면 어두운 화면이
 * 한 번 그려진 뒤 밝아져서, 밝은 테마를 고른 사람은 페이지를 열 때마다
 * 검은 섬광을 본다.
 *
 * 저장된 값이 없으면 아무것도 하지 않는다 — 속성이 없는 상태가 곧 다크다.
 * localStorage 접근 자체가 예외를 던지는 환경(사파리 프라이빗)이 있으므로
 * 통째로 try 로 감싼다. 실패하면 기본값인 다크로 열린다.
 */
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem("gymleco-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#f7f7f5":"#08090a")}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /*
     * suppressHydrationWarning 은 <html> 한 겹에만 적용된다(자식으로 내려가지 않는다).
     * 위 스크립트가 수화 전에 data-theme 을 붙이므로, 서버가 그린 <html> 과
     * 클라이언트의 <html> 은 반드시 다르다 — 정적 페이지라 서버가 이 값을
     * 알 방법이 없다. 실제 불일치이므로 이 한 곳만 명시적으로 눌러 둔다.
     * 다른 불일치는 그대로 경고로 남아야 한다.
     */
    <html
      lang="ko"
      className={`${archivo.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/*
          키보드·스크린리더 사용자가 긴 스크롤 연출을 건너뛰고
          바로 본문으로 갈 수 있어야 한다.
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:bg-signal focus:px-4 focus:py-2 focus:font-semibold focus:text-signal-ink"
        >
          본문 바로가기
        </a>
        <SmoothScroll>
          {children}
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
