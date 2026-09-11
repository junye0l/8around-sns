import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type FeedPost = {
	id: string;
	content: string;
	created_at: string;
	author: { username: string; display_name: string };
};

/** 한 번에 읽어올 개수. 무한 스크롤은 범위 밖이라 첫 장만 본다 */
const FEED_LIMIT = 50;

/**
 * 피드. 최신순 단일 정렬이고 `posts_created_at_idx`가 그대로 받는다
 * (`supabase/migrations/0001_init.sql:70`).
 *
 * 작성자는 조인해서 같이 읽는다. 글마다 프로필을 따로 부르면 N+1이 된다.
 * 읽기 권한은 RLS가 본다 — "게시글은 누구나 본다"(같은 파일 126-128).
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function listFeed(
	supabase: SupabaseClient<Database>,
): Promise<FeedPost[]> {
	const { data, error } = await supabase
		.from("posts")
		.select("id, content, created_at, author:profiles(username, display_name)")
		.order("created_at", { ascending: false })
		.limit(FEED_LIMIT);

	if (error) throw new Error(`피드를 읽지 못했다: ${error.message}`);

	return data;
}
