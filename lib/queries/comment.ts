import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { toCommentTree } from "@/lib/utils/comment-tree";
import type { Database } from "@/types/database";

/** 댓글 한 칸. 답글도 같은 모양이라 카드 하나를 같이 쓴다 (규칙 2) */
export type CommentReply = {
	id: string;
	parent_id: string | null;
	content: string;
	created_at: string;
	author: {
		id: string;
		display_name: string;
		avatar_path: string | null;
	};
};

/** 최상위 댓글. 자기 답글을 달고 다닌다 ([결정 0008](../../docs/decisions/0008-reply-tree-on-post.md)) */
export type PostComment = CommentReply & { replies: CommentReply[] };

/** 댓글 상세의 주인공. 위에 얹을 게시글을 알아야 해서 `post_id`를 같이 읽는다 */
export type CommentDetail = CommentReply & { post_id: string };

const COMMENT_SELECT =
	"id, parent_id, content, created_at, author:profiles(id, display_name, avatar_path)";

const COMMENT_DETAIL_SELECT =
	"id, parent_id, post_id, content, created_at, author:profiles(id, display_name, avatar_path)";

/**
 * 한 글에 달린 댓글과 답글. 한 번에 읽고 앱에서 두 층으로 접는다.
 *
 * 답글까지 같이 읽는 이유: 게시글 화면이 답글을 부모 아래 세로선으로 이어 보여준다
 * ([결정 0008](../../docs/decisions/0008-reply-tree-on-post.md)). 최상위만 읽던
 * 결정 0007을 이 지점에서 뒤집었다.
 *
 * 쿼리를 나누지 않는 이유: 답글 수를 DB에서 세려면 자기 참조 임베드가 필요한데
 * PostgREST가 그걸 못 한다 — `comments!comments_parent_id_fkey` 힌트를 실제 DB에
 * 던져 PGRST200으로 거절당했다. 어차피 본문까지 필요하므로 한 번에 읽는 쪽이 싸다.
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
		.select(COMMENT_SELECT)
		.eq("post_id", postId)
		.order("created_at", { ascending: true });

	if (error) throw new Error(`댓글을 읽지 못했다: ${error.message}`);

	return toCommentTree(data);
}

/**
 * 댓글 하나. 없으면 null이고, 화면은 그걸 404로 바꾼다.
 *
 * id를 먼저 검사하는 이유는 `lib/queries/post.ts:61`의 `getPost`와 같다 —
 * uuid가 아닌 주소는 Postgres 캐스팅(22P02)에서 터져 에러 화면으로 샌다.
 *
 * 답글(`parent_id`가 있는 행)은 여기서 걸러 없는 것으로 친다. 1뎁스가 끝이라
 * 답글에는 자기 화면이 없다(결정 0007). 덕분에 RLS의 깊이 거절
 * (`supabase/migrations/0001_init.sql:155-171`)은 화면을 통해서는 닿지 않는다.
 */
export async function getComment(
	supabase: SupabaseClient<Database>,
	id: string,
): Promise<CommentDetail | null> {
	if (!z.uuid().safeParse(id).success) return null;

	const { data, error } = await supabase
		.from("comments")
		.select(COMMENT_DETAIL_SELECT)
		.eq("id", id)
		.is("parent_id", null)
		.maybeSingle();

	if (error) throw new Error(`댓글을 읽지 못했다: ${error.message}`);

	return data;
}

/**
 * 한 댓글에 달린 답글. 1뎁스가 끝이라 여기서 더 내려갈 곳은 없다.
 * `comments_parent_id_idx`(`supabase/migrations/0001_init.sql:89`)가 그대로 받는다.
 */
export async function listCommentReplies(
	supabase: SupabaseClient<Database>,
	commentId: string,
): Promise<CommentReply[]> {
	const { data, error } = await supabase
		.from("comments")
		.select(COMMENT_SELECT)
		.eq("parent_id", commentId)
		.order("created_at", { ascending: true });

	if (error) throw new Error(`답글을 읽지 못했다: ${error.message}`);

	return data;
}
