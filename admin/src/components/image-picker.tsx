import { useRef, useState } from "react";

import { ApiError, api, type UploadResult } from "@/lib/api";
import { Button, Pill } from "@/components/ui";

/**
 * 사진 한 장 고르기.
 *
 * ★ 권장 해상도를 화면에 적는다 (README «만들 때 지킬 것»).
 *   안 적으면 휴대폰으로 찍은 4000px 사진이 그대로 올라오고,
 *   반대로 800px 짜리를 올려 놓고 왜 흐린지 묻게 된다.
 *
 * ★ 서버가 크기별로 다시 만들어 준다.
 *   올린 파일을 그대로 쓰지 않는다. 서버가 시그니처를 확인하고 다시
 *   인코딩해 400 · 800 · 1600 세 벌을 만든다. 그래서 화면이 들고 있는
 *   값은 파일이 아니라 «키» 하나뿐이다.
 *
 * ★ 실패를 조용히 넘기지 않는다.
 *   확장자만 .jpg 로 바꾼 파일은 서버가 400 으로 돌려보낸다.
 *   그 문장을 그대로 보여 준다 — 사람이 고칠 수 있는 정보다.
 */

const CDN = (import.meta.env.VITE_CDN_ORIGIN ?? "").replace(/\/$/, "");

/** "p/uuid.jpg" → "{CDN}/p/uuid/400.jpg" — 공개 사이트와 같은 규칙 */
export function previewUrl(key: string | null | undefined, size = 400): string | null {
  if (!key) return null;
  const dot = key.lastIndexOf(".");
  const prefix = dot > 0 ? key.slice(0, dot) : key;
  const ext = dot > 0 ? key.slice(dot + 1) : "jpg";
  return `${CDN}/${prefix}/${size}.${ext}`;
}

export function ImagePicker({
  label,
  value,
  onChange,
  help,
  transparent = false,
  required = false,
  error,
}: {
  label: string;
  value: string | null;
  onChange: (key: string | null) => void;
  help?: string;
  /** 누끼처럼 배경이 비치는 사진이면 미리보기 바탕을 체크무늬로 */
  transparent?: boolean;
  /** 서버가 NOT NULL 로 막는 자리. 없이 저장하면 거절당한다 */
  required?: boolean;
  /** 저장을 눌렀는데 이 사진 때문에 막혔을 때 */
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await api.upload<UploadResult>("/admin/uploads/image", form);
      onChange(result.key);
    } catch (e) {
      setUploadError(
        e instanceof ApiError ? e.message : "사진을 올리지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = ""; // 같은 파일을 다시 고를 수 있게
    }
  }

  const url = previewUrl(value, 400);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {label}
        {required ? (
          <span className="rounded-xs bg-accent/12 px-1 py-px text-[0.65rem] font-bold text-accent">
            필수
          </span>
        ) : (
          <span className="text-xs font-normal text-ink-3">선택</span>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div
          className={`flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xs border border-line ${
            transparent ? "bg-[repeating-conic-gradient(#e9e7e2_0_25%,#fff_0_50%)] bg-[length:14px_14px]" : "bg-surface-2"
          }`}
        >
          {url ? (
            <img
              src={url}
              alt=""
              className="size-full object-contain"
              onError={(e) => {
                // 이미지 서버가 안 떠 있어도 폼은 계속 쓸 수 있어야 한다
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-xs text-ink-3">사진 없음</span>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button busy={busy} onClick={() => input.current?.click()}>
              {value ? "다른 사진으로" : "사진 올리기"}
            </Button>
            {value && (
              <Button tone="danger" disabled={busy} onClick={() => onChange(null)}>
                사진 빼기
              </Button>
            )}
          </div>
          <p className="text-xs text-ink-3">
            {help ?? "가로 1200px 이상 권장 · JPG 또는 PNG · 10MB 이하"}
          </p>
          {value && (
            <div className="flex items-center gap-2">
              <Pill tone="ok">올림</Pill>
              <span className="truncate font-mono text-xs text-ink-3">{value}</span>
            </div>
          )}
          {/* 올리다 실패한 것과 «비어 있어서 막힌 것» 을 둘 다 같은 자리에 적는다 */}
          {(uploadError ?? error) && (
            <p className="flex items-start gap-1 text-xs font-semibold text-risk">
              <span aria-hidden="true">!</span>
              {uploadError ?? error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
    </div>
  );
}
