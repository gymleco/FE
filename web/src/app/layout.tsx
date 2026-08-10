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
  themeColor: "#08090a",
  width: "device-width",
  initialScale: 1,
  // 확대를 막지 않는다 — 접근성 요구사항이다.
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${archivo.variable} h-full`}>
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
