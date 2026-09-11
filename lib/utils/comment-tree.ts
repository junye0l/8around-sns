/**
 * 평평한 댓글 목록을 부모 · 답글 두 층으로 접는다.
 *
 * 1뎁스가 끝이라 재귀가 없다 — 답글의 답글은 RLS가 막는다
 * (`supabase/migrations/0001_init.sql:155-171`). 더 깊어질 일이 생기면 그때 편다.
 *
 * 행 모양을 쿼리에서 가져오지 않고 제네릭으로 받는다. 이 함수는 id와 parent_id만
 * 보므로 `lib/queries/comment.ts`를 알 필요가 없다 (규칙 1 — 순수 함수로 떼어낸다).
 *
 * 순서는 입력 그대로다. 부르는 쪽이 `created_at` 오름차순으로 읽어 오므로
 * 댓글도 답글도 오래된 순으로 선다.
 */
export function toCommentTree<
	T extends { id: string; parent_id: string | null },
>(rows: T[]): (T & { replies: T[] })[] {
	const byParent = new Map<string, T[]>();
	const roots: T[] = [];

	for (const row of rows) {
		if (row.parent_id === null) {
			roots.push(row);
			continue;
		}

		const siblings = byParent.get(row.parent_id);
		if (siblings) siblings.push(row);
		else byParent.set(row.parent_id, [row]);
	}

	// 부모가 목록에 없는 답글은 버려진다. 한 글의 댓글을 통째로 읽어 오고
	// 부모가 지워지면 답글도 cascade로 같이 지워지므로 실제로는 생기지 않는다
	return roots.map((row) => ({ ...row, replies: byParent.get(row.id) ?? [] }));
}
