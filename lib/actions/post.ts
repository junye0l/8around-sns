"use server";

import { refresh } from "next/cache";
import {
	type CreatePostResult,
	createPost,
	type DeletePostResult,
	deletePost,
	type SetPostLikeResult,
	setPostLike,
	type UpdatePostResult,
	updatePost,
} from "@/lib/services/post";
import { createClient } from "@/lib/supabase/server";
import { getSessionUserId } from "@/lib/supabase/session";

/**
 * 작성 진입점. 로그인 확인 → services 호출 → 화면 갱신.
 *
 * 로그인 확인은 네트워크 없이 한다 (`lib/supabase/session.ts`, 결정 0023).
 *
 * `refresh`를 쓰는 이유: 피드는 쿠키를 읽어 요청마다 새로 그려지므로 무효화할
 * 캐시가 없다. 바뀐 건 캐시 밖의 DB 상태고, 그때 쓰는 게 `refresh`다
 * (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md:148`).
 */
export async function createPostAction(
	_prev: CreatePostResult | null,
	formData: FormData,
): Promise<CreatePostResult> {
	const supabase = await createClient();

	const userId = await getSessionUserId(supabase);
	if (!userId) {
		return { ok: false, error: "로그인이 풀렸어요. 다시 로그인해 주세요" };
	}

	const result = await createPost(supabase, userId, formData.get("content"));
	if (result.ok) refresh();

	return result;
}

/**
 * 좋아요 토글 진입점. 로그인 확인 → services 호출 → 화면 갱신.
 *
 * 하나의 액션이 양쪽을 다 한다. 누를 때와 취소할 때 인증도 갱신도 같고, 다른 것은
 * 서비스 안의 분기 하나뿐이다. 결정 0020.
 *
 * `refresh`를 쓰는 이유는 위와 같다.
 */
export async function setPostLikeAction(
	_prev: SetPostLikeResult | null,
	formData: FormData,
): Promise<SetPostLikeResult> {
	const supabase = await createClient();

	const userId = await getSessionUserId(supabase);
	if (!userId) {
		return { ok: false, error: "로그인이 풀렸어요. 다시 로그인해 주세요" };
	}

	const result = await setPostLike(supabase, userId, {
		postId: formData.get("post_id"),
		intent: formData.get("intent"),
	});
	if (result.ok) refresh();

	return result;
}

/**
 * 수정 진입점. 로그인 확인 → services 호출 → 화면 갱신.
 *
 * 소유권은 여기서 보지 않는다. RLS가 본다 (규칙 9). `lib/services/post.ts`의 `updatePost` 참고.
 *
 * `refresh`를 쓰는 이유는 위와 같다.
 */
export async function updatePostAction(
	_prev: UpdatePostResult | null,
	formData: FormData,
): Promise<UpdatePostResult> {
	const supabase = await createClient();

	const userId = await getSessionUserId(supabase);
	if (!userId) {
		return { ok: false, error: "로그인이 풀렸어요. 다시 로그인해 주세요" };
	}

	const result = await updatePost(supabase, {
		postId: formData.get("post_id"),
		content: formData.get("content"),
	});
	if (result.ok) refresh();

	return result;
}

/**
 * 삭제 진입점. 로그인 확인 → services 호출 → 화면 갱신.
 *
 * 소유권은 여기서 보지 않는다. RLS가 본다 (규칙 9). `lib/services/post.ts`의 `deletePost` 참고.
 *
 * `refresh`를 쓰는 이유는 위와 같다.
 */
export async function deletePostAction(
	_prev: DeletePostResult | null,
	formData: FormData,
): Promise<DeletePostResult> {
	const supabase = await createClient();

	const userId = await getSessionUserId(supabase);
	if (!userId) {
		return { ok: false, error: "로그인이 풀렸어요. 다시 로그인해 주세요" };
	}

	const result = await deletePost(supabase, formData.get("post_id"));
	if (result.ok) refresh();

	return result;
}
