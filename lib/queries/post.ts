import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database";

export type FeedPost = {
	id: string;
	content: string;
	created_at: string;
	comment_count: number;
	author: { username: string; display_name: string };
};

/** 한 번에 읽어올 개수. 무한 스크롤은 범위 밖이라 첫 장만 본다 */
const FEED_LIMIT = 50;

/**
 * `comments(count)`는 글마다 댓글 수를 DB에서 세어 온다. 글을 읽고 나서 수를 따로
 * 물으면 N+1이 된다. `comments_post_id_idx`(0001_init.sql:88)가 그대로 받는다.
 */
const POST_SELECT =
	"id, content, created_at, author:profiles(username, display_name), comments(count)";

type PostRow = Omit<FeedPost, "comment_count"> & {
	comments: { count: number }[];
};

// PostgREST는 집계를 배열 한 칸으로 돌려준다. 화면까지 그 모양을 들고 가지 않는다
function toFeedPost({ comments, ...post }: PostRow): FeedPost {
	return { ...post, comment_count: comments[0]?.count ?? 0 };
}

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
		.select(POST_SELECT)
		.order("created_at", { ascending: false })
		.limit(FEED_LIMIT);

	if (error) throw new Error(`피드를 읽지 못했다: ${error.message}`);

	return data.map(toFeedPost);
}

/**
 * 게시글 하나. 없으면 null이고, 화면은 그걸 404로 바꾼다.
 *
 * id를 먼저 검사하는 이유: uuid가 아닌 주소로 들어오면 Postgres가 캐스팅에서
 * 터지고(22P02) 그건 에러 화면으로 샌다. 없는 글과 이상한 주소는 같은 결과여야 한다.
 */
export async function getPost(
	supabase: SupabaseClient<Database>,
	id: string,
): Promise<FeedPost | null> {
	if (!z.uuid().safeParse(id).success) return null;

	const { data, error } = await supabase
		.from("posts")
		.select(POST_SELECT)
		.eq("id", id)
		.maybeSingle();

	if (error) throw new Error(`글을 읽지 못했다: ${error.message}`);

	return data && toFeedPost(data);
}
