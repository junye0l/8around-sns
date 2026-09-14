import type { SupabaseClient } from "@supabase/supabase-js";
import { getSessionUserId } from "@/lib/supabase/session";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * 별명이 이미 쓰이고 있는지 본다.
 * `profiles`는 "프로필은 누구나 본다"(0001_init.sql:117-119) 정책이라 익명으로도 조회된다.
 */
export async function isUsernameTaken(
	supabase: SupabaseClient<Database>,
	username: string,
): Promise<boolean> {
	const { data } = await supabase
		.from("profiles")
		.select("id")
		.eq("username", username)
		.maybeSingle();

	return data !== null;
}

/**
 * 지금 로그인한 사람의 프로필. 세션이 없으면 null이다.
 *
 * `user_metadata.username`을 읽지 않는다 — 그건 가입 때 넣은 사본이고,
 * 별명의 출처는 `profiles` 테이블이다 (규칙 3).
 *
 * 사용자 id는 네트워크 없이 꺼낸다. 프록시가 이미 이 요청의 세션을 서버에 확인했으므로
 * 여기서 한 번 더 묻는 것은 왕복 하나를 그냥 버리는 일이었다. 결정 0023.
 */
export async function getCurrentProfile(
	supabase: SupabaseClient<Database>,
): Promise<Pick<
	Profile,
	"id" | "username" | "display_name" | "avatar_path"
> | null> {
	const userId = await getSessionUserId(supabase);
	if (!userId) return null;

	const { data } = await supabase
		.from("profiles")
		.select("id, username, display_name, avatar_path")
		.eq("id", userId)
		.maybeSingle();

	return data;
}

/** 프로필 화면의 주인공. 팔로워 · 팔로잉 수를 같이 들고 온다 */
export type ProfileDetail = Pick<
	Profile,
	"id" | "username" | "display_name" | "avatar_path" | "bio"
> & {
	follower_count: number;
	following_count: number;
};

/**
 * `follows`는 `profiles`를 두 번 참조하므로 어느 FK인지 알려줘야 한다.
 * 제약 이름의 출처는 `types/database.ts`의 `Relationships`다.
 *
 * 수를 DB에서 세어 온다. 화면에서 세려면 팔로우 행을 전부 받아야 하고
 * 그건 수만 보여주는 자리에 목록을 통째로 끌고 오는 일이다.
 */
const PROFILE_DETAIL_SELECT =
	"id, username, display_name, avatar_path, bio, followers:follows!follows_following_id_fkey(count), following:follows!follows_follower_id_fkey(count)";

type ProfileDetailRow = Omit<
	ProfileDetail,
	"follower_count" | "following_count"
> & {
	followers: { count: number }[];
	following: { count: number }[];
};

/**
 * 별명으로 찾는 프로필. 없으면 null이고, 화면은 그걸 404로 바꾼다.
 *
 * 주소가 uuid가 아니라 별명이라 `getPost`(`lib/queries/post.ts:61`)가 하는
 * 캐스팅 방어가 필요 없다. `username`은 text라 어떤 값이 와도 없는 것으로 끝난다.
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function getProfile(
	supabase: SupabaseClient<Database>,
	username: string,
): Promise<ProfileDetail | null> {
	const { data, error } = await supabase
		.from("profiles")
		.select(PROFILE_DETAIL_SELECT)
		.eq("username", username)
		.maybeSingle();

	if (error) throw new Error(`프로필을 읽지 못했다: ${error.message}`);
	if (!data) return null;

	// PostgREST는 집계를 배열 한 칸으로 돌려준다. 화면까지 그 모양을 들고 가지 않는다
	const { followers, following, ...profile } = data as ProfileDetailRow;
	return {
		...profile,
		follower_count: followers[0]?.count ?? 0,
		following_count: following[0]?.count ?? 0,
	};
}
