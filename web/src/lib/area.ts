/**
 * 면적 단위 — m² 와 평
 *
 * 이 사이트가 설득하려는 사람은 헬스장·PT샵을 여는 사장님이다.
 * 그들이 임대차 계약서에서 보는 단위는 m² 가 아니라 **평**이다.
 * "2.4m²" 는 감이 안 오지만 "0.7평" 은 즉시 계산이 된다.
 *
 * 법정 단위가 m² 이므로 m² 를 주 표기로 두고 평을 괄호로 병기한다.
 * 순서를 바꾸면 표기 규정에 어긋난다.
 */

/** 1평 = 400/121 m² ≈ 3.3058m² (건축법상 정의) */
const M2_PER_PYEONG = 400 / 121;

export function toPyeong(m2: number): number {
  return m2 / M2_PER_PYEONG;
}

/**
 * 평 표기.
 *
 * 1평 미만은 소수 한 자리까지 — 기구 한 대는 대부분 1평 안쪽이라
 * 반올림해 버리면 전부 "0평" 이나 "1평" 이 되어 비교가 사라진다.
 * 10평 이상은 정수 — 그 크기에서 소수점은 의미가 없다.
 */
export function formatPyeong(m2: number): string {
  const p = toPyeong(m2);
  if (p >= 10) return `${Math.round(p)}평`;
  return `${p.toFixed(1)}평`;
}

/** "2.4m² (0.7평)" 형태의 병기 문자열 */
export function formatArea(m2: number): string {
  return `${m2}m² (${formatPyeong(m2)})`;
}
