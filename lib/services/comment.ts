import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { contentSchema } from "@/lib/utils/content";
import { COMMENT_CONTENT_MAX } from "@/lib/utils/content-limits";
import type { Database } from "@/types/database";

export type CreateCommentResult = { ok: true } | { ok: false; error: string };

/**
 * `postId`는 폼의 숨은 값이라 사용자가 바꿔 보낼 수 있다. 바꿔 봐야 다른 글에
 * 댓글이 달릴 뿐이고 그건 원래 되는 일이라 막지 않는다. 형식만 본다 —
 * uuid가 아니면 Postgres가 캐스팅에서 터지므로 여기서 걸러 문구로 돌려준다.
 */
const createCommentSchema = z.object({
	postId: z.uuid("사라진 글이에요"),
	// 답글이 아니면 폼에 숨은 입력이 없고 FormData.get 이 null을 준다
	parentId: z.uuid("사라진 댓글이에요").nullable(),
	content: contentSchema(COMMENT_CONTENT_MAX),
});

/**
 * 댓글 작성. 검증은 진입점이 아니라 여기서 한다 — 브라우저 검증은 친절함이지
 * 방어가 아니다(규칙 9). Next를 모르므로 테스트에서 그대로 부를 수 있다.
 *
 * `author_id`는 호출부가 세션에서 꺼내 준다. 폼에서 받지 않는다 —
 * `lib/services/post.ts`와 같은 이유다.
 *
 * 답글도 같은 함수가 받는다. 다른 것은 `parentId` 하나뿐이라 서비스를 새로 만들지
 * 않는다(규칙 2). 깊이 제한은 세지 않는다 — RLS가 "부모가 이미 자식이면 거절"을
 * 한다 (`supabase/migrations/0001_init.sql:155-171`, 규칙 9).
 */
export async function createComment(
	supabase: SupabaseClient<Database>,
	authorId: string,
	input: { postId: unknown; parentId: unknown; content: unknown },
): Promise<CreateCommentResult> {
	const parsed = createCommentSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0].message };
	}

	const { error } = await supabase.from("comments").insert({
		post_id: parsed.data.postId,
		parent_id: parsed.data.parentId,
		author_id: authorId,
		content: parsed.data.content,
	});

	if (error) {
		return {
			ok: false,
			error: "댓글을 남기지 못했어요. 잠시 뒤에 다시 해주세요",
		};
	}

	return { ok: true };
}

export type UpdateCommentResult = { ok: true } | { ok: false; error: string };

const updateCommentSchema = z.object({
	commentId: z.uuid("사라진 댓글이에요"),
	content: contentSchema(COMMENT_CONTENT_MAX),
});

/**
 * 댓글과 답글 수정. 본문만 바꾼다. 어느 글, 어느 댓글 아래인지는 트리거가 고정한다
 * (`supabase/migrations/0002_comments_immutable_thread.sql`).
 *
 * 작성자를 받지 않는다. "본인 댓글만 수정한다"(`supabase/migrations/0001_init.sql`)가 본다 (규칙 9).
 * 남의 댓글이면 RLS가 0행으로 만들고, 그 경우를 문구로 바꾼다. `updatePost`와 같다.
 */
export async function updateComment(
	supabase: SupabaseClient<Database>,
	input: { commentId: unknown; content: unknown },
): Promise<UpdateCommentResult> {
	const parsed = updateCommentSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0].message };
	}

	const { data, error } = await supabase
		.from("comments")
		.update({ content: parsed.data.content })
		.eq("id", parsed.data.commentId)
		.select("id")
		.maybeSingle();

	if (error) {
		return {
			ok: false,
			error: "댓글을 고치지 못했어요. 잠시 뒤에 다시 해주세요",
		};
	}
	if (!data) return { ok: false, error: "내가 쓴 댓글만 고칠 수 있어요" };

	return { ok: true };
}

export type DeleteCommentResult = { ok: true } | { ok: false; error: string };

/**
 * 댓글과 답글 삭제. 최상위 댓글을 지우면 달린 답글은 외래키의 `on delete cascade`가
 * 같이 지운다 (`supabase/migrations/0001_init.sql:79`).
 *
 * 권한과 0행 판정은 `updateComment`와 같다 ("본인 댓글만 지운다").
 */
export async function deleteComment(
	supabase: SupabaseClient<Database>,
	input: unknown,
): Promise<DeleteCommentResult> {
	const parsed = z.uuid("사라진 댓글이에요").safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0].message };
	}

	const { data, error } = await supabase
		.from("comments")
		.delete()
		.eq("id", parsed.data)
		.select("id")
		.maybeSingle();

	if (error) {
		return {
			ok: false,
			error: "댓글을 지우지 못했어요. 잠시 뒤에 다시 해주세요",
		};
	}
	if (!data) return { ok: false, error: "내가 쓴 댓글만 지울 수 있어요" };

	return { ok: true };
}
