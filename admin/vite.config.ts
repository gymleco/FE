import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

/**
 * 배포에서는 nginx 가 같은 오리진의 /api 를 Spring 으로 넘긴다.
 * 로컬에는 nginx 가 없으므로 dev server 가 그 역할을 대신한다.
 * 이렇게 해야 앱 코드가 개발·운영에서 똑같이 상대 경로만 쓴다 —
 * 절대 URL 을 쓰기 시작하면 CORS 와 쿠키 문제가 되살아난다.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_DEV_API_PROXY_TARGET ?? "http://localhost:8080";
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target,
          changeOrigin: false, // 쿠키가 host-only 로 남아야 한다
        },
      },
    },
  };
});
