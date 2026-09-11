import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

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
