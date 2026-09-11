/**
 * 로딩 자리를 채우는 블록 (DESIGN.md §4 States Skeleton).
 * 색은 gray-200(`bg-hairline`), 치수는 부르는 쪽이 최종 레이아웃과 같게 준다.
 *
 * §4는 1.2s 시머를 함께 적어두지만 넣지 않았다. 애니메이션은 레이아웃이 다 선 뒤에
 * 얹는다 (`docs/PLAN.md` §8). 지금 넣으면 두 번 작업이 된다.
 */
export function Skeleton({ className }: { className: string }) {
	return <div aria-hidden className={`rounded-sm bg-hairline ${className}`} />;
}
