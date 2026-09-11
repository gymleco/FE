/**
 * 접수번호 — 사이트 문의와 카카오톡 대화를 잇는 표식.
 *
 *   GL-260911-K7Q2
 *
 * ★ 형식은 BE 의 V10 마이그레이션 CHECK 제약과 같아야 한다.
 *   한쪽만 고치면 서버가 준 번호를 여기서 «이상한 값» 으로 버린다.
 *   옛 문의는 id 로 만든 번호라 뒷자리가 4자보다 길 수 있다.
 */
export const REFERENCE_PATTERN = /^GL-\d{6}-[0-9A-Z]{4,8}$/;

export function isReferenceNo(value: unknown): value is string {
  return typeof value === "string" && REFERENCE_PATTERN.test(value);
}

/**
 * 폼 → 완료 화면으로 번호를 넘기는 자리.
 *
 * 주소창(?ref=...)이 아니라 sessionStorage 를 쓰는 이유는
 * components/contact-form.tsx 에 적어 두었다.
 */
export const REFERENCE_STORAGE_KEY = "gymleco-inquiry-ref";
