import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui";

/**
 * 확인창.
 *
 * ★ 삭제 · 비공개 전환에는 반드시 둔다 (README «만들 때 지킬 것»).
 *   되돌릴 수 없는 일과 사이트에서 사라지는 일은 한 번 더 물어야 한다.
 *
 * ★ 무엇이 어떻게 되는지 이름을 넣어 말한다.
 *   "정말 삭제하시겠습니까?" 는 무엇을 지우는지 알려 주지 않는다.
 *
 * <dialog> 를 쓴다. 초점 가두기 · Esc 닫기 · 바깥 클릭 막기를
 * 브라우저가 이미 정확히 해 준다. 직접 만들면 대개 초점이 새어 나간다.
 */
export function Confirm({
  open,
  title,
  body,
  confirmText,
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmText: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault(); // 진행 중일 때 Esc 로 빠져나가 상태가 어긋나는 것을 막는다
        if (!busy) onCancel();
      }}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xs border border-line bg-surface p-0 text-ink backdrop:bg-black/45"
    >
      <div className="flex flex-col gap-3 p-5">
        <h2 className="text-base font-bold">{title}</h2>
        <div className="text-sm leading-relaxed text-ink-2">{body}</div>
        <div className="mt-2 flex justify-end gap-2">
          <Button onClick={onCancel} disabled={busy}>
            취소
          </Button>
          <Button tone={tone} busy={busy} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
