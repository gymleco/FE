/**
 * 카카오톡 채널 스위치.
 *
 * 채널 주소는 아직 받지 못했다. 값이 없으면 카카오 관련 화면 요소가
 * 하나도 나오지 않고, 지금처럼 «담당자가 연락드립니다» 로 끝난다.
 *
 * ── 켜는 방법 ──
 *
 *   web/.env.local (또는 배포 환경변수) 에
 *     NEXT_PUBLIC_KAKAO_CHANNEL_ID=_xxxxxx
 *   를 넣는다. 채널 관리자센터의 채널 URL(pf.kakao.com/_xxxxxx)에서
 *   밑줄로 시작하는 뒷부분이다.
 *
 * ── 왜 카카오 SDK 를 쓰지 않는가 ──
 *
 * 채팅방을 여는 데는 링크 하나면 된다. SDK 를 붙이면 외부 스크립트가
 * 모든 화면에 실리고, CSP 에 카카오 도메인을 열어야 하고, 쿠키 정책도
 * 고쳐야 한다. 링크는 그중 아무것도 필요 없다 — 사이트 밖으로 «이동» 할 뿐,
 * 사이트 안에서 카카오 코드가 돌지 않는다.
 *
 * ★ 사이트는 카카오에 아무것도 보내지 않는다.
 *   고객이 스스로 채팅방을 열고 접수번호를 보낸다. 그래서 개인정보를
 *   카카오에 «넘기는» 일이 생기지 않는다. 알림톡을 붙이는 날은 다르다 —
 *   그때는 전화번호가 발송 대행사로 넘어가므로 처리방침에 위탁 항목이
 *   필요하다. 그건 이 스위치와 별개로 따로 켠다.
 */

const raw = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_ID?.trim() ?? "";

/**
 * 형식이 맞을 때만 인정한다.
 * 채널 URL 을 통째로 붙여 넣는 실수가 흔한데, 그러면 주소가
 * pf.kakao.com/https://... 가 되어 깨진 링크가 나간다.
 */
export const KAKAO_CHANNEL_ID = /^_[A-Za-z0-9]{3,20}$/.test(raw) ? raw : "";

export const KAKAO_ENABLED = KAKAO_CHANNEL_ID !== "";

/** 1:1 채팅방 주소. 모바일에서는 카카오톡 앱이 열린다. */
export const KAKAO_CHAT_URL = KAKAO_ENABLED
  ? `https://pf.kakao.com/${KAKAO_CHANNEL_ID}/chat`
  : "";
