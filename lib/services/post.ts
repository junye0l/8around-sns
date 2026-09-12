import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { contentSchema, POST_CONTENT_MAX } from "@/lib/utils/content";
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
	const parsed = contentSchema(POST_CONTENT_MAX).safeParse(input);
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

export type SetPostLikeResult = { ok: true } | { ok: false; error: string };

/**
 * `postId`는 폼의 숨은 값이라 사용자가 바꿔 보낼 수 있다. 바꿔 봐야 다른 글에
 * 좋아요를 누를 뿐이고 그건 원래 되는 일이라 막지 않는다. 형식만 본다 —
 * uuid가 아니면 Postgres가 캐스팅에서 터지므로 여기서 걸러 문구로 돌려준다.
 *
 * `intent`는 버튼이 지금 보고 있는 상태에서 나온다. `lib/services/follow.ts`와
 * 같은 이유로 서버가 현재 상태를 다시 읽어 뒤집지 않는다 — 그 읽기는 곧 낡는다.
 */
const setPostLikeSchema = z.object({
	postId: z.uuid("사라진 글이에요"),
	intent: z.enum(["like", "unlike"], "알 수 없는 요청이에요"),
});

/**
 * 좋아요를 누르거나 취소한다. 검증은 진입점이 아니라 여기서 한다 — 브라우저 검증은
 * 친절함이지 방어가 아니다(규칙 9). Next를 모르므로 테스트에서 그대로 부를 수 있다.
 *
 * `userId`는 호출부가 세션에서 꺼내 준다. 폼에서 받지 않는다 — `createPost`와 같은
 * 이유다. 누가 누구 이름으로 누를 수 있는지는 RLS가 본다
 * ("본인 이름으로만 좋아요한다", `supabase/migrations/0003_post_likes.sql:26-28`).
 */
export async function setPostLike(
	supabase: SupabaseClient<Database>,
	userId: string,
	input: { postId: unknown; intent: unknown },
): Promise<SetPostLikeResult> {
	const parsed = setPostLikeSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0].message };
	}

	const { postId, intent } = parsed.data;

	if (intent === "unlike") {
		const { error } = await supabase
			.from("post_likes")
			.delete()
			.match({ post_id: postId, user_id: userId });

		// 없는 행을 지우는 건 에러가 아니다. 이미 취소된 상태이므로 원하던 결과다
		if (error) {
			return {
				ok: false,
				error: "좋아요를 취소하지 못했어요. 잠시 뒤에 다시 해주세요",
			};
		}
		return { ok: true };
	}

	const { error } = await supabase
		.from("post_likes")
		.insert({ post_id: postId, user_id: userId });

	// 23505는 기본키 중복이다. 이미 눌렀다는 뜻이라 원하던 결과와 같다.
	// 빠르게 두 번 눌러 같은 의도가 겹쳐도 행은 하나다
	if (error && error.code !== "23505") {
		return {
			ok: false,
			error: "좋아요를 누르지 못했어요. 잠시 뒤에 다시 해주세요",
		};
	}

	return { ok: true };
}

export type UpdatePostResult = { ok: true } | { ok: false; error: string };

const updatePostSchema = z.object({
	postId: z.uuid("사라진 글이에요"),
	content: contentSchema(POST_CONTENT_MAX),
});

/**
 * 글 수정. 검증은 진입점이 아니라 여기서 한다 — 브라우저 검증은 친절함이지
 * 방어가 아니다(규칙 9). Next를 모르므로 테스트에서 그대로 부를 수 있다.
 *
 * 작성자를 받지 않는다. "이 글이 내 글인가"는 RLS가 본다
 * ("본인 게시글만 수정한다", `supabase/migrations/0001_init.sql:137-140`).
 * 앱 코드에 같은 체크를 한 벌 더 두지 않는다 (규칙 9).
 *
 * 남의 글을 고치려 하면 RLS가 행을 0개로 만들 뿐 에러를 주지 않는다.
 * `select()`로 바뀐 행을 받아 그 경우를 문구로 구분한다.
 */
export async function updatePost(
	supabase: SupabaseClient<Database>,
	input: { postId: unknown; content: unknown },
): Promise<UpdatePostResult> {
	const parsed = updatePostSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0].message };
	}

	const { data, error } = await supabase
		.from("posts")
		.update({ content: parsed.data.content })
		.eq("id", parsed.data.postId)
		.select("id")
		.maybeSingle();

	if (error) {
		return {
			ok: false,
			error: "글을 고치지 못했어요. 잠시 뒤에 다시 해주세요",
		};
	}
	if (!data) return { ok: false, error: "내가 쓴 글만 고칠 수 있어요" };

	return { ok: true };
}

export type DeletePostResult = { ok: true } | { ok: false; error: string };

/**
 * 글 삭제. 달린 댓글과 좋아요는 외래키의 `on delete cascade`가 같이 지운다
 * (`supabase/migrations/0001_init.sql:77`, `0003_post_likes.sql:7`).
 *
 * 권한과 0행 판정은 `updatePost`와 같다
 * ("본인 게시글만 지운다", `supabase/migrations/0001_init.sql:142-144`).
 */
export async function deletePost(
	supabase: SupabaseClient<Database>,
	input: unknown,
): Promise<DeletePostResult> {
	const parsed = z.uuid("사라진 글이에요").safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0].message };
	}

	const { data, error } = await supabase
		.from("posts")
		.delete()
		.eq("id", parsed.data)
		.select("id")
		.maybeSingle();

	if (error) {
		return {
			ok: false,
			error: "글을 지우지 못했어요. 잠시 뒤에 다시 해주세요",
		};
	}
	if (!data) return { ok: false, error: "내가 쓴 글만 지울 수 있어요" };

	return { ok: true };
}
