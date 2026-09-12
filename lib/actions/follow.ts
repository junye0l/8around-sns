"use server";

import { refresh } from "next/cache";
import { type SetFollowResult, setFollow } from "@/lib/services/follow";
import { createClient } from "@/lib/supabase/server";
import { getSessionUserId } from "@/lib/supabase/session";

/**
 * 팔로우 토글 진입점. 로그인 확인 → services 호출 → 화면 갱신.
 *
 * `refresh`를 쓰는 이유는 `lib/actions/post.ts`와 같다 — 이 화면들은 쿠키를 읽어
 * 요청마다 새로 그려지므로 무효화할 캐시가 없다
 * (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md:148`).
 */
export async function setFollowAction(
	_prev: SetFollowResult | null,
	formData: FormData,
): Promise<SetFollowResult> {
	const supabase = await createClient();

	const userId = await getSessionUserId(supabase);
	if (!userId) {
		return { ok: false, error: "로그인이 풀렸어요. 다시 로그인해 주세요" };
	}

	const result = await setFollow(supabase, userId, {
		targetId: formData.get("target_id"),
		intent: formData.get("intent"),
	});
	if (result.ok) refresh();

	return result;
}
