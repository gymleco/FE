"use client";

import { useState, useSyncExternalStore } from "react";

import {
  isReferenceNo,
  REFERENCE_STORAGE_KEY,
} from "@/lib/inquiry-reference";

/**
 * 접수 완료 → 카카오톡으로 넘기는 자리.
 *
 * 하는 일은 둘뿐이다.
 *   1. 접수번호를 크게 보여 준다
 *   2. 번호를 복사해 둔 채로 카카오톡 채팅방을 연다
 *
 * ★ 「다시 적지 않으셔도 됩니다」 를 반드시 적는다.
 *   이걸 안 적으면 고객은 폼에 쓴 내용을 카톡에 처음부터 다시 쓴다.
 *   담당자는 같은 내용을 두 곳에서 두 번 읽고, 둘이 조금이라도 다르면
 *   어느 쪽이 맞는지 되묻게 된다. 혼선은 대부분 여기서 생긴다.
 *
 * ★ 번호가 없어도 동작한다.
 *   저장이 막힌 브라우저, 새 탭에서 이 주소를 연 경우, 번호를 아직 안 주는
 *   서버 버전이어도 접수 자체는 끝났다. 번호 칸만 빠지고 나머지는 그대로다.
 */

// 번호는 이 화면이 떠 있는 동안 바뀌지 않는다 — 구독할 변화가 없다
const subscribe = () => () => {};

function readReference(): string | null {
  try {
    const value = window.sessionStorage.getItem(REFERENCE_STORAGE_KEY);
    return isReferenceNo(value) ? value : null;
  } catch {
    // 사파리 프라이빗 모드 등에서는 접근 자체가 예외를 던진다
    return null;
  }
}

export function InquiryHandoff({ chatUrl }: { chatUrl: string }) {
  /*
   * useEffect + setState 가 아니라 useSyncExternalStore 다.
   * 서버에서는 번호를 모르므로(null) 비워 두고, 브라우저에서 읽어 채운다.
   * 서버가 그린 화면과 첫 화면이 달라서 생기는 수화 경고도 이걸로 피한다.
   */
  const reference = useSyncExternalStore(subscribe, readReference, () => null);
  const [copied, setCopied] = useState(false);

  function copyReference() {
    if (!reference) return;
    const message = `[접수번호 ${reference}] 사이트로 문의 남겼습니다.`;
    /*
     * 막지 않는다(preventDefault 없음). 복사가 실패해도 채팅방은 열려야 한다.
     * 복사는 편의이지 필수가 아니다 — 번호는 화면에 크게 적혀 있다.
     */
    navigator.clipboard?.writeText(message).then(
      () => setCopied(true),
      () => {},
    );
  }

  return (
    <div className="mt-10">
      {reference && (
        <div className="border border-hairline bg-ink-900 px-6 py-5">
          <p className="text-xs tracking-wider text-ink-400">접수번호</p>
          <p className="tabular font-display mt-2 text-2xl font-bold tracking-[0.08em] text-ink-100 select-all md:text-3xl">
            {reference}
          </p>
        </div>
      )}

      {chatUrl && (
        <>
          <p className="mt-6 text-sm text-pretty text-ink-300">
            사이트 문의는 이미 접수되었습니다.{" "}
            <strong className="text-ink-100">
              카카오톡에 내용을 다시 적지 않으셔도 됩니다.
            </strong>
            {reference
              ? " 접수번호만 보내 주시면 담당자가 바로 찾아 이어서 상담해 드립니다."
              : " 채팅방에서 이름을 알려 주시면 담당자가 찾아 이어서 상담해 드립니다."}
          </p>

          {/*
            카카오 노란색(#FEE500)은 카카오의 색이다. 우리 브랜드 노랑과
            섞어 쓰지 않는다 — 누르면 카카오로 간다는 것을 색이 먼저 말한다.
            공식 말풍선 기호는 카카오 디자인 가이드의 원본 파일로만 쓸 수
            있어서, 받기 전까지는 글자만 둔다.
          */}
          <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={copyReference}
            className="mt-5 flex w-full items-center justify-center rounded-full bg-[#FEE500] px-6 py-4 text-base font-bold text-black/85 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            카카오톡으로 상담 이어가기
          </a>

          <p aria-live="polite" className="mt-3 min-h-5 text-xs text-ink-400">
            {copied && "접수번호가 복사되었습니다. 채팅창에 붙여 넣기만 하세요."}
          </p>
        </>
      )}
    </div>
  );
}
