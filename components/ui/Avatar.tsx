/**
 * 이름 첫 글자를 담은 원. 이미지 업로드는 범위 밖이라 글자만 쓴다.
 *
 * 치수는 문서에 없다 — DESIGN.md §4에 SEED Avatar 항목이 없어 지어내지 않고
 * 4px 그리드(§1 Principle 5)에서 40px을 골랐다. 색은 중립으로 간다.
 * 모든 글에 붙는 요소라 브랜드 틴트를 쓰면 주황이 흔해진다 (§1 Principle 1).
 */
export function Avatar({ name }: { name: string }) {
	return (
		<span
			// 바로 옆에 이름이 그대로 적혀 있다. 읽어주면 같은 말을 두 번 한다
			aria-hidden
			className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hairline text-body-sm font-semibold text-fg-muted"
		>
			{/* 이모지·한글 조합을 반으로 자르지 않으려면 코드 유닛이 아니라 글자로 센다 */}
			{[...name][0] ?? "?"}
		</span>
	);
}
