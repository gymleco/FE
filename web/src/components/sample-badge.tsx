/**
 * 자리표시자 데이터 표시.
 *
 * 실제 스펙으로 교체하면서 isPlaceholder 를 지우면 배지도 사라진다.
 * 가짜 수치가 조용히 배포되는 것을 막기 위한 장치다 —
 * 이 사이트는 설치 면적 같은 숫자로 설득하는 사이트라
 * 임시값이 그대로 공개되면 신뢰를 잃는다.
 */
export function SampleBadge() {
  return (
    <span className="rounded-xs border border-ink-600 px-1.5 py-0.5 text-[0.65rem] whitespace-nowrap text-ink-400">
      샘플 데이터
    </span>
  );
}
