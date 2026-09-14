import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSessionUserId } from "@/lib/supabase/session";
import { escapeLike } from "@/lib/utils/escape-like";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * 별명이 이미 쓰이고 있는지 본다. 대소문자는 가리지 않는다. DB의 유일성도 `lower(display_name)`로 걸려 있다
 * (`supabase/migrations/0009_display_name_unique.sql`).
 * `profiles`는 "프로필은 누구나 본다"(0001_init.sql:117-119) 정책이라 익명으로도 조회된다.
 */
export async function isDisplayNameTaken(
	supabase: SupabaseClient<Database>,
	displayName: string,
): Promise<boolean> {
	const { data } = await supabase
		.from("profiles")
		.select("id")
		.ilike("display_name", escapeLike(displayName))
		.maybeSingle();

	return data !== null;
}

/**
 * 지금 로그인한 사람의 프로필. 세션이 없으면 null이다.
 *
 * `user_metadata.display_name`을 읽지 않는다 — 그건 가입 때 넣은 사본이고,
 * 별명의 출처는 `profiles` 테이블이다 (규칙 3).
 *
 * 사용자 id는 네트워크 없이 꺼낸다. 프록시가 이미 이 요청의 세션을 서버에 확인했으므로
 * 여기서 한 번 더 묻는 것은 왕복 하나를 그냥 버리는 일이었다. 결정 0023.
 */
export async function getCurrentProfile(
	supabase: SupabaseClient<Database>,
): Promise<Pick<Profile, "id" | "display_name" | "avatar_path"> | null> {
	const userId = await getSessionUserId(supabase);
	if (!userId) return null;

	const { data } = await supabase
		.from("profiles")
		.select("id, display_name, avatar_path")
		.eq("id", userId)
		.maybeSingle();

	return data;
}

/** 프로필 화면의 주인공. 팔로워 · 팔로잉 수를 같이 들고 온다 */
export type ProfileDetail = Pick<
	Profile,
	"id" | "display_name" | "avatar_path" | "bio"
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
	"id, display_name, avatar_path, bio, followers:follows!follows_following_id_fkey(count), following:follows!follows_follower_id_fkey(count)";

type ProfileDetailRow = Omit<
	ProfileDetail,
	"follower_count" | "following_count"
> & {
	followers: { count: number }[];
	following: { count: number }[];
};

/**
 * id로 찾는 프로필. 없으면 null이고, 화면은 그걸 404로 바꾼다.
 *
 * id를 먼저 검사한다. uuid가 아닌 주소가 오면 Postgres가 캐스팅에서 터져(22P02) 에러 화면으로 샌다.
 * 없는 사람과 이상한 주소는 같은 결과여야 한다. `getPost`(`lib/queries/post.ts`)와 같다.
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function getProfile(
	supabase: SupabaseClient<Database>,
	id: string,
): Promise<ProfileDetail | null> {
	if (!z.uuid().safeParse(id).success) return null;

	const { data, error } = await supabase
		.from("profiles")
		.select(PROFILE_DETAIL_SELECT)
		.eq("id", id)
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
