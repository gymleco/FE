/// <reference types="vite/client" />

/** .env 로 들어오는 값. 여기에 적어 두면 오타를 컴파일러가 잡는다. */
interface ImportMetaEnv {
  readonly VITE_API_BASE_PATH?: string;
  readonly VITE_CDN_ORIGIN?: string;
  readonly VITE_DEV_API_PROXY_TARGET?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
