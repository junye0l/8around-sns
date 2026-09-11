import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type PostComment = {
	id: string;
	content: string;
	created_at: string;
	author: { username: string; display_name: string };
};

/**
 * 한 글에 달린 댓글. 대댓글(`parent_id`가 있는 것)은 빼고 최상위만 편다 —
 * 대댓글은 댓글 상세에서 본다 (`docs/decisions/0007-comment-routes.md`).
 *
 * 정렬은 오래된 순이다. 피드와 반대인데, 대화는 위에서 아래로 읽는다.
 * `comments_post_id_idx`(`supabase/migrations/0001_init.sql:88`)가 그대로 받는다.
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function listPostComments(
	supabase: SupabaseClient<Database>,
	postId: string,
): Promise<PostComment[]> {
	const { data, error } = await supabase
		.from("comments")
		.select("id, content, created_at, author:profiles(username, display_name)")
		.eq("post_id", postId)
		.is("parent_id", null)
		.order("created_at", { ascending: true });

	if (error) throw new Error(`댓글을 읽지 못했다: ${error.message}`);

	return data;
}
