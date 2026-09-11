import type { SupabaseClient } from "@supabase/supabase-js";
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
 */
export async function getCurrentProfile(
	supabase: SupabaseClient<Database>,
): Promise<Pick<Profile, "id" | "username" | "display_name"> | null> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const { data } = await supabase
		.from("profiles")
		.select("id, username, display_name")
		.eq("id", user.id)
		.maybeSingle();

	return data;
}
