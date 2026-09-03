import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";

/**
 * 목록·상세를 불러오는 공통 뼈대.
 *
 * 화면마다 loading / error / data 를 따로 쓰면 어느 한 화면에서만
 * 오류 처리를 빠뜨리게 된다. 빠뜨린 화면은 실패했을 때 아무 말 없이
 * 비어 보이고, 쓰는 사람은 «등록된 게 없나 보다» 라고 오해한다.
 */
export function useLoad<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        // 세션이 끊긴 경우는 앱이 로그인 화면으로 보내므로 여기서 말하지 않는다
        if (e instanceof ApiError && e.status === 401) return;
        setError(
          e instanceof ApiError ? e.message : "불러오지 못했습니다. 새로고침해 주세요.",
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // fetcher 는 화면마다 인라인으로 만들어져 매 렌더 새 함수다.
    // deps 로 «언제 다시 부를지» 를 화면이 직접 정한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, error, loading, reload, setData };
}
