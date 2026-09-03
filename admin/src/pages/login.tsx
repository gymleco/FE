import { useState } from "react";

import { useAuth } from "@/auth/auth";
import { ApiError } from "@/lib/api";
import { normalizeFieldErrors } from "@/lib/labels";
import { Button, Field, inputClass } from "@/components/ui";

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setNotice(null);
    try {
      await login(username, password);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(normalizeFieldErrors(err.fields));
        /*
         * 아이디가 틀렸는지 비밀번호가 틀렸는지 구분해 주지 않는다.
         * 서버가 두 경우에 같은 문장을 주는 이유이기도 하다 —
         * 구분해 주면 어떤 아이디가 실제로 있는지 알려 주는 셈이 된다.
         */
        if (Object.keys(err.fields).length === 0) setNotice(err.message);
      } else {
        setNotice("서버에 연결하지 못했습니다.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <form
        onSubmit={(e) => void submit(e)}
        className="flex w-full max-w-sm flex-col gap-5 rounded-xs border border-line bg-surface p-6"
      >
        <div>
          <p className="text-[0.68rem] font-bold tracking-[0.2em] text-accent">GYMLECO</p>
          <h1 className="mt-1 text-lg font-bold">관리 화면 로그인</h1>
        </div>

        {notice && (
          <p
            role="alert"
            className="rounded-xs border border-risk/30 bg-risk-bg px-3 py-2 text-sm font-semibold text-risk"
          >
            {notice}
          </p>
        )}

        <Field label="아이디" required error={errors.username}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={username}
              autoComplete="username"
              autoFocus
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass(invalid)}
            />
          )}
        </Field>

        <Field label="비밀번호" required error={errors.password}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              type="password"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass(invalid)}
            />
          )}
        </Field>

        <Button type="submit" tone="primary" busy={busy} className="mt-1 w-full py-2.5">
          로그인
        </Button>
      </form>
    </div>
  );
}
