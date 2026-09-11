import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database";

export type SetFollowResult = { ok: true } | { ok: false; error: string };

/**
 * `targetId`는 폼의 숨은 값이라 사용자가 바꿔 보낼 수 있다. 바꿔 봐야 다른 사람을
 * 팔로우할 뿐이고 그건 원래 되는 일이라 막지 않는다. 형식만 본다 —
 * uuid가 아니면 Postgres가 캐스팅에서 터지므로 여기서 걸러 문구로 돌려준다.
 *
 * `intent`는 버튼이 지금 보고 있는 상태에서 나온다. 서버가 현재 상태를 다시 읽어
 * 뒤집지 않는 이유는 그 읽기가 곧 낡기 때문이다. 두 번 눌러 같은 의도가 겹쳐도
 * 결과는 같다 — 아래 중복 처리가 받는다.
 */
const setFollowSchema = z.object({
	targetId: z.uuid("사라진 사람이에요"),
	intent: z.enum(["follow", "unfollow"], "알 수 없는 요청이에요"),
});

/**
 * 팔로우를 걸거나 푼다. 검증은 진입점이 아니라 여기서 한다 — 브라우저 검증은
 * 친절함이지 방어가 아니다(규칙 9). Next를 모르므로 테스트에서 그대로 부를 수 있다.
 *
 * `followerId`는 호출부가 세션에서 꺼내 준다. 폼에서 받지 않는다 —
 * `lib/services/post.ts`와 같은 이유다.
 *
 * 자기 자신은 세지 않는다. `follows_no_self` 제약
 * (`supabase/migrations/0001_init.sql:100`)이 DB에서 막으므로 여기 같은 체크를
 * 두지 않는다 (규칙 2, 9).
 */
export async function setFollow(
	supabase: SupabaseClient<Database>,
	followerId: string,
	input: { targetId: unknown; intent: unknown },
): Promise<SetFollowResult> {
	const parsed = setFollowSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0].message };
	}

	const { targetId, intent } = parsed.data;

	if (intent === "unfollow") {
		const { error } = await supabase
			.from("follows")
			.delete()
			.match({ follower_id: followerId, following_id: targetId });

		// 없는 행을 지우는 건 에러가 아니다. 이미 푼 상태이므로 원하던 결과다
		if (error) {
			return {
				ok: false,
				error: "팔로우를 풀지 못했어요. 잠시 뒤에 다시 해주세요",
			};
		}
		return { ok: true };
	}

	const { error } = await supabase
		.from("follows")
		.insert({ follower_id: followerId, following_id: targetId });

	// 23505는 기본키 중복이다. 이미 팔로우 중이라는 뜻이라 원하던 결과와 같다
	if (error && error.code !== "23505") {
		return { ok: false, error: "팔로우하지 못했어요. 잠시 뒤에 다시 해주세요" };
	}

	return { ok: true };
}
