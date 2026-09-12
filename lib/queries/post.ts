import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { listFollowingIds } from "@/lib/queries/follow";
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
 *
 * 작성자 임베드에 FK 이름을 붙인다. `post_likes`가 `posts`와 `profiles`를 잇는
 * 조인 테이블이라 PostgREST가 둘 사이 관계를 둘로 본다 — 이름이 없으면
 * "more than one relationship was found"로 거절한다. `follows`가 이미 같은 이유로
 * 이름을 붙이고 있다 (`lib/queries/follow.ts:16`).
 */
const POST_SELECT =
	"id, content, created_at, author:profiles!posts_author_id_fkey(username, display_name), comments(count)";

type PostRow = Omit<FeedPost, "comment_count"> & {
	comments: { count: number }[];
};

// PostgREST는 집계를 배열 한 칸으로 돌려준다. 화면까지 그 모양을 들고 가지 않는다
function toFeedPost({ comments, ...post }: PostRow): FeedPost {
	return { ...post, comment_count: comments[0]?.count ?? 0 };
}

/**
 * 피드. 최신순 단일 정렬이고 `posts_created_at_idx`가 그대로 받는다
 * (`supabase/migrations/0001_init.sql:68`).
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

/** 팔로잉 피드의 결과. 빈 화면 문구가 두 가지라 무엇이 비었는지 구분해서 돌려준다 */
export type FollowingFeed = {
	posts: FeedPost[];
	/** 한 명도 팔로우하지 않은 상태. 팔로우는 했는데 글이 없는 것과 다르다 */
	followsAnyone: boolean;
};

/**
 * 내가 팔로우하는 사람들의 글만. 정렬과 개수는 추천 피드와 같다.
 *
 * 팔로우 목록을 먼저 읽고 `in`으로 거른다. PostgREST는 서브쿼리를 못 받고,
 * `posts`에서 `profiles`를 거쳐 `follows`까지 내려가는 중첩 임베드는 필터가 한 단
 * 더 깊어진다. 두 번 읽는 대신 모양이 단순하고, 아무도 팔로우하지 않았으면
 * 두 번째 쿼리를 아예 던지지 않는다.
 *
 * `posts_author_id_idx`(`supabase/migrations/0001_init.sql:69`)가 필터를 받는다.
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function listFollowingFeed(
	supabase: SupabaseClient<Database>,
	viewerId: string,
): Promise<FollowingFeed> {
	const followingIds = await listFollowingIds(supabase, viewerId);
	if (followingIds.length === 0) return { posts: [], followsAnyone: false };

	const { data, error } = await supabase
		.from("posts")
		.select(POST_SELECT)
		.in("author_id", followingIds)
		.order("created_at", { ascending: false })
		.limit(FEED_LIMIT);

	if (error) throw new Error(`팔로잉 피드를 읽지 못했다: ${error.message}`);

	return { posts: data.map(toFeedPost), followsAnyone: true };
}

/**
 * 한 사람이 쓴 글. 정렬과 개수는 추천 피드와 같다. 프로필 화면이 헤더 아래에 편다.
 *
 * `posts_author_id_idx`(`supabase/migrations/0001_init.sql:69`)가 필터를 받는다.
 *
 * 실패하면 던진다. 화면의 에러 상태는 `app/error.tsx`가 받는다 (규칙 10).
 */
export async function listPostsByAuthor(
	supabase: SupabaseClient<Database>,
	authorId: string,
): Promise<FeedPost[]> {
	const { data, error } = await supabase
		.from("posts")
		.select(POST_SELECT)
		.eq("author_id", authorId)
		.order("created_at", { ascending: false })
		.limit(FEED_LIMIT);

	if (error) throw new Error(`쓴 글을 읽지 못했다: ${error.message}`);

	return data.map(toFeedPost);
}
