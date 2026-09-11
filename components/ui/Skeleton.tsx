/**
 * 로딩 자리를 채우는 블록. 치수는 부르는 쪽이 최종 레이아웃과 같게 준다.
 *
 * 시머 애니메이션은 없다. 움직임은 레이아웃이 다 선 뒤에 얹는다.
 * @see docs/PLAN.md 모션 절
 */
export function Skeleton({ className }: { className: string }) {
	return <div aria-hidden className={`rounded-sm bg-hairline ${className}`} />;
}
