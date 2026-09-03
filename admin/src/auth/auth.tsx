import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, setSessionLostHandler, type Me } from "@/lib/api";

/**
 * 로그인 상태.
 *
 * 토큰을 담지 않는다 — 인증은 HttpOnly 쿠키로만 이뤄지고, 여기가 아는 것은
 * "누구로 로그인돼 있는가" 뿐이다. 그래서 새로고침하면 /me 를 다시 물어본다.
 * 상태를 저장소에 넣어 두면 서버에서 계정이 잠긴 뒤에도 화면은 로그인된 척한다.
 */

type AuthState =
  | { status: "checking" }
  | { status: "in"; me: Me }
  | { status: "out" };

type AuthValue = {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "checking" });

  // 접근 토큰이 만료되고 갱신도 실패하면 api 계층이 이걸 부른다
  useEffect(() => {
    setSessionLostHandler(() => setState({ status: "out" }));
    return () => setSessionLostHandler(null);
  }, []);

  useEffect(() => {
    let alive = true;
    api
      .get<Me>("/admin/auth/me")
      .then((me) => alive && setState({ status: "in", me }))
      .catch(() => alive && setState({ status: "out" }));
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const me = await api.post<Me>("/admin/auth/login", { username, password });
    setState({ status: "in", me });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/admin/auth/logout");
    } finally {
      // 서버 호출이 실패해도 화면은 반드시 로그아웃 상태가 돼야 한다
      setState({ status: "out" });
    }
  }, []);

  const value = useMemo(() => ({ state, login, logout }), [state, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider 안에서만 쓸 수 있습니다.");
  return v;
}
