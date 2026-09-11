/**
 * 아직 아무것도 없을 때 그 자리에 서는 한 줄.
 *
 * 버튼을 받지 않는다. 쓰는 세 화면 모두 바로 위에 입력칸이 있어서 누를 곳이 이미 보인다.
 */
export function EmptyState({ message }: { message: string }) {
	return (
		<p className="py-16 text-center text-body-sm text-fg-muted">{message}</p>
	);
}
