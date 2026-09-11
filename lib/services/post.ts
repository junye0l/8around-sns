import type { SupabaseClient } from "@supabase/supabase-js";
import { postContentSchema } from "@/lib/utils/post-content";
import type { Database } from "@/types/database";

export type CreatePostResult = { ok: true } | { ok: false; error: string };

/**
 * 게시글 작성. 검증은 진입점이 아니라 여기서 한다 — 브라우저 검증은 친절함이지
 * 방어가 아니다(규칙 9). Next를 모르므로 테스트에서 그대로 부를 수 있다.
 *
 * `author_id`는 호출부가 세션에서 꺼내 준다. 폼에서 받지 않는다 — 받아도
 * RLS "본인만 게시글을 쓴다"(`supabase/migrations/0001_init.sql:130-132`)가 막지만,
 * 애초에 사용자 입력으로 두지 않는 편이 경로 하나를 줄인다.
 */
export async function createPost(
	supabase: SupabaseClient<Database>,
	authorId: string,
	input: unknown,
): Promise<CreatePostResult> {
	const parsed = postContentSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0].message };
	}

	const { error } = await supabase
		.from("posts")
		.insert({ author_id: authorId, content: parsed.data });

	if (error) {
		return {
			ok: false,
			error: "글을 올리지 못했어요. 잠시 뒤에 다시 해주세요",
		};
	}

	return { ok: true };
}
