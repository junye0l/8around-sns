"use server";

import { refresh } from "next/cache";
import {
	type CreateCommentResult,
	createComment,
	type DeleteCommentResult,
	deleteComment,
	type UpdateCommentResult,
	updateComment,
} from "@/lib/services/comment";
import { createClient } from "@/lib/supabase/server";
import { getSessionUserId } from "@/lib/supabase/session";

/**
 * 댓글 진입점. 로그인 확인 → services 호출 → 화면 갱신.
 *
 * `refresh`를 쓰는 이유는 `lib/actions/post.ts`와 같다 — 이 화면들은 쿠키를 읽어
 * 요청마다 새로 그려지므로 무효화할 캐시가 없다
 * (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md:148`).
 */
export async function createCommentAction(
	_prev: CreateCommentResult | null,
	formData: FormData,
): Promise<CreateCommentResult> {
	const supabase = await createClient();

	const userId = await getSessionUserId(supabase);
	if (!userId) {
		return { ok: false, error: "로그인이 풀렸어요. 다시 로그인해 주세요" };
	}

	const result = await createComment(supabase, userId, {
		postId: formData.get("post_id"),
		parentId: formData.get("parent_id"),
		content: formData.get("content"),
	});
	if (result.ok) refresh();

	return result;
}

/**
 * 댓글 수정 진입점. 로그인 확인 → services 호출 → 화면 갱신.
 * 소유권은 여기서 보지 않는다. RLS가 본다 (규칙 9).
 */
export async function updateCommentAction(
	_prev: UpdateCommentResult | null,
	formData: FormData,
): Promise<UpdateCommentResult> {
	const supabase = await createClient();

	const userId = await getSessionUserId(supabase);
	if (!userId) {
		return { ok: false, error: "로그인이 풀렸어요. 다시 로그인해 주세요" };
	}

	const result = await updateComment(supabase, {
		commentId: formData.get("comment_id"),
		content: formData.get("content"),
	});
	if (result.ok) refresh();

	return result;
}

/**
 * 댓글 삭제 진입점. 로그인 확인 → services 호출 → 화면 갱신.
 * 소유권은 여기서 보지 않는다. RLS가 본다 (규칙 9).
 */
export async function deleteCommentAction(
	_prev: DeleteCommentResult | null,
	formData: FormData,
): Promise<DeleteCommentResult> {
	const supabase = await createClient();

	const userId = await getSessionUserId(supabase);
	if (!userId) {
		return { ok: false, error: "로그인이 풀렸어요. 다시 로그인해 주세요" };
	}

	const result = await deleteComment(supabase, formData.get("comment_id"));
	if (result.ok) refresh();

	return result;
}
