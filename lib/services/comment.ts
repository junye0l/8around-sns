import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { COMMENT_CONTENT_MAX, contentSchema } from "@/lib/utils/content";
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
