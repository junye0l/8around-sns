/**
 * 아직 아무것도 없을 때 그 자리에 서는 한 줄 (DESIGN.md §4 States · §6).
 * 무엇이 없는지 말하고 다음 행동만 가리킨다.
 *
 * 버튼을 받지 않는다. 세 화면 모두 바로 위에 입력칸이 있어서 누를 곳이 이미 보인다 —
 * DESIGN.md §4의 "No button — user resets the filter themselves"와 같은 이유다.
 * 버튼이 필요한 빈 상태가 나오면 그때 연다 (규칙 1).
 */
export function EmptyState({ message }: { message: string }) {
	return (
		<p className="py-16 text-center text-body-sm text-fg-muted">{message}</p>
	);
}
