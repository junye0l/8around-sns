"use server";

import { refresh } from "next/cache";
import {
	type UpdateProfileResult,
	updateProfile,
} from "@/lib/services/profile";
import { createClient } from "@/lib/supabase/server";
import { getSessionUserId } from "@/lib/supabase/session";

/**
 * 프로필 편집 진입점. 로그인 확인, services 호출, 화면 갱신.
 *
 * 이미지는 브라우저가 줄여서 이 폼에 싣는다. 본문 상한 1MB
 * (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md:83`) 안에 들어온다. 결정 0030.
 *
 * `refresh`를 쓰는 이유는 `lib/actions/post.ts`와 같다.
 */
export async function updateProfileAction(
	_prev: UpdateProfileResult | null,
	formData: FormData,
): Promise<UpdateProfileResult> {
	const supabase = await createClient();

	const userId = await getSessionUserId(supabase);
	if (!userId) {
		return { ok: false, error: "로그인이 풀렸어요. 다시 로그인해 주세요" };
	}

	const result = await updateProfile(supabase, userId, {
		displayName: formData.get("display_name"),
		avatar: formData.get("avatar"),
	});
	if (result.ok) refresh();

	return result;
}
