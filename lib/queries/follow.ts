import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** 목록 한 줄에 필요한 만큼. 팔로워 · 팔로잉 두 화면이 같은 모양을 쓴다 */
export type FollowUser = {
	username: string;
	display_name: string;
	avatar_path: string | null;
	bio: string | null;
};

/**
 * `follows`는 `profiles`를 두 번 참조하므로 임베드에 어느 FK인지 알려줘야 한다.
 * 제약 이름의 출처는 `types/database.ts`의 `Relationships`다.
 */
const FOLLOWER_SELECT =
	"user:profiles!follows_follower_id_fkey(username, display_name, avatar_path, bio)";
const FOLLOWING_SELECT =
	"user:profiles!follows_following_id_fkey(username, display_name, avatar_path, bio)";

/** 한 번에 읽어올 개수. 페이지네이션은 범위 밖이라 첫 장만 본다 */
const LIST_LIMIT = 100;

type FollowRow = { user: FollowUser };

/**
 * 이 사람을 팔로우하는 사람들. 최근에 건 순이다.
 *
 * `follows_following_id_idx`(`supabase/migrations/0001_init.sql:105`)는 필터까지만
 * 받는다. `created_at` 정렬은 인덱스 밖이라 Postgres가 따로 한다 — `LIMIT 100`이라
 * top-N으로 끝난다. 팔로워가 수천을 넘으면 `(following_id, created_at desc)` 복합으로
 * 바꾼다. 결정 0012.
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function listFollowers(
	supabase: SupabaseClient<Database>,
	profileId: string,
): Promise<FollowUser[]> {
	const { data, error } = await supabase
		.from("follows")
		.select(FOLLOWER_SELECT)
		.eq("following_id", profileId)
		.order("created_at", { ascending: false })
		.limit(LIST_LIMIT);

	if (error) throw new Error(`팔로워를 읽지 못했다: ${error.message}`);

	return data.map((row: FollowRow) => row.user);
}

/**
 * 이 사람이 팔로우하는 사람들. 기본키 앞부분(`follower_id`)이 필터를 받는다
 * (`supabase/migrations/0001_init.sql:100`). 정렬은 위와 같아서 인덱스 밖이다.
 */
export async function listFollowing(
	supabase: SupabaseClient<Database>,
	profileId: string,
): Promise<FollowUser[]> {
	const { data, error } = await supabase
		.from("follows")
		.select(FOLLOWING_SELECT)
		.eq("follower_id", profileId)
		.order("created_at", { ascending: false })
		.limit(LIST_LIMIT);

	if (error) throw new Error(`팔로잉을 읽지 못했다: ${error.message}`);

	return data.map((row: FollowRow) => row.user);
}

/**
 * 내가 팔로우하는 사람들의 id. 팔로잉 피드가 이걸로 글을 거른다.
 *
 * `listFollowing`과 달리 프로필을 조인하지 않는다 — 여기서 필요한 것은 id뿐이고,
 * 화면에 이름을 띄우지 않는다.
 *
 * ponytail: 개수를 자르지 않는다. 자르면 누군가의 글이 조용히 사라진다. 대신
 * 팔로우가 수천이 되면 `in` 목록이 질의 문자열 길이에 걸린다. 그때는 뷰나
 * RPC로 옮긴다.
 */
export async function listFollowingIds(
	supabase: SupabaseClient<Database>,
	profileId: string,
): Promise<string[]> {
	const { data, error } = await supabase
		.from("follows")
		.select("following_id")
		.eq("follower_id", profileId);

	if (error) throw new Error(`팔로잉을 읽지 못했다: ${error.message}`);

	return data.map((row) => row.following_id);
}

/**
 * 내가 이 사람을 팔로우하고 있는지. 비로그인이면 볼 것도 없으므로 false다.
 *
 * 기본키로 한 행을 찍는다. 프로필과 같이 읽지 않는 이유는 이것만 보는 사람이
 * 다르기 때문이다 — 프로필은 누구에게나 같고, 이 값은 보는 사람마다 다르다.
 */
export async function isFollowing(
	supabase: SupabaseClient<Database>,
	followerId: string | null,
	followingId: string,
): Promise<boolean> {
	if (!followerId) return false;

	const { data } = await supabase
		.from("follows")
		.select("follower_id")
		.match({ follower_id: followerId, following_id: followingId })
		.maybeSingle();

	return data !== null;
}
