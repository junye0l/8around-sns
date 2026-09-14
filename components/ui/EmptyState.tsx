/**
 * 아직 아무것도 없을 때 그 자리에 서는 한 줄.
 *
 * 문구만 받는다.
 */
export function EmptyState({ message }: { message: string }) {
	return (
		<p className="py-16 text-center text-body-sm text-fg-muted">{message}</p>
	);
}
